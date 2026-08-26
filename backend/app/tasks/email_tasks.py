import logging
import uuid
from datetime import UTC, datetime
from pathlib import Path

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.customer import CustomerContact
from app.models.invoice import Invoice, InvoicePdfStatus
from app.services import email_service
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _resolve_pdf_bytes(db, invoice: Invoice) -> bytes | None:
    """Reads the invoice PDF for email attachment if it is already generated.

    Never triggers generation itself: `generate_invoice_pdf_task` / retry-pdf own that
    responsibility exclusively, and racing a second Playwright render against theirs for the
    same output file caused pdf_status to get stuck on "pending" (see docs/todo.md).
    """
    if invoice.pdf_status != InvoicePdfStatus.READY:
        logger.info("PDF henüz hazır değil (invoice %s) — mail ek olmadan gönderilecek", invoice.id)
        return None

    output_path = Path(settings.pdf_storage_dir) / f"{invoice.id}.pdf"
    try:
        return output_path.read_bytes()
    except OSError:
        logger.exception("Mail eki için PDF okunamadı (invoice %s)", invoice.id)
        return None


@celery_app.task(name="send_invoice_email")
def send_invoice_email_task(invoice_id: str) -> None:
    db = SessionLocal()
    try:
        invoice = db.get(Invoice, uuid.UUID(invoice_id))
        if invoice is None:
            return

        recipients = set()

        if invoice.customer.email:
            recipients.add(invoice.customer.email)

        if invoice.recipient_contact_ids:
            for contact_id in invoice.recipient_contact_ids:
                contact = db.get(CustomerContact, uuid.UUID(contact_id))
                if contact and contact.email:
                    recipients.add(contact.email)

        pdf_bytes = _resolve_pdf_bytes(db, invoice)

        successful_recipients = []
        for email in recipients:
            if email_service.send_invoice_email(email, invoice, pdf_bytes):
                successful_recipients.append(email)

        if successful_recipients:
            invoice.email_sent_at = datetime.now(UTC)
            invoice.email_sent_to = sorted(successful_recipients)

        db.commit()
    finally:
        db.close()
