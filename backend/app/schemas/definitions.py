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


class BankAccountPayload(BaseModel):
    bank_name: str = Field(min_length=1, max_length=100)
    iban: str = Field(min_length=15, max_length=34)
    account_holder: str = Field(min_length=1, max_length=150)
    branch: str | None = Field(default=None, max_length=100)
    is_active: bool = True


class BankAccountResponse(BaseModel):
    id: uuid.UUID
    bank_name: str
    iban: str
    account_holder: str
    branch: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotePayload(BaseModel):
    label: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=1000)
    is_active: bool = True


class NoteResponse(BaseModel):
    id: uuid.UUID
    label: str
    content: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
