import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.template import InvoiceTemplate, TemplateEngine
from app.models.user import User
from app.schemas.template import TemplateSummaryResponse, XsltTemplateSavePayload, TemplateDetailResponse
from app.services import xslt_service
from app.services.template_service import reconcile_fields
from app.services.xslt_service import XsltValidationError

router = APIRouter(prefix="/admin/templates", tags=["admin-templates"])


def _get_system_template(db: Session, template_id: uuid.UUID) -> InvoiceTemplate:
    template = db.get(InvoiceTemplate, template_id)
    if template is None or not template.is_system_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")
    return template


@router.get("", response_model=list[TemplateSummaryResponse])
def list_system_templates(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> list[InvoiceTemplate]:
    return (
        db.query(InvoiceTemplate)
        .filter(InvoiceTemplate.is_system_template.is_(True))
        .order_by(InvoiceTemplate.updated_at.desc())
        .all()
    )


@router.post("/xslt", response_model=TemplateDetailResponse, status_code=status.HTTP_201_CREATED)
def create_system_xslt_template(
    payload: XsltTemplateSavePayload,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceTemplate:
    try:
        xslt_service.validate_xslt(payload.xslt_content)
    except XsltValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    template = InvoiceTemplate(
        user_id=None,
        name=payload.name,
        is_system_template=True,
        engine=TemplateEngine.XSLT,
        target_format=payload.target_format,
        xslt_content=payload.xslt_content,
        layout_json=[],
        min_plan_key=payload.min_plan_key,
    )
    db.add(template)
    db.flush()

    reconcile_fields(db, template.id, set(payload.fields.keys()), payload.fields)

    db.commit()
    db.refresh(template)
    return template


@router.put("/xslt/{template_id}", response_model=TemplateDetailResponse)
def update_system_xslt_template(
    template_id: uuid.UUID,
    payload: XsltTemplateSavePayload,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceTemplate:
    template = _get_system_template(db, template_id)

    try:
        xslt_service.validate_xslt(payload.xslt_content)
    except XsltValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    template.name = payload.name
    template.target_format = payload.target_format
    template.xslt_content = payload.xslt_content
    template.min_plan_key = payload.min_plan_key

    reconcile_fields(db, template.id, set(payload.fields.keys()), payload.fields)

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_system_template(
    template_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    template = _get_system_template(db, template_id)
    db.delete(template)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Bu şablonu kullanan faturalar var"
        ) from exc
