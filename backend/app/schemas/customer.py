import uuid

from pydantic import BaseModel, EmailStr, Field


class CustomerCreatePayload(BaseModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)
    company_name: str | None = Field(default=None, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=50)
    address: str = Field(min_length=1, max_length=1000)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    tax_office: str = Field(min_length=1, max_length=255)
    tax_number: str = Field(min_length=1, max_length=50)
    fax: str | None = Field(default=None, max_length=50)
    mersis_no: str | None = Field(default=None, max_length=50)


class CustomerUpdatePayload(CustomerCreatePayload):
    pass


class CustomerResponse(BaseModel):
    id: uuid.UUID
    name: str
    first_name: str | None
    last_name: str | None
    company_name: str | None
    email: str | None
    phone: str | None
    address: str | None
    city: str | None
    postal_code: str | None
    country: str | None
    website: str | None
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
    address: str | None = Field(default=None, max_length=1000)
