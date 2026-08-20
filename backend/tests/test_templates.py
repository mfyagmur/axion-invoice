import uuid

from app.core.security import create_access_token, hash_password
from app.models.definitions import DefinitionBankAccount
from app.models.invoice import InvoiceCustomer
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.template import InvoiceTemplate
from app.models.user import AccountType, User
from app.services import pdf_service
from app.services.subscription_service import ensure_default_subscription

SYSTEM_TEMPLATE_ID = "00000000-0000-0000-0000-000000000001"


def _text_element(element_id: str, field_key: str, label: str, x: float = 10, y: float = 10) -> dict:
    return {
        "id": element_id,
        "type": "dynamic-field",
        "x_mm": x,
        "y_mm": y,
        "width_mm": 60,
        "height_mm": 8,
        "rotation": 0,
        "z_index": 0,
        "locked": False,
        "hidden": False,
        "field_key": field_key,
        "label": label,
        "font_size": 10,
        "font_weight": "normal",
        "font_style": "normal",
        "color": "#1a1a1a",
        "text_align": "left",
        "line_height": 1.3,
        "letter_spacing": 0,
        "is_custom": False,
        "default_value": None,
    }


def _bank_account_element(element_id: str, slot: int) -> dict:
    return {
        "id": element_id,
        "type": "bank-account",
        "x_mm": 10,
        "y_mm": 40,
        "width_mm": 60,
        "height_mm": 16,
        "rotation": 0,
        "z_index": 0,
        "locked": False,
        "hidden": False,
        "slot": slot,
        "font_size": 8,
        "text_align": "left",
        "color": "#1a1a1a",
    }


def _table_element(element_id: str) -> dict:
    return {
        "id": element_id,
        "type": "table",
        "x_mm": 10,
        "y_mm": 60,
        "width_mm": 180,
        "height_mm": 60,
        "rotation": 0,
        "z_index": 0,
        "locked": False,
        "hidden": False,
        "columns": [{"key": "description", "label": "Açıklama", "visible": True, "width_mm": 100, "align": "left"}],
        "header_font_size": 8,
        "header_bg_color": "#f1f5f9",
        "header_text_color": "#1a1a1a",
        "row_font_size": 8,
        "row_height_mm": 6,
        "border_color": "#cccccc",
        "border_width": 0.2,
        "zebra_striping": False,
        "currency_format": "#,##0.00",
        "number_format": "#,##0.##",
    }


def _create_bank_account(db_session, user: User) -> DefinitionBankAccount:
    bank_account = DefinitionBankAccount(
        user_id=user.id,
        bank_name="Test Bank",
        branch_name="Merkez",
        branch_code="001",
        currency="TRY",
        account_number="123456",
        iban=f"TR{uuid.uuid4().hex[:24].upper()}",
    )
    db_session.add(bank_account)
    db_session.flush()
    db_session.commit()
    db_session.refresh(bank_account)
    return bank_account


def _admin_headers(db_session) -> dict[str, str]:
    admin = User(
        email=f"{uuid.uuid4()}@example.com",
        password_hash=hash_password("testpassword123"),
        full_name="Admin User",
        account_type=AccountType.BIREYSEL,
        is_admin=True,
    )
    db_session.add(admin)
    db_session.flush()
    ensure_default_subscription(db_session, admin)
    db_session.commit()
    db_session.refresh(admin)
    token = create_access_token(str(admin.id))
    return {"Authorization": f"Bearer {token}"}


