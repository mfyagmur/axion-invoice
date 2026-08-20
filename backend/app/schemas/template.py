import uuid
from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, computed_field

from app.constants import COMPUTED_FIELD_KEYS
from app.models.template import FieldType, PageSize, TemplateEngine, TemplateFormat

Align = Literal["left", "center", "right"]
ObjectFit = Literal["contain", "cover", "original"]
Orientation = Literal["portrait", "landscape"]


# ---------------------------------------------------------------------------
# Legacy (layout_version=1) shape — kept only so existing rows still validate
# and render through the old Jinja path. Never produced by the new designer.
# ---------------------------------------------------------------------------


class LayoutFieldEntry(BaseModel):
    field_key: str
    x_mm: float = Field(ge=0)
    y_mm: float = Field(ge=0)
    width_mm: float = Field(gt=0)
    height_mm: float = Field(gt=0)
    font_size: int = Field(ge=6, le=72)
    bold: bool = False
    align: Align = "left"


# ---------------------------------------------------------------------------
# v2 element model — a discriminated union stored as a flat list in layout_json.
# ---------------------------------------------------------------------------


class BaseElement(BaseModel):
    id: str
    x_mm: float = Field(ge=0)
    y_mm: float = Field(ge=0)
    width_mm: float = Field(gt=0)
    height_mm: float = Field(gt=0)
    rotation: float = 0
    z_index: int = 0
    locked: bool = False
    hidden: bool = False


class TextElement(BaseElement):
    type: Literal["text"] = "text"
    content: str = ""
    font_size: int = Field(default=11, ge=6, le=72)
    font_family: str = "Arial, Helvetica, sans-serif"
    font_weight: Literal["normal", "bold"] = "normal"
    font_style: Literal["normal", "italic"] = "normal"
    color: str = "#1a1a1a"
    background_color: str | None = None
    text_align: Align = "left"
    line_height: float = 1.3
    letter_spacing: float = 0


class LineElement(BaseElement):
    type: Literal["line"] = "line"
    stroke_color: str = "#333333"
    stroke_width: float = 0.3


class RectangleElement(BaseElement):
    type: Literal["rectangle"] = "rectangle"
    fill_color: str | None = None
    border_color: str = "#333333"
    border_width: float = 0.3
    border_radius: float = 0


class LogoElement(BaseElement):
    type: Literal["logo"] = "logo"
    object_fit: ObjectFit = "contain"


class ImageElement(BaseElement):
    type: Literal["image"] = "image"
    src: str = ""
    object_fit: ObjectFit = "contain"


class QrCodeElement(BaseElement):
    type: Literal["qrcode"] = "qrcode"
    data_source: Literal["invoice_number", "static"] = "invoice_number"
    static_value: str | None = None


class SignatureElement(BaseElement):
    type: Literal["signature"] = "signature"
    label: str = ""


class DynamicFieldElement(BaseElement):
    type: Literal["dynamic-field"] = "dynamic-field"
    field_key: str
    label: str
    font_size: int = Field(default=10, ge=6, le=72)
    font_weight: Literal["normal", "bold"] = "normal"
    font_style: Literal["normal", "italic"] = "normal"
    color: str = "#1a1a1a"
    text_align: Align = "left"
    line_height: float = 1.3
    letter_spacing: float = 0
    is_custom: bool = False
    default_value: str | None = None


class TableColumn(BaseModel):
    key: str
    label: str
    visible: bool = True
    width_mm: float = Field(gt=0)
    align: Align = "left"


class InvoiceTableElement(BaseElement):
    type: Literal["table"] = "table"
    columns: list[TableColumn] = Field(default_factory=list)
    header_font_size: int = Field(default=8, ge=6, le=72)
    header_bg_color: str = "#f1f5f9"
    header_text_color: str = "#1a1a1a"
    row_font_size: int = Field(default=8, ge=6, le=72)
    row_height_mm: float = Field(default=6, gt=0)
    border_color: str = "#cccccc"
    border_width: float = 0.2
    zebra_striping: bool = False
    currency_format: str = "#,##0.00"
    number_format: str = "#,##0.##"


class BankAccountElement(BaseElement):
    type: Literal["bank-account"] = "bank-account"
    slot: Literal[1, 2, 3] = 1
    font_size: int = Field(default=8, ge=6, le=72)
    text_align: Align = "left"
    color: str = "#1a1a1a"


Element = Annotated[
    Union[
        TextElement,
        LineElement,
        RectangleElement,
        LogoElement,
        ImageElement,
        QrCodeElement,
        SignatureElement,
        DynamicFieldElement,
        InvoiceTableElement,
        BankAccountElement,
    ],
    Field(discriminator="type"),
]


class FieldMeta(BaseModel):
    field_type: FieldType
    label: str
    is_custom: bool = False
    default_value: str | None = None


class TemplateSavePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    page_size: PageSize = PageSize.A4
    orientation: Orientation = "portrait"
    layout_json: list[Element] = Field(default_factory=list)
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
    orientation: Orientation
    layout_version: int
    engine: TemplateEngine
    target_format: TemplateFormat
    min_plan_key: str | None
    updated_at: datetime

    model_config = {"from_attributes": True}


class TemplateDetailResponse(TemplateSummaryResponse):
    # layout_version=1 rows store LayoutFieldEntry dicts; v2 rows store Element dicts.
    # A typed union here would be ambiguous (a v2 dynamic-field entry satisfies every
    # required LayoutFieldEntry field too), so the raw JSONB list passes through untyped;
    # the frontend picks the shape apart based on layout_version and legacyLayoutAdapter.ts
    # converts v1 entries on load.
    layout_json: list[dict]
    fields: list[TemplateFieldResponse]
    xslt_content: str | None
