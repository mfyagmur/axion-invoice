import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.template import InvoiceTemplate, InvoiceTemplateField
from app.models.user import User
from app.schemas.template import (
    TemplateDetailResponse,
    TemplateSavePayload,
    TemplateSummaryResponse,
)
from app.services.subscription_service import check_min_plan, check_template_limit
from app.services.template_service import reconcile_fields

router = APIRouter(prefix="/templates", tags=["templates"])


def _get_visible_template(db: Session, template_id: uuid.UUID, current_user: User) -> InvoiceTemplate:
    template = db.get(InvoiceTemplate, template_id)
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")
    if not template.is_system_template and template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")
    return template


def _get_own_template(db: Session, template_id: uuid.UUID, current_user: User) -> InvoiceTemplate:
    template = db.get(InvoiceTemplate, template_id)
    if template is None or template.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Şablon bulunamadı")
    if template.is_system_template:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sistem şablonları düzenlenemez")
    return template


@router.get("", response_model=list[TemplateSummaryResponse])
def list_templates(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[InvoiceTemplate]:
    return (
        db.query(InvoiceTemplate)
        .filter(
            or_(
                (InvoiceTemplate.user_id.is_(None)) & (InvoiceTemplate.is_active == True),
                InvoiceTemplate.user_id == current_user.id
            )
        )
        .order_by(InvoiceTemplate.is_system_template.desc(), InvoiceTemplate.updated_at.desc())
        .all()
    )


@router.get("/{template_id}", response_model=TemplateDetailResponse)
def get_template(
    template_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceTemplate:
    return _get_visible_template(db, template_id, current_user)


def _dynamic_field_keys(layout_json: list) -> set[str]:
    return {entry.field_key for entry in layout_json if entry.type == "dynamic-field"}


@router.post("", response_model=TemplateDetailResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    payload: TemplateSavePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceTemplate:
    check_template_limit(db, current_user)
    template = InvoiceTemplate(
        user_id=current_user.id,
        name=payload.name,
        is_system_template=False,
        page_size=payload.page_size,
        orientation=payload.orientation,
        layout_version=2,
        layout_json=[entry.model_dump() for entry in payload.layout_json],
    )
    db.add(template)
    db.flush()

    reconcile_fields(db, template.id, _dynamic_field_keys(payload.layout_json), payload.fields)

    db.commit()
    db.refresh(template)
    return template


@router.put("/{template_id}", response_model=TemplateDetailResponse)
def update_template(
    template_id: uuid.UUID,
    payload: TemplateSavePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceTemplate:
    template = _get_own_template(db, template_id, current_user)

    template.name = payload.name
    template.page_size = payload.page_size
    template.orientation = payload.orientation
    template.layout_version = 2
    template.layout_json = [entry.model_dump() for entry in payload.layout_json]

    reconcile_fields(db, template.id, _dynamic_field_keys(payload.layout_json), payload.fields)

    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    template = _get_own_template(db, template_id, current_user)
    db.delete(template)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Bu şablonu kullanan faturalar var"
        ) from exc


@router.post("/{template_id}/duplicate", response_model=TemplateDetailResponse, status_code=status.HTTP_201_CREATED)
def duplicate_template(
    template_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceTemplate:
    original = _get_visible_template(db, template_id, current_user)
    check_min_plan(db, current_user, original)
    check_template_limit(db, current_user)

    duplicate = InvoiceTemplate(
        user_id=current_user.id,
        name=f"{original.name} (kopya)",
        is_system_template=False,
        page_size=original.page_size,
        orientation=original.orientation,
        layout_version=original.layout_version,
        layout_json=list(original.layout_json),
        engine=original.engine,
        target_format=original.target_format,
        xslt_content=original.xslt_content,
        min_plan_key=None,
    )
    db.add(duplicate)
    db.flush()

    for field in original.fields:
        db.add(
            InvoiceTemplateField(
                template_id=duplicate.id,
                field_key=field.field_key,
                field_type=field.field_type,
                label=field.label,
                is_custom=field.is_custom,
                default_value=field.default_value,
            )
        )

    db.commit()
    db.refresh(duplicate)
    return duplicate
