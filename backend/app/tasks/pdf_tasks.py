import logging
import uuid
from pathlib import Path

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.invoice import Invoice, InvoicePdfStatus
from app.models.template import InvoiceTemplate
from app.models.user import User
from app.services import pdf_service
from app.services.subscription_service import get_active_plan
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="generate_invoice_pdf")
def generate_invoice_pdf_task(invoice_id: str) -> None:
    db = SessionLocal()
    try:
        invoice = db.get(Invoice, uuid.UUID(invoice_id))
        if invoice is None:
            return

        template = db.get(InvoiceTemplate, invoice.template_id)
        if template is None:
            return

        try:
            user = db.get(User, invoice.user_id)
            show_watermark = user is not None and get_active_plan(db, user).key == "free"

            output_path = Path(settings.pdf_storage_dir) / f"{invoice.id}.pdf"
            pdf_service.generate_invoice_pdf(invoice, template, output_path, show_watermark)

            invoice.pdf_url = output_path.name
            invoice.pdf_status = InvoicePdfStatus.READY
            invoice.pdf_error = None
        except Exception as exc:
            logger.exception("PDF generation failed for invoice %s", invoice_id)
            invoice.pdf_status = InvoicePdfStatus.FAILED
            invoice.pdf_error = str(exc)[:1000]

        db.commit()
    finally:
        db.close()
