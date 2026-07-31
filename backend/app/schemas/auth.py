import uuid

from pydantic import BaseModel, EmailStr, Field

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
    company_name: str | None
    locale: str
    is_demo: bool

    model_config = {"from_attributes": True}
