import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings
from app.models.invoice import Invoice

logger = logging.getLogger(__name__)


def send_invoice_email(to_email: str, invoice: Invoice) -> None:
    """Sends an invoice notification to `to_email` via SMTP or logs if SMTP not configured."""
    if not settings.smtp_host:
        logger.info(
            "SMTP yapılandırılmamış — %s adresine %s faturası gönderilecekti (tutar: %s %s)",
            to_email,
            invoice.invoice_number,
            invoice.total,
            invoice.currency,
        )
        return

    due_date_str = invoice.due_at.strftime("%d.%m.%Y") if invoice.due_at else "Belirtilmemiş"
    body = f"""Merhaba,

Aşağıdaki fatura bilgisini bulabilirsiniz:

Fatura Numarası: {invoice.invoice_number}
Tutar: {invoice.grand_total} {invoice.currency}
Vade Tarihi: {due_date_str}

Saygılarımızla,
AxionOS Fatura Sistemi
"""

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = f"Fatura: {invoice.invoice_number}"
    msg.set_content(body)

    try:
        if settings.smtp_port == 465:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as smtp:
                if settings.smtp_user:
                    smtp.login(settings.smtp_user, settings.smtp_password)
                smtp.send_message(msg)
        else:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
                smtp.starttls()
                if settings.smtp_user:
                    smtp.login(settings.smtp_user, settings.smtp_password)
                smtp.send_message(msg)
        logger.info(f"E-posta gönderildi: {to_email} — {invoice.invoice_number}")
    except Exception as exc:
        logger.error(f"E-posta gönderilemedi ({to_email}): {exc}")
