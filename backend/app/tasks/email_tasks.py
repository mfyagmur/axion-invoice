import uuid

from app.core.database import SessionLocal
from app.models.customer import CustomerContact
from app.models.invoice import Invoice
from app.services import email_service
from app.tasks.celery_app import celery_app


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

        for email in recipients:
            email_service.send_invoice_email(email, invoice)
    finally:
        db.close()
