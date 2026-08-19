import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator


def _is_valid_tckn(value: str) -> bool:
  """Validate Turkish National ID (TC Kimlik No) using official checksum algorithm."""
  if not value or len(value) != 11 or not value.isdigit():
    return False
  if value[0] == '0':
    return False
  digits = [int(c) for c in value]
  digit10 = ((sum(digits[0:9:2]) * 7) - sum(digits[1:8:2])) % 10
  digit11 = sum(digits[0:10]) % 10
  return digit10 == digits[9] and digit11 == digits[10]


class CustomerCreatePayload(BaseModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)
    company_name: str | None = Field(default=None, max_length=255)
    customer_type: Literal["bireysel", "kurumsal"] = "kurumsal"
    email: EmailStr
    phone: str = Field(min_length=1, max_length=50)
    address: str = Field(min_length=1, max_length=1000)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    tax_office: str | None = Field(default=None, max_length=255)
    tax_number: str = Field(min_length=1, max_length=50)
    fax: str | None = Field(default=None, max_length=50)
    mersis_no: str | None = Field(default=None, max_length=50)
    category_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def validate_customer_type_fields(self):
        if self.customer_type == "kurumsal":
            if not self.tax_office or not self.tax_office.strip():
                raise ValueError("tax_office is required for corporate customers")
        elif self.customer_type == "bireysel":
            if not self.tax_number or not _is_valid_tckn(self.tax_number):
                raise ValueError("tax_number must be a valid 11-digit Turkish national ID")
        return self


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
    customer_type: str
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
    category_id: uuid.UUID | None
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
