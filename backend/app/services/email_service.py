import logging
import smtplib
from datetime import date
from email.message import EmailMessage
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings
from app.models.invoice import Invoice

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates_html"
_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=select_autoescape())

LABELS = {
    "tr": {
        "lang": "tr",
        "subject_prefix": "Fatura",
        "greeting": "Merhaba {customer_name},",
        "intro": "{sender_name} tarafınıza yeni bir fatura gönderdi. Fatura, bu e-postaya PDF olarak eklenmiştir. Aşağıda işlem detaylarını bulabilirsiniz.",
        "details_heading": "İşlem Detayları",
        "invoice_number": "Fatura Numarası",
        "amount": "Tutar",
        "due_date": "Vade Tarihi",
        "due_date_unset": "Belirtilmemiş",
        "action_heading": "Ne Yapmanız Gerekli?",
        "payment_line": "Ödeme bağlantısını kullanarak banka havalesi veya kredi kartı ile ödeme yapabilirsiniz.",
        "payment_button": "Ödeme Bağlantısına Git",
        "contact_line": "Eğer bu ödeme talebinin size yanlışlıkla gönderildiğini düşünüyorsanız, lütfen {contact_link}.",
        "contact_link_text": "bize ulaşın",
        "attachment_note": "Fatura PDF'i bu e-postaya ek olarak eklenmiştir. Herhangi bir sorunuz olursa bu e-postayı doğrudan yanıtlamayınız.",
        "footer": "Tüm hakları saklıdır.",
        "text_intro": "{sender_name} tarafınıza yeni bir fatura gönderdi.",
        "text_payment": "Ödeme bağlantısı",
        "text_contact": "Bu ödeme talebi size yanlışlıkla gönderildiyse",
        "text_attachment": "Fatura PDF'i bu e-postaya ek olarak eklenmiştir.",
        "text_regards": "Saygılarımızla,",
    },
    "en": {
        "lang": "en",
        "subject_prefix": "Invoice",
        "greeting": "Hello {customer_name},",
        "intro": "{sender_name} has sent you a new invoice. The invoice is attached to this email as a PDF. You can find the transaction details below.",
        "details_heading": "Transaction Details",
        "invoice_number": "Invoice Number",
        "amount": "Amount",
        "due_date": "Due Date",
        "due_date_unset": "Not specified",
        "action_heading": "What Do You Need To Do?",
        "payment_line": "You can pay via bank transfer or credit card using the payment link.",
        "payment_button": "Go to Payment Link",
        "contact_line": "If you believe this payment request was sent to you by mistake, please {contact_link}.",
        "contact_link_text": "contact us",
        "attachment_note": "The invoice PDF is attached to this email. Please do not reply directly to this email.",
        "footer": "All rights reserved.",
        "text_intro": "{sender_name} has sent you a new invoice.",
        "text_payment": "Payment link",
        "text_contact": "If this payment request was sent to you by mistake",
        "text_attachment": "The invoice PDF is attached to this email.",
        "text_regards": "Best regards,",
    },
}


def _labels_for(invoice: Invoice) -> dict[str, str]:
    locale = getattr(invoice.user, "locale", None)
    return LABELS.get(locale, LABELS["tr"])


def _render_bodies(to_email: str, invoice: Invoice) -> tuple[str, str]:
    labels = _labels_for(invoice)
    due_date_str = invoice.due_at.strftime("%d.%m.%Y") if invoice.due_at else labels["due_date_unset"]
    sender_name = invoice.user.company_name or invoice.user.full_name
    payment_url = f"{settings.frontend_url}/odeme?fatura={invoice.invoice_number}"
    contact_url = f"{settings.frontend_url}/iletisim"

    text_body = f"""{labels['greeting'].format(customer_name=invoice.customer.name)}

{labels['text_intro'].format(sender_name=sender_name)}

{labels['invoice_number']}: {invoice.invoice_number}
{labels['amount']}: {invoice.grand_total} {invoice.currency}
{labels['due_date']}: {due_date_str}

{labels['text_payment']}: {payment_url}
{labels['text_contact']}: {contact_url}

{labels['text_attachment']}

{labels['text_regards']}
{sender_name}
"""

    html_body = _env.get_template("email_invoice.html").render(
        labels=labels,
        customer_name=invoice.customer.name,
        sender_name=sender_name,
        invoice_number=invoice.invoice_number,
        grand_total=invoice.grand_total,
        currency=invoice.currency,
        due_date=due_date_str,
        payment_url=payment_url,
        contact_url=contact_url,
        current_year=date.today().year,
    )

    return text_body, html_body


def send_invoice_email(to_email: str, invoice: Invoice, pdf_bytes: bytes | None = None) -> bool:
    """Sends an invoice notification to `to_email` via SMTP.

    Returns True on genuine delivery success. When SMTP is not configured (local dev), the
    email is logged instead of sent and this still returns True so the send-flow can be
    exercised end-to-end without a real mail server.
    """
    if not settings.smtp_host:
        logger.info(
            "SMTP yapılandırılmamış — %s adresine %s faturası gönderilecekti (tutar: %s %s)",
            to_email,
            invoice.invoice_number,
            invoice.grand_total,
            invoice.currency,
        )
        return True

    text_body, html_body = _render_bodies(to_email, invoice)

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = f"{_labels_for(invoice)['subject_prefix']}: {invoice.invoice_number}"
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    if pdf_bytes:
        msg.add_attachment(
            pdf_bytes,
            maintype="application",
            subtype="pdf",
            filename=f"{invoice.invoice_number}.pdf",
        )

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
        return True
    except Exception as exc:
        logger.error(f"E-posta gönderilemedi ({to_email}): {exc}")
        return False
