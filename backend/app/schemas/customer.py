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


class CustomerContactResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str | None
    phone: str | None

    model_config = {"from_attributes": True}


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
    contacts: list[CustomerContactResponse] = []

    model_config = {"from_attributes": True}


class CustomerStatusUpdatePayload(BaseModel):
    is_active: bool


class CustomerContactPayload(BaseModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)
