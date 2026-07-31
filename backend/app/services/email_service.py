import logging
from pathlib import Path

from app.core.config import settings
from app.models.invoice import Invoice

logger = logging.getLogger(__name__)


def send_invoice_email(to_email: str, invoice: Invoice, pdf_path: Path) -> None:
    """Sends the invoice PDF to `to_email`.

    Real SMTP delivery is deferred until a provider is chosen — until `settings.smtp_host`
    is configured, this just logs what would have been sent so the rest of the pipeline
    (Celery task, endpoint, frontend button) can be built and tested end to end now.
    """
    if not settings.smtp_host:
        logger.info(
            "SMTP yapılandırılmamış — %s adresine %s faturası gönderilecekti (PDF: %s)",
            to_email,
            invoice.invoice_number,
            pdf_path,
        )
        return

    raise NotImplementedError("Gerçek SMTP gönderimi henüz uygulanmadı")
