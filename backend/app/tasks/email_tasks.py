import uuid
from pathlib import Path

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.invoice import Invoice
from app.services import email_service
from app.tasks.celery_app import celery_app


@celery_app.task(name="send_invoice_email")
def send_invoice_email_task(invoice_id: str, to_email: str) -> None:
    db = SessionLocal()
    try:
        invoice = db.get(Invoice, uuid.UUID(invoice_id))
        if invoice is None:
            return

        email_service.send_invoice_email(to_email, invoice)
    finally:
        db.close()
