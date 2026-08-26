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


def test_render_v2_template_multi_bank_account_no_duplication(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    """Test that multiple bank-account elements (slots 1, 2, 3) render the table only once."""
    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    bank_account_1 = _create_bank_account(db_session, test_user)
    bank_account_2 = _create_bank_account(db_session, test_user)

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="V2 Multi Bank Template",
        is_system_template=False,
        layout_version=2,
        orientation="portrait",
        layout_json=[
            _text_element("el_1", "customer.name", "Müşteri", y=10),
            _bank_account_element("el_2", 1),
            _bank_account_element("el_3", 2),
            _bank_account_element("el_4", 3),
            _table_element("el_5"),
        ],
    )
    db_session.add(template)
    db_session.flush()
    db_session.commit()
    db_session.refresh(template)

    payload = InvoiceCreatePayload(
        template_id=template.id,
        customer_id=test_customer.id,
        bank_account_id=bank_account_1.id,
        bank_account_id_2=bank_account_2.id,
        line_items=[LineItemPayload(description="Hizmet", quantity="1", unit_price="100")],
    )
    invoice = create_invoice(db_session, test_user, payload)

    html = pdf_service.render_invoice_html(invoice, template)

    table_count = html.count("<table style=\"width:100%; border-collapse:collapse; font-size:8pt;\">")
    assert table_count == 1, f"Expected 1 bank-account table, found {table_count}"

    assert bank_account_1.iban in html
    assert bank_account_2.iban in html
    assert bank_account_1.bank_name in html
    assert bank_account_2.bank_name in html


