import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import AccountType


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=255)
    account_type: AccountType = AccountType.BIREYSEL
    company_name: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str
    account_type: AccountType = AccountType.BIREYSEL


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    account_type: AccountType
    company_name: str | None = None
    address: str | None = None
    city: str | None = None
    postal_code: str | None = None
    country: str | None = None
    phone: str | None = None
    tax_office: str | None = None
    tax_number: str | None = None
    sector: str | None = None
    trade_registry_no: str | None = None
    corporate_email: str | None = None
    profession: str | None = None
    logo_url: str | None = None
    locale: str
    notify_invoice_reminders: bool
    notify_product_updates: bool
    notify_billing_emails: bool
    session_timeout_minutes: int
    is_demo: bool
    is_admin: bool
    has_password: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class ProfileUpdatePayload(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)


class AccountUpdatePayload(BaseModel):
    company_name: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=1000)
    city: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=50)
    tax_office: str | None = Field(default=None, max_length=255)
    tax_number: str | None = Field(default=None, max_length=50)
    sector: str | None = Field(default=None, max_length=255)
    trade_registry_no: str | None = Field(default=None, max_length=100)
    corporate_email: EmailStr | None = Field(default=None, max_length=255)


class PreferencesUpdatePayload(BaseModel):
    locale: str | None = Field(default=None, pattern=r"^(tr|en)$")
    profession: str | None = Field(default=None, max_length=255)
    notify_invoice_reminders: bool | None = None
    notify_product_updates: bool | None = None
    notify_billing_emails: bool | None = None
    session_timeout_minutes: int | None = Field(default=None, ge=5, le=30, multiple_of=5)


class PasswordChangePayload(BaseModel):
    current_password: str | None = Field(default=None, min_length=1)
    new_password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)

    @field_validator("confirm_password")
    @classmethod
    def password_match(cls, v, info):
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v
