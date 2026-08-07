import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, computed_field

from app.constants import COMPUTED_FIELD_KEYS
from app.models.template import FieldType, PageSize, TemplateEngine, TemplateFormat

Align = Literal["left", "center", "right"]


class LayoutFieldEntry(BaseModel):
    field_key: str
    x_mm: float = Field(ge=0)
    y_mm: float = Field(ge=0)
    width_mm: float = Field(gt=0)
    height_mm: float = Field(gt=0)
    font_size: int = Field(ge=6, le=72)
    bold: bool = False
    align: Align = "left"


class FieldMeta(BaseModel):
    field_type: FieldType
    label: str
    is_custom: bool = False
    default_value: str | None = None


class TemplateSavePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    page_size: PageSize = PageSize.A4
    layout_json: list[LayoutFieldEntry] = Field(default_factory=list)
    fields: dict[str, FieldMeta] = Field(default_factory=dict)


class XsltTemplateSavePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    target_format: TemplateFormat = TemplateFormat.GENERIC
    xslt_content: str = Field(min_length=1)
    fields: dict[str, FieldMeta] = Field(default_factory=dict)
    min_plan_key: str | None = None


class TemplateFieldResponse(BaseModel):
    id: uuid.UUID
    field_key: str
    field_type: FieldType
    label: str
    is_custom: bool
    default_value: str | None

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def is_computed(self) -> bool:
        return self.field_key in COMPUTED_FIELD_KEYS


class TemplateSummaryResponse(BaseModel):
    id: uuid.UUID
    name: str
    is_system_template: bool
    is_active: bool
    page_size: PageSize
    engine: TemplateEngine
    target_format: TemplateFormat
    min_plan_key: str | None
    updated_at: datetime

    model_config = {"from_attributes": True}


class TemplateDetailResponse(TemplateSummaryResponse):
    layout_json: list[LayoutFieldEntry]
    fields: list[TemplateFieldResponse]
    xslt_content: str | None