def test_render_v2_template_resolves_new_totals_fields(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="V2 Totals Test Template",
        is_system_template=False,
        layout_version=2,
        orientation="portrait",
        layout_json=[
            _text_element("el_1", "totals.items_total", "Toplam Tutar", y=10),
            _text_element("el_2", "totals.tax_ex_amount", "Toplam Vergisiz Tutar", y=20),
            _text_element("el_3", "totals.total_tax", "Toplam Vergiler", y=30),
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
        line_items=[
            LineItemPayload(
                description="Danışmanlık Hizmeti",
                quantity="2",
                unit_price="100",
                discount_rate="10",
                tax_rate="18",
            )
        ],
    )
    invoice = create_invoice(db_session, test_user, payload)

    html = pdf_service.render_invoice_html(invoice, template)
    assert "212.40" in html  # totals.items_total: (200 - 20) + 32.4
    assert "200.00" in html  # totals.tax_ex_amount: quantity*unit_price before discount/tax
    assert "32.40" in html  # totals.total_tax: tax_amount + other_tax_amount


def _footer_text_element(element_id: str, content: str, y: float) -> dict:
    return {
        "id": element_id,
        "type": "text",
        "x_mm": 10,
        "y_mm": y,
        "width_mm": 100,
        "height_mm": 8,
        "rotation": 0,
        "z_index": 0,
        "locked": False,
        "hidden": False,
        "content": content,
        "font_size": 8,
        "font_weight": "normal",
        "font_style": "normal",
        "color": "#1a1a1a",
        "text_align": "left",
        "line_height": 1.3,
        "letter_spacing": 0,
    }


def test_render_v2_template_paginates_table_across_pages_when_items_overflow(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    table_element = _table_element("el_table")
    table_element["y_mm"] = 250
    table_element["height_mm"] = 30
    table_element["show_totals"] = True

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="V2 Pagination Test Template",
        is_system_template=False,
        layout_version=2,
        orientation="portrait",
        layout_json=[
            _text_element("el_header", "customer.name", "Müşteri Adı", y=10),
            table_element,
            _footer_text_element("el_notes", "Ödeme koşulları burada yazar.", y=256),
        ],
    )
    db_session.add(template)
    db_session.flush()
    db_session.commit()
    db_session.refresh(template)

    payload = InvoiceCreatePayload(
        template_id=template.id,
        customer_id=test_customer.id,
        line_items=[
            LineItemPayload(description=f"Kalem {i}", quantity="1", unit_price="10") for i in range(42)
        ],
    )
    invoice = create_invoice(db_session, test_user, payload)

    html = pdf_service.render_invoice_html(invoice, template)

    page_count = html.count('class="page')
    assert page_count > 1, "42 kalem tek sayfaya sığmamalı"
    assert html.count('class="page page-break"') == page_count - 1

    # Header tekrarlanan grup her sayfada görünmeli.
    assert html.count("Test Müşteri") == page_count

    # Footer grubu (notlar) sadece son sayfada bir kez görünmeli.
    assert html.count("Ödeme koşulları burada yazar.") == 1

    # Toplam KDV/Genel Toplam (tfoot) sadece son sayfada bir kez görünmeli.
    assert html.count("Genel Toplam") == 1

    # "Sayfa X/Y" göstergesi her sayfada bir kez.
    assert html.count(f"Sayfa 1/{page_count}") == 1
    assert html.count(f"Sayfa {page_count}/{page_count}") == 1

    # Hiçbir kalem kaybolmamalı/tekrarlanmamalı.
    for i in range(42):
        assert html.count(f"Kalem {i}</td>") == 1


def test_render_v2_template_single_page_unchanged_when_items_fit(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="V2 Single Page Test Template",
        is_system_template=False,
        layout_version=2,
        orientation="portrait",
        layout_json=[
            _text_element("el_header", "customer.name", "Müşteri Adı", y=10),
            _table_element("el_table"),
            _footer_text_element("el_notes", "Ödeme koşulları burada yazar.", y=140),
        ],
    )
    db_session.add(template)
    db_session.flush()
    db_session.commit()
    db_session.refresh(template)

    payload = InvoiceCreatePayload(
        template_id=template.id,
        customer_id=test_customer.id,
        line_items=[LineItemPayload(description="Hizmet", quantity="1", unit_price="100")],
    )
    invoice = create_invoice(db_session, test_user, payload)

    html = pdf_service.render_invoice_html(invoice, template)

    assert html.count('class="page') == 1
    assert 'class="page page-break"' not in html
    assert "Sayfa " not in html
    assert html.count("Ödeme koşulları burada yazar.") == 1


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


def test_render_v2_template_qrcode_invoice_info(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    """Test that qrcode element with data_source='invoice_info' combines invoice metadata into QR value."""
    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload
    from unittest.mock import patch

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="V2 QR Invoice Info Template",
        is_system_template=False,
        layout_version=2,
        orientation="portrait",
        layout_json=[
            {
                "id": "el_qr",
                "type": "qrcode",
                "x_mm": 10,
                "y_mm": 10,
                "width_mm": 30,
                "height_mm": 30,
                "rotation": 0,
                "z_index": 0,
                "locked": False,
                "hidden": False,
                "data_source": "invoice_info",
                "static_value": None,
            },
        ],
    )
    db_session.add(template)
    db_session.flush()
    db_session.commit()
    db_session.refresh(template)

    payload = InvoiceCreatePayload(
        template_id=template.id,
        customer_id=test_customer.id,
        line_items=[LineItemPayload(description="Hizmet", quantity="1", unit_price="100")],
    )
    invoice = create_invoice(db_session, test_user, payload)

    captured_qr_value = None

    def mock_qr_data_uri(value):
        nonlocal captured_qr_value
        captured_qr_value = value
        return "data:image/png;base64,fake"

    with patch("app.services.pdf_service._qr_data_uri", side_effect=mock_qr_data_uri):
        html = pdf_service.render_invoice_html(invoice, template)

    assert captured_qr_value is not None
    assert "Fatura No:" in captured_qr_value
    assert invoice.invoice_number in captured_qr_value
    assert "Firma Vergi No:" in captured_qr_value
    assert "Müşteri Vergi No:" in captured_qr_value
    assert "Fatura Tarihi:" in captured_qr_value
    assert "Genel Toplam:" in captured_qr_value
    assert invoice.currency in captured_qr_value


def test_promote_template(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    template = InvoiceTemplate(
        user_id=admin_user.id,
        name="Promosyon Testi Şablonu",
        is_system_template=False,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/promote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_system_template"] is True
    assert data["user_id"] is None
    assert data["is_active"] is True


def test_promote_template_not_own(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    other_user = User(
        email=f"{uuid.uuid4()}@example.com",
        password_hash=hash_password("testpassword123"),
        full_name="Other User",
        account_type=AccountType.BIREYSEL,
    )
    db_session.add(other_user)
    db_session.flush()
    ensure_default_subscription(db_session, other_user)
    db_session.commit()

    template = InvoiceTemplate(
        user_id=other_user.id,
        name="Başkasının Şablonu",
        is_system_template=False,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/promote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 404


def test_promote_template_already_system(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    template = InvoiceTemplate(
        user_id=None,
        name="Sistem Şablonu",
        is_system_template=True,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/promote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400
    assert "zaten sistem şablonu" in response.json()["detail"]


def test_promote_template_xslt(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    template = InvoiceTemplate(
        user_id=admin_user.id,
        name="XSLT Şablonu",
        is_system_template=False,
        engine="xslt",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/promote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400
    assert "görsel şablonlar" in response.json()["detail"]


def test_promote_template_not_admin(client, db_session, test_user):
    token = create_access_token(str(test_user.id))

    template = InvoiceTemplate(
        user_id=test_user.id,
        name="Şablonu",
        is_system_template=False,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/promote",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_demote_template(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    template = InvoiceTemplate(
        user_id=None,
        name="Demosyon Testi Şablonu",
        is_system_template=True,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/demote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_system_template"] is False
    assert data["user_id"] == str(admin_user.id)


def test_demote_template_not_system(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    template = InvoiceTemplate(
        user_id=admin_user.id,
        name="Kullanıcı Şablonu",
        is_system_template=False,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/demote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 404


def test_demote_template_xslt(client, db_session, test_user):
    admin_user = test_user
    admin_user.is_admin = True
    db_session.commit()
    admin_token = create_access_token(str(admin_user.id))

    template = InvoiceTemplate(
        user_id=None,
        name="XSLT Sistem Şablonu",
        is_system_template=True,
        engine="xslt",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/demote",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 400
    assert "admin panelinden" in response.json()["detail"]


def test_demote_template_not_admin(client, db_session, test_user):
    token = create_access_token(str(test_user.id))

    template = InvoiceTemplate(
        user_id=None,
        name="Sistem Şablonu",
        is_system_template=True,
        engine="visual",
        layout_json=[],
    )
    db_session.add(template)
    db_session.commit()
    template_id = template.id

    response = client.post(
        f"/api/v1/templates/{template_id}/demote",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
