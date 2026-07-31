import uuid
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.invoice import Invoice
from app.models.user import User
from app.schemas.invoice import InvoiceCreatePayload, InvoiceDetailResponse, InvoiceSummaryResponse
from app.services.invoice_service import create_invoice, get_own_invoice
from app.services.subscription_service import check_invoice_limit
from app.tasks.email_tasks import send_invoice_email_task
from app.tasks.pdf_tasks import generate_invoice_pdf_task

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.get("", response_model=list[InvoiceSummaryResponse])
def list_invoices(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[Invoice]:
    return (
        db.query(Invoice)
        .filter(Invoice.user_id == current_user.id)
        .order_by(Invoice.created_at.desc())
        .all()
    )


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


@router.get("/{invoice_id}/download")
def download_invoice_pdf(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> FileResponse:
    invoice = get_own_invoice(db, invoice_id, current_user)
    if invoice.pdf_url is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF henüz hazır değil")

    pdf_path = Path(settings.pdf_storage_dir) / invoice.pdf_url
    if not pdf_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF dosyası bulunamadı")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{invoice.invoice_number}.pdf",
    )


@router.post("/{invoice_id}/send-email", status_code=status.HTTP_202_ACCEPTED)
def send_invoice_email_endpoint(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    invoice = get_own_invoice(db, invoice_id, current_user)
    if invoice.customer.email is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Müşterinin e-posta adresi yok")

    send_invoice_email_task.delay(str(invoice.id), invoice.customer.email)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invoice(
    invoice_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    invoice = get_own_invoice(db, invoice_id, current_user)
    db.delete(invoice)
    db.commit()
