import uuid

from sqlalchemy.orm import Session

from app.models.template import InvoiceTemplateField
from app.schemas.template import FieldMeta


def reconcile_fields(
    db: Session,
    template_id: uuid.UUID,
    field_keys_in_layout: set[str],
    fields_meta: dict[str, FieldMeta],
) -> None:
    """Syncs invoice_template_fields with the field_keys referenced in a saved layout_json.

    Upserts a row for every field_key present in the layout (using the caller-supplied
    metadata, since the backend has no built-in field catalog of its own) and deletes rows
    for field_keys no longer referenced, so a later invoice-fill form never offers a field
    that isn't actually on the template.
    """
    existing = {
        field.field_key: field
        for field in db.query(InvoiceTemplateField).filter(InvoiceTemplateField.template_id == template_id)
    }

    for field_key in field_keys_in_layout:
        meta = fields_meta.get(field_key)
        if meta is None:
            continue

        existing_field = existing.get(field_key)
        if existing_field is not None:
            existing_field.field_type = meta.field_type
            existing_field.label = meta.label
            existing_field.default_value = meta.default_value
            existing_field.is_custom = meta.is_custom
        else:
            db.add(
                InvoiceTemplateField(
                    template_id=template_id,
                    field_key=field_key,
                    field_type=meta.field_type,
                    label=meta.label,
                    default_value=meta.default_value,
                    is_custom=meta.is_custom,
                )
            )

    for field_key, field in existing.items():
        if field_key not in field_keys_in_layout:
            db.delete(field)
