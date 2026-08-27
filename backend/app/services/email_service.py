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


REMINDER_LABELS = {
    "tr": {
        "lang": "tr",
        "subject": "{sender_name} tarafından gönderilen {invoice_number} numaralı fatura için ödeme hatırlatması",
        "greeting": "Merhaba {customer_name},",
        "outstanding_notice": "{sender_name} tarafından Axion Invoice üzerinden düzenlenen {invoice_number} numaralı fatura, şu anda ödenmemiş görünmektedir.",
        "amount": "Tutar",
        "issued_date": "Düzenlenme Tarihi",
        "payment_line": "Faturayı aşağıdaki bağlantı üzerinden güvenli bir şekilde görüntüleyip ödeyebilirsiniz.",
        "payment_button": "Şimdi Öde",
        "already_paid_note": "Ödemeyi zaten gerçekleştirdiyseniz bu mesajı dikkate almayabilirsiniz.",
        "contact_line": "Bu mesaj size yanlışlıkla ulaştıysa veya yardıma ihtiyacınız varsa {contact_link}.",
        "contact_link_text": "Axion destek ekibiyle iletişime geçin",
        "footer": "Tüm hakları saklıdır.",
        "text_regards": "Saygılarımızla,",
    },
    "en": {
        "lang": "en",
        "subject": "Payment due for invoice {invoice_number} from {sender_name}",
        "greeting": "Hi {customer_name},",
        "outstanding_notice": "This is a reminder that Invoice {invoice_number}, issued by {sender_name} through Axion Invoice, is currently outstanding.",
        "amount": "Amount",
        "issued_date": "Issued on",
        "payment_line": "You can view and pay the invoice securely through the link below.",
        "payment_button": "Pay Now",
        "already_paid_note": "If you've already completed the payment, you can disregard this message.",
        "contact_line": "If this message reached you by mistake or you need help, feel free to {contact_link}.",
        "contact_link_text": "contact Axion support",
        "footer": "All rights reserved.",
        "text_regards": "Sincerely,",
    },
}


def _labels_for(invoice: Invoice, labels_dict: dict[str, dict[str, str]] = LABELS) -> dict[str, str]:
    locale = getattr(invoice.user, "locale", None)
    return labels_dict.get(locale, labels_dict["tr"])


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


def _dispatch_email(
    to_email: str,
    subject: str,
    text_body: str,
    html_body: str,
    pdf_bytes: bytes | None = None,
    log_context: str = "",
) -> bool:
    """Sends a rendered email via SMTP.

    Returns True on genuine delivery success. When SMTP is not configured (local dev), the
    email is logged instead of sent and this still returns True so the send-flow can be
    exercised end-to-end without a real mail server.
    """
    if not settings.smtp_host:
        logger.info("SMTP yapılandırılmamış — %s adresine gönderilecekti (%s)", to_email, log_context)
        return True

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    if pdf_bytes:
        msg.add_attachment(
            pdf_bytes,
            maintype="application",
            subtype="pdf",
            filename=f"{log_context or 'invoice'}.pdf",
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
        logger.info(f"E-posta gönderildi: {to_email} — {log_context}")
        return True
    except Exception as exc:
        logger.error(f"E-posta gönderilemedi ({to_email}): {exc}")
        return False


def send_invoice_email(to_email: str, invoice: Invoice, pdf_bytes: bytes | None = None) -> bool:
    """Sends an invoice notification to `to_email` via SMTP."""
    text_body, html_body = _render_bodies(to_email, invoice)
    subject = f"{_labels_for(invoice)['subject_prefix']}: {invoice.invoice_number}"
    return _dispatch_email(to_email, subject, text_body, html_body, pdf_bytes, log_context=invoice.invoice_number)


def _render_reminder_bodies(invoice: Invoice) -> tuple[str, str, str]:
    labels = _labels_for(invoice, REMINDER_LABELS)
    sender_name = invoice.user.company_name or invoice.user.full_name
    issued_date_str = invoice.issued_at.strftime("%d.%m.%Y") if invoice.issued_at else invoice.created_at.strftime(
        "%d.%m.%Y"
    )
    payment_url = f"{settings.frontend_url}/odeme?fatura={invoice.invoice_number}"
    contact_url = f"{settings.frontend_url}/iletisim"

    subject = labels["subject"].format(invoice_number=invoice.invoice_number, sender_name=sender_name)

    text_body = f"""{labels['greeting'].format(customer_name=invoice.customer.name)}

{labels['outstanding_notice'].format(invoice_number=invoice.invoice_number, sender_name=sender_name)}

{labels['amount']}: {invoice.grand_total} {invoice.currency}
{labels['issued_date']}: {issued_date_str}

{labels['payment_button']}: {payment_url}

{labels['already_paid_note']}

{labels['text_regards']}
{sender_name}
"""

    html_body = _env.get_template("email_payment_reminder.html").render(
        labels=labels,
        customer_name=invoice.customer.name,
        sender_name=sender_name,
        invoice_number=invoice.invoice_number,
        grand_total=invoice.grand_total,
        currency=invoice.currency,
        issued_date=issued_date_str,
        payment_url=payment_url,
        contact_url=contact_url,
        current_year=date.today().year,
    )

    return subject, text_body, html_body


def send_payment_reminder_email(to_email: str, invoice: Invoice, step_index: int) -> bool:
    """Sends a payment-reminder notification (7/10/13-day chaser) to `to_email` via SMTP."""
    subject, text_body, html_body = _render_reminder_bodies(invoice)
    return _dispatch_email(
        to_email, subject, text_body, html_body, log_context=f"{invoice.invoice_number} reminder#{step_index}"
    )