def test_create_v2_template_with_mixed_elements(client, auth_headers: dict[str, str]):
    payload = {
        "name": "Yeni Tasarım",
        "page_size": "a4",
        "orientation": "portrait",
        "layout_json": [
            _text_element("el_1", "customer.name", "Müşteri Adı"),
            _table_element("el_2"),
        ],
        "fields": {"customer.name": {"field_type": "text", "label": "Müşteri Adı", "is_custom": False}},
    }
    response = client.post("/api/v1/templates", json=payload, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["layout_version"] == 2
    assert body["orientation"] == "portrait"
    assert len(body["layout_json"]) == 2
    assert any(field["field_key"] == "customer.name" for field in body["fields"])


def test_update_v2_template_replaces_layout(client, auth_headers: dict[str, str]):
    create_payload = {
        "name": "Taslak",
        "page_size": "a4",
        "orientation": "portrait",
        "layout_json": [_text_element("el_1", "invoice.number", "Fatura No")],
        "fields": {"invoice.number": {"field_type": "text", "label": "Fatura No", "is_custom": False}},
    }
    created = client.post("/api/v1/templates", json=create_payload, headers=auth_headers).json()

    update_payload = {
        "name": "Güncellendi",
        "page_size": "a4",
        "orientation": "landscape",
        "layout_json": [],
        "fields": {},
    }
    response = client.put(f"/api/v1/templates/{created['id']}", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Güncellendi"
    assert body["orientation"] == "landscape"
    assert body["layout_json"] == []
    assert body["fields"] == []


def _upgrade_to_business(db_session, user: User) -> None:
    business_plan = db_session.query(Plan).filter(Plan.key == "business").first()
    subscription = db_session.query(Subscription).filter(Subscription.user_id == user.id).first()
    subscription.plan_id = business_plan.id
    db_session.commit()


def test_duplicate_carries_layout_version_and_orientation(client, db_session, auth_headers: dict[str, str], test_user: User):
    _upgrade_to_business(db_session, test_user)
    response = client.post(f"/api/v1/templates/{SYSTEM_TEMPLATE_ID}/duplicate", headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["layout_version"] == 1
    assert body["orientation"] == "portrait"


def test_user_facing_xslt_create_endpoint_removed(client, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/templates/xslt",
        json={"name": "X", "xslt_content": "<xsl:stylesheet/>"},
        headers=auth_headers,
    )
    # /templates/{template_id} still matches this path with template_id="xslt" for
    # GET/PUT/DELETE, so removing the POST handler surfaces as 405, not 404.
    assert response.status_code == 405


def test_admin_xslt_create_endpoint_still_works(client, db_session):
    headers = _admin_headers(db_session)
    xslt_content = '<?xml version="1.0"?><xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="/"><html/></xsl:template></xsl:stylesheet>'
    response = client.post(
        "/api/v1/admin/templates/xslt",
        json={"name": "Admin XSLT", "xslt_content": xslt_content},
        headers=headers,
    )
    assert response.status_code == 201


def test_render_v2_template_resolves_dynamic_fields_and_bank_account(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    bank_account = _create_bank_account(db_session, test_user)

    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="V2 Test Template",
        is_system_template=False,
        layout_version=2,
        orientation="portrait",
        layout_json=[
            _text_element("el_1", "customer.name", "Müşteri Adı"),
            _text_element("el_2", "totals.grand_total", "Genel Toplam", y=20),
            _bank_account_element("el_3", 1),
            _table_element("el_4"),
        ],
    )
    db_session.add(template)
    db_session.flush()
    db_session.commit()
    db_session.refresh(template)

    payload = InvoiceCreatePayload(
        template_id=template.id,
        customer_id=test_customer.id,
        bank_account_id=bank_account.id,
        line_items=[LineItemPayload(description="Danışmanlık Hizmeti", quantity="1", unit_price="500")],
    )
    invoice = create_invoice(db_session, test_user, payload)

    html = pdf_service.render_invoice_html(invoice, template)
    assert "Test Müşteri" in html
    assert "500.00" in html
    assert bank_account.iban in html
    assert "Danışmanlık Hizmeti" in html


def test_legacy_layout_version_1_system_template_still_renders(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    template = db_session.get(InvoiceTemplate, uuid.UUID(SYSTEM_TEMPLATE_ID))
    assert template.layout_version == 1

    payload = InvoiceCreatePayload(
        template_id=template.id,
        customer_id=test_customer.id,
        line_items=[LineItemPayload(description="Hizmet", quantity="1", unit_price="100")],
    )
    invoice = create_invoice(db_session, test_user, payload)

    html = pdf_service.render_invoice_html(invoice, template)
    assert "<!doctype html>" in html.lower()
