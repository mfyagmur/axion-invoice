import uuid
from pathlib import Path

from app.core.config import settings
from app.core.security import hash_password
from app.models.definitions import DefinitionBankAccount
from app.models.invoice import InvoiceCustomer
from app.models.template import InvoiceTemplate
from app.models.user import AccountType, User
from app.services import pdf_service

SYSTEM_TEMPLATE_ID = "00000000-0000-0000-0000-000000000001"


def _invoice_payload(customer_id, **overrides):
    payload = {
        "template_id": SYSTEM_TEMPLATE_ID,
        "customer_id": customer_id,
        "line_items": [{"description": "Hizmet", "quantity": "1", "unit_price": "100"}],
    }
    payload.update(overrides)
    return payload


def test_create_invoice_success(client, auth_headers: dict[str, str], test_customer: InvoiceCustomer):
    response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    assert response.status_code == 201
    body = response.json()
    assert body["grand_total"] == "100.00"
    assert body["pdf_url"] is None


def test_create_invoice_over_free_limit_returns_402(
    client, auth_headers: dict[str, str], test_customer: InvoiceCustomer
):
    for _ in range(3):
        response = client.post(
            "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
        )
        assert response.status_code == 201

    response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    assert response.status_code == 402


def test_create_invoice_computes_discount_and_tax_per_line(
    client, auth_headers: dict[str, str], test_customer: InvoiceCustomer
):
    payload = _invoice_payload(
        str(test_customer.id),
        line_items=[
            {
                "description": "Hizmet",
                "quantity": "2",
                "unit_price": "100",
                "discount_rate": "10",
                "tax_rate": "20",
                "other_tax_amount": "5",
            }
        ],
    )
    response = client.post("/api/v1/invoices", json=payload, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["subtotal"] == "180.00"
    assert body["tax_total"] == "41.00"
    assert body["grand_total"] == "221.00"
    line_item = body["line_items"][0]
    assert line_item["discount_amount"] == "20.00"
    assert line_item["tax_amount"] == "36.00"
    assert line_item["line_total"] == "221.00"


def test_create_invoice_missing_customer_id_returns_422(client, auth_headers: dict[str, str]):
    payload = {
        "template_id": SYSTEM_TEMPLATE_ID,
        "line_items": [{"description": "Hizmet", "quantity": "1", "unit_price": "100"}],
    }
    response = client.post("/api/v1/invoices", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_invoice_nonexistent_customer_returns_404(client, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(uuid.uuid4())), headers=auth_headers
    )
    assert response.status_code == 404


def test_create_invoice_multiple_lines_sums_correctly(
    client, auth_headers: dict[str, str], test_customer: InvoiceCustomer
):
    payload = _invoice_payload(
        str(test_customer.id),
        line_items=[
            {"description": "Hizmet 1", "quantity": "1", "unit_price": "100", "tax_rate": "10"},
            {"description": "Hizmet 2", "quantity": "2", "unit_price": "50", "tax_rate": "20"},
        ],
    )
    response = client.post("/api/v1/invoices", json=payload, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["subtotal"] == "200.00"
    assert body["tax_total"] == "30.00"
    assert body["grand_total"] == "230.00"


def test_download_pdf_not_ready_returns_404(
    client, auth_headers: dict[str, str], test_customer: InvoiceCustomer
):
    create_response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    invoice_id = create_response.json()["id"]

    response = client.get(f"/api/v1/invoices/{invoice_id}/download", headers=auth_headers)
    assert response.status_code == 404


def test_download_pdf_ready_returns_file(
    client,
    db_session,
    auth_headers: dict[str, str],
    tmp_path,
    monkeypatch,
    test_customer: InvoiceCustomer,
):
    monkeypatch.setattr(settings, "pdf_storage_dir", str(tmp_path))

    create_response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    invoice_id = create_response.json()["id"]

    pdf_path = Path(tmp_path) / f"{invoice_id}.pdf"
    pdf_path.write_bytes(b"%PDF-1.4 fake pdf content")

    from app.models.invoice import Invoice

    invoice = db_session.get(Invoice, uuid.UUID(invoice_id))
    invoice.pdf_url = pdf_path.name
    db_session.commit()

    response = client.get(f"/api/v1/invoices/{invoice_id}/download", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


def test_invoice_number_uses_prefix_and_padding(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer, test_user: User
):
    test_user.invoice_prefix = "INV2026"
    test_user.invoice_number_padding = 5
    db_session.commit()

    response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    assert response.status_code == 201
    body = response.json()
    assert body["invoice_number"] == "INV202600001"


def test_invoice_number_increments_with_custom_settings(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer, test_user: User
):
    test_user.invoice_prefix = "FTR-"
    test_user.invoice_number_padding = 4
    db_session.commit()

    response1 = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    assert response1.status_code == 201
    assert response1.json()["invoice_number"] == "FTR-0001"

    response2 = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    assert response2.status_code == 201
    assert response2.json()["invoice_number"] == "FTR-0002"


def test_invoice_number_default_format(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer, test_user: User
):
    # Default: no prefix, 4-digit padding
    response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    assert response.status_code == 201
    body = response.json()
    # Should be just the number with 4-digit padding (not "INV-0001" anymore)
    assert body["invoice_number"] == "0001"


def _create_bank_account(db_session, user: User) -> DefinitionBankAccount:
    bank_account = DefinitionBankAccount(
        user_id=user.id,
        bank_name="Test Bank",
        branch_name="Merkez Şubesi",
        branch_code="001",
        currency="TRY",
        account_number="123456789",
        iban="TR330006100519786457841326",
    )
    db_session.add(bank_account)
    db_session.commit()
    db_session.refresh(bank_account)
    return bank_account


def test_create_invoice_with_bank_account(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer, test_user: User
):
    bank_account = _create_bank_account(db_session, test_user)

    response = client.post(
        "/api/v1/invoices",
        json=_invoice_payload(str(test_customer.id), bank_account_id=str(bank_account.id)),
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["bank_account_id"] == str(bank_account.id)
    assert body["bank_account"]["iban"] == bank_account.iban


def test_create_invoice_with_foreign_bank_account_returns_404(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer
):
    other_user = User(
        email=f"{uuid.uuid4()}@example.com",
        password_hash=hash_password("testpassword123"),
        full_name="Other User",
        account_type=AccountType.BIREYSEL,
    )
    db_session.add(other_user)
    db_session.commit()
    db_session.refresh(other_user)
    other_bank_account = _create_bank_account(db_session, other_user)

    response = client.post(
        "/api/v1/invoices",
        json=_invoice_payload(str(test_customer.id), bank_account_id=str(other_bank_account.id)),
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_invoice_sets_bank_account(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer, test_user: User
):
    bank_account = _create_bank_account(db_session, test_user)

    create_response = client.post(
        "/api/v1/invoices", json=_invoice_payload(str(test_customer.id)), headers=auth_headers
    )
    invoice_id = create_response.json()["id"]
    assert create_response.json()["bank_account_id"] is None

    response = client.patch(
        f"/api/v1/invoices/{invoice_id}",
        json={"bank_account_id": str(bank_account.id)},
        headers=auth_headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["bank_account_id"] == str(bank_account.id)
    assert body["pdf_status"] == "pending"


def test_render_invoice_html_includes_bank_account(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    bank_account = _create_bank_account(db_session, test_user)

    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    payload = InvoiceCreatePayload(
        template_id=uuid.UUID(SYSTEM_TEMPLATE_ID),
        customer_id=test_customer.id,
        bank_account_id=bank_account.id,
        line_items=[LineItemPayload(description="Hizmet", quantity="1", unit_price="100")],
    )
    invoice = create_invoice(db_session, test_user, payload)
    template = db_session.get(InvoiceTemplate, uuid.UUID(SYSTEM_TEMPLATE_ID))

    html = pdf_service.render_invoice_html(invoice, template)
    assert bank_account.iban in html


def test_create_invoice_with_three_bank_accounts(
    client, db_session, auth_headers: dict[str, str], test_customer: InvoiceCustomer, test_user: User
):
    bank_account_1 = _create_bank_account(db_session, test_user)
    bank_account_2 = _create_bank_account(db_session, test_user)
    bank_account_3 = _create_bank_account(db_session, test_user)

    response = client.post(
        "/api/v1/invoices",
        json=_invoice_payload(
            str(test_customer.id),
            bank_account_id=str(bank_account_1.id),
            bank_account_id_2=str(bank_account_2.id),
            bank_account_id_3=str(bank_account_3.id),
        ),
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["bank_account"]["iban"] == bank_account_1.iban
    assert body["bank_account_2"]["iban"] == bank_account_2.iban
    assert body["bank_account_3"]["iban"] == bank_account_3.iban


def test_render_invoice_html_includes_all_three_bank_accounts(
    db_session, test_customer: InvoiceCustomer, test_user: User
):
    bank_account_1 = _create_bank_account(db_session, test_user)
    bank_account_2 = _create_bank_account(db_session, test_user)
    bank_account_3 = _create_bank_account(db_session, test_user)

    from app.services.invoice_service import create_invoice
    from app.schemas.invoice import InvoiceCreatePayload, LineItemPayload

    payload = InvoiceCreatePayload(
        template_id=uuid.UUID(SYSTEM_TEMPLATE_ID),
        customer_id=test_customer.id,
        bank_account_id=bank_account_1.id,
        bank_account_id_2=bank_account_2.id,
        bank_account_id_3=bank_account_3.id,
        line_items=[LineItemPayload(description="Hizmet", quantity="1", unit_price="100")],
    )
    invoice = create_invoice(db_session, test_user, payload)
    template = db_session.get(InvoiceTemplate, uuid.UUID(SYSTEM_TEMPLATE_ID))

    html = pdf_service.render_invoice_html(invoice, template)
    assert bank_account_1.iban in html
    assert bank_account_2.iban in html
    assert bank_account_3.iban in html
