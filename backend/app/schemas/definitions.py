import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class UnitPayload(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    is_active: bool = True


class UnitResponse(BaseModel):
    id: uuid.UUID
    name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TaxRatePayload(BaseModel):
    label: str = Field(min_length=1, max_length=100)
    rate: float = Field(ge=0, le=100)
    is_active: bool = True


class TaxRateResponse(BaseModel):
    id: uuid.UUID
    label: str
    rate: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentTermPayload(BaseModel):
    label: str = Field(min_length=1, max_length=100)
    days: int = Field(ge=0)
    is_active: bool = True


class PaymentTermResponse(BaseModel):
    id: uuid.UUID
    label: str
    days: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryPayload(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    is_active: bool = True


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
