import uuid
from pathlib import Path

from app.core.config import settings
from app.models.user import User

SYSTEM_TEMPLATE_ID = "00000000-0000-0000-0000-000000000001"


def _invoice_payload(**overrides):
    payload = {
        "template_id": SYSTEM_TEMPLATE_ID,
        "customer": {"name": "Test Müşteri"},
        "line_items": [{"description": "Hizmet", "quantity": "1", "unit_price": "100"}],
    }
    payload.update(overrides)
    return payload


def test_create_invoice_success(client, auth_headers: dict[str, str]):
    response = client.post("/api/v1/invoices", json=_invoice_payload(), headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["grand_total"] == "100.00"
    assert body["pdf_url"] is None


def test_create_invoice_over_free_limit_returns_402(client, auth_headers: dict[str, str]):
    for _ in range(5):
        response = client.post("/api/v1/invoices", json=_invoice_payload(), headers=auth_headers)
        assert response.status_code == 201

    response = client.post("/api/v1/invoices", json=_invoice_payload(), headers=auth_headers)
    assert response.status_code == 402


def test_download_pdf_not_ready_returns_404(client, auth_headers: dict[str, str]):
    create_response = client.post("/api/v1/invoices", json=_invoice_payload(), headers=auth_headers)
    invoice_id = create_response.json()["id"]

    response = client.get(f"/api/v1/invoices/{invoice_id}/download", headers=auth_headers)
    assert response.status_code == 404


def test_download_pdf_ready_returns_file(client, db_session, auth_headers: dict[str, str], tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "pdf_storage_dir", str(tmp_path))

    create_response = client.post("/api/v1/invoices", json=_invoice_payload(), headers=auth_headers)
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
