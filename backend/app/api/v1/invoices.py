import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.invoice import Invoice, InvoicePdfStatus, InvoiceStatus
from app.models.template import InvoiceTemplate
from app.models.user import User
from app.schemas.invoice import InvoiceCreatePayload, InvoiceDetailResponse, InvoiceSummaryResponse, InvoiceUpdatePayload
from app.services import pdf_service
from app.services.invoice_service import build_preview_invoice, create_invoice, get_own_invoice, update_invoice
from app.services.subscription_service import check_invoice_limit, get_active_plan
from app.tasks.email_tasks import send_invoice_email_task
from app.tasks.pdf_tasks import generate_invoice_pdf_task

router = APIRouter(prefix="/invoices", tags=["invoices"])

# Seeded system template "Classic" (see b3f9e7a2c114_seed_v2_system_templates.py) —
# demo accounts always preview against this template regardless of their invoice's actual template.
DEMO_PREVIEW_TEMPLATE_ID = "00000000-0000-0000-0000-000000000010"


@router.get("", response_model=list[InvoiceSummaryResponse])
def list_invoices(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    customer_id: uuid.UUID | None = Query(None),
) -> list[Invoice]:
    query = db.query(Invoice).filter(Invoice.user_id == current_user.id)
    if customer_id is not None:
        query = query.filter(Invoice.customer_id == customer_id)
    return query.order_by(Invoice.created_at.desc()).all()


@router.post("", response_model=InvoiceDetailResponse, status_code=status.HTTP_201_CREATED)
def create_invoice_endpoint(
    payload: InvoiceCreatePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    check_invoice_limit(db, current_user)
    invoice = create_invoice(db, current_user, payload)
    generate_invoice_pdf_task.delay(str(invoice.id))
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceDetailResponse)
def get_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    return get_own_invoice(db, invoice_id, current_user)


@router.patch("/{invoice_id}", response_model=InvoiceDetailResponse)
def update_invoice_endpoint(
    invoice_id: uuid.UUID,
    payload: InvoiceUpdatePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = update_invoice(db, current_user, invoice_id, payload)
    if invoice.pdf_status == InvoicePdfStatus.PENDING:
        generate_invoice_pdf_task.delay(str(invoice.id))
    return invoice


@router.get("/{invoice_id}/download")
def download_invoice_pdf(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> FileResponse:
    invoice = get_own_invoice(db, invoice_id, current_user)
    template = db.get(InvoiceTemplate, invoice.template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")

    show_watermark = get_active_plan(db, current_user).key == "free"
    output_path = Path(settings.pdf_storage_dir) / f"{invoice.id}.pdf"
    try:
        pdf_service.generate_invoice_pdf(invoice, template, output_path, show_watermark)
        invoice.pdf_url = output_path.name
        invoice.pdf_status = InvoicePdfStatus.READY
        invoice.pdf_error = None
        db.commit()
    except Exception as exc:
        invoice.pdf_status = InvoicePdfStatus.FAILED
        invoice.pdf_error = str(exc)[:1000]
        db.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PDF üretilemedi") from exc

    return FileResponse(
        path=output_path,
        media_type="application/pdf",
        filename=f"{invoice.invoice_number}.pdf",
    )


@router.post("/preview", response_class=HTMLResponse)
def preview_invoice_draft(
    payload: InvoiceCreatePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> HTMLResponse:
    invoice = build_preview_invoice(db, current_user, payload)
    template = db.get(InvoiceTemplate, payload.template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")

    show_watermark = get_active_plan(db, current_user).key == "free"
    html = pdf_service.render_invoice_html(invoice, template, show_watermark)
    return HTMLResponse(content=html)


@router.get("/{invoice_id}/preview", response_class=HTMLResponse)
def preview_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> HTMLResponse:
    invoice = get_own_invoice(db, invoice_id, current_user)
    if current_user.is_demo:
        template = db.get(InvoiceTemplate, uuid.UUID(DEMO_PREVIEW_TEMPLATE_ID))
    else:
        template = db.get(InvoiceTemplate, invoice.template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")

    show_watermark = current_user.is_demo or get_active_plan(db, current_user).key == "free"
    html = pdf_service.render_invoice_html(invoice, template, show_watermark)
    return HTMLResponse(content=html)


@router.post("/{invoice_id}/retry-pdf", response_model=InvoiceDetailResponse)
def retry_invoice_pdf(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    invoice.pdf_status = InvoicePdfStatus.PENDING
    invoice.pdf_error = None
    db.commit()
    db.refresh(invoice)
    generate_invoice_pdf_task.delay(str(invoice.id))
    return invoice


@router.post("/{invoice_id}/send-email", status_code=status.HTTP_202_ACCEPTED)
def send_invoice_email_endpoint(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    invoice = get_own_invoice(db, invoice_id, current_user)

    has_company_email = invoice.customer.email is not None
    has_contacts = bool(invoice.recipient_contact_ids)

    if not has_company_email and not has_contacts:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alıcı e-posta adresi yok")

    send_invoice_email_task.delay(str(invoice.id))


@router.post("/{invoice_id}/payment-reminder/activate", response_model=InvoiceDetailResponse)
def activate_payment_reminder(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    invoice.payment_reminder_active = True
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/payment-reminder/deactivate", response_model=InvoiceDetailResponse)
def deactivate_payment_reminder(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    invoice.payment_reminder_active = False
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/cancel", response_model=InvoiceDetailResponse)
def cancel_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    if invoice.status == InvoiceStatus.PAID:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ödenmiş fatura iptal edilemez")
    if invoice.status == InvoiceStatus.DRAFT and invoice.payment_reminder_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ödeme hatırlatıcısı aktif olan taslak fatura iptal edilemez",
        )
    invoice.status = InvoiceStatus.CANCELLED
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/restore", response_model=InvoiceDetailResponse)
def restore_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    if invoice.status != InvoiceStatus.CANCELLED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sadece iptal edilmiş fatura geri alınabilir")
    invoice.status = InvoiceStatus.DRAFT
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/archive", response_model=InvoiceDetailResponse)
def archive_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    invoice.archived = True
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/unarchive", response_model=InvoiceDetailResponse)
def unarchive_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> Invoice:
    invoice = get_own_invoice(db, invoice_id, current_user)
    invoice.archived = False
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    invoice = get_own_invoice(db, invoice_id, current_user)
    db.delete(invoice)
    db.commit()
