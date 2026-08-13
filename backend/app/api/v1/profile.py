from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    AccountUpdatePayload,
    PasswordChangePayload,
    PreferencesUpdatePayload,
    ProfileUpdatePayload,
    UserResponse,
)

router = APIRouter(prefix="/profile", tags=["profile"])


@router.patch("", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdatePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    current_user.full_name = payload.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/account", response_model=UserResponse)
def update_account(
    payload: AccountUpdatePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if payload.company_name is not None:
        current_user.company_name = payload.company_name
    if payload.address is not None:
        current_user.address = payload.address
    if payload.city is not None:
        current_user.city = payload.city
    if payload.postal_code is not None:
        current_user.postal_code = payload.postal_code
    if payload.country is not None:
        current_user.country = payload.country
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.tax_office is not None:
        current_user.tax_office = payload.tax_office
    if payload.tax_number is not None:
        current_user.tax_number = payload.tax_number
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/preferences", response_model=UserResponse)
def update_preferences(
    payload: PreferencesUpdatePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if payload.locale is not None:
        current_user.locale = payload.locale
    if payload.notify_invoice_reminders is not None:
        current_user.notify_invoice_reminders = payload.notify_invoice_reminders
    if payload.notify_product_updates is not None:
        current_user.notify_product_updates = payload.notify_product_updates
    if payload.notify_billing_emails is not None:
        current_user.notify_billing_emails = payload.notify_billing_emails
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChangePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if current_user.password_hash is None:
        if payload.current_password is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu hesap Google ile bağlı olduğu için geçerli şifre sağlanamaz",
            )
    else:
        if payload.current_password is None or not verify_password(payload.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Mevcut şifre hatalı",
            )

    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
