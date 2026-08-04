import uuid

from pydantic import BaseModel, EmailStr, Field


class CustomerCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    address: str = Field(min_length=1, max_length=500)
    phone: str = Field(min_length=1, max_length=50)
    tax_office: str = Field(min_length=1, max_length=255)
    tax_number: str = Field(min_length=1, max_length=50)
    fax: str | None = Field(default=None, max_length=50)
    mersis_no: str | None = Field(default=None, max_length=50)


class CustomerUpdatePayload(CustomerCreatePayload):
    pass


class CustomerResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    address: str | None
    phone: str | None
    tax_office: str | None
    tax_number: str | None
    fax: str | None
    mersis_no: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class CustomerStatusUpdatePayload(BaseModel):
    is_active: bool


class InvoiceCustomerPayload(BaseModel):
    """Lightweight shape for creating a customer inline while creating an invoice —
    intentionally doesn't carry the compliance fields required on the Customers page,
    since that's a quick one-off record rather than full customer management."""

    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    tax_number: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=500)
