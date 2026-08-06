import uuid
from pathlib import Path

from app.core.config import settings
from app.models.invoice import InvoiceCustomer
from app.models.user import User

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
