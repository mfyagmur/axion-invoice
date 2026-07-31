import uuid

from pydantic import BaseModel, EmailStr, Field


class CustomerCreatePayload(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    tax_number: str | None = Field(default=None, max_length=50)
    address: str | None = Field(default=None, max_length=500)


class CustomerResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str | None
    tax_number: str | None
    address: str | None

    model_config = {"from_attributes": True}
