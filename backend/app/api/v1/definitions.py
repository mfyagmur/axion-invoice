import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.definitions import (
    DefinitionBankAccount,
    DefinitionCategory,
    DefinitionNote,
    DefinitionPaymentTerm,
    DefinitionTaxRate,
    DefinitionUnit,
)
from app.models.user import User
from app.schemas.definitions import (
    BankAccountPayload,
    BankAccountResponse,
    CategoryPayload,
    CategoryResponse,
    NotePayload,
    NoteResponse,
    PaymentTermPayload,
    PaymentTermResponse,
    TaxRatePayload,
    TaxRateResponse,
    UnitPayload,
    UnitResponse,
)

router = APIRouter(prefix="/definitions", tags=["definitions"])


def _get_own_unit(db: Session, user_id: uuid.UUID, unit_id: uuid.UUID) -> DefinitionUnit:
    unit = db.get(DefinitionUnit, unit_id)
    if unit is None or unit.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Birim bulunamadı")
    return unit


def _get_own_tax_rate(db: Session, user_id: uuid.UUID, tax_rate_id: uuid.UUID) -> DefinitionTaxRate:
    tax_rate = db.get(DefinitionTaxRate, tax_rate_id)
    if tax_rate is None or tax_rate.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KDV oranı bulunamadı")
    return tax_rate


def _get_own_payment_term(db: Session, user_id: uuid.UUID, payment_term_id: uuid.UUID) -> DefinitionPaymentTerm:
    payment_term = db.get(DefinitionPaymentTerm, payment_term_id)
    if payment_term is None or payment_term.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ödeme vadesi bulunamadı")
    return payment_term


def _get_own_category(db: Session, user_id: uuid.UUID, category_id: uuid.UUID) -> DefinitionCategory:
    category = db.get(DefinitionCategory, category_id)
    if category is None or category.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kategori bulunamadı")
    return category


def _get_own_bank_account(db: Session, user_id: uuid.UUID, bank_account_id: uuid.UUID) -> DefinitionBankAccount:
    bank_account = db.get(DefinitionBankAccount, bank_account_id)
    if bank_account is None or bank_account.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banka hesabı bulunamadı")
    return bank_account


def _get_own_note(db: Session, user_id: uuid.UUID, note_id: uuid.UUID) -> DefinitionNote:
    note = db.get(DefinitionNote, note_id)
    if note is None or note.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sabit açıklama bulunamadı")
    return note


@router.get("/units", response_model=list[UnitResponse])
def list_units(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DefinitionUnit]:
    return db.query(DefinitionUnit).filter(DefinitionUnit.user_id == current_user.id).order_by(DefinitionUnit.name).all()


@router.post("/units", response_model=UnitResponse, status_code=status.HTTP_201_CREATED)
def create_unit(
    payload: UnitPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionUnit:
    unit = DefinitionUnit(user_id=current_user.id, name=payload.name, is_active=payload.is_active)
    db.add(unit)
    db.commit()
    db.refresh(unit)
    return unit


@router.put("/units/{unit_id}", response_model=UnitResponse)
def update_unit(
    unit_id: uuid.UUID,
    payload: UnitPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionUnit:
    unit = _get_own_unit(db, current_user.id, unit_id)
    unit.name = payload.name
    unit.is_active = payload.is_active
    db.commit()
    db.refresh(unit)
    return unit


@router.delete("/units/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit(
    unit_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    unit = _get_own_unit(db, current_user.id, unit_id)
    db.delete(unit)
    db.commit()


@router.patch("/units/{unit_id}/status")
def toggle_unit_status(
    unit_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> UnitResponse:
    unit = _get_own_unit(db, current_user.id, unit_id)
    unit.is_active = not unit.is_active
    db.commit()
    db.refresh(unit)
    return unit


@router.get("/tax-rates", response_model=list[TaxRateResponse])
def list_tax_rates(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DefinitionTaxRate]:
    return db.query(DefinitionTaxRate).filter(DefinitionTaxRate.user_id == current_user.id).order_by(DefinitionTaxRate.rate).all()


@router.post("/tax-rates", response_model=TaxRateResponse, status_code=status.HTTP_201_CREATED)
def create_tax_rate(
    payload: TaxRatePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionTaxRate:
    tax_rate = DefinitionTaxRate(user_id=current_user.id, label=payload.label, rate=payload.rate, is_active=payload.is_active)
    db.add(tax_rate)
    db.commit()
    db.refresh(tax_rate)
    return tax_rate


@router.put("/tax-rates/{tax_rate_id}", response_model=TaxRateResponse)
def update_tax_rate(
    tax_rate_id: uuid.UUID,
    payload: TaxRatePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionTaxRate:
    tax_rate = _get_own_tax_rate(db, current_user.id, tax_rate_id)
    tax_rate.label = payload.label
    tax_rate.rate = payload.rate
    tax_rate.is_active = payload.is_active
    db.commit()
    db.refresh(tax_rate)
    return tax_rate


@router.delete("/tax-rates/{tax_rate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tax_rate(
    tax_rate_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    tax_rate = _get_own_tax_rate(db, current_user.id, tax_rate_id)
    db.delete(tax_rate)
    db.commit()


@router.patch("/tax-rates/{tax_rate_id}/status")
def toggle_tax_rate_status(
    tax_rate_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> TaxRateResponse:
    tax_rate = _get_own_tax_rate(db, current_user.id, tax_rate_id)
    tax_rate.is_active = not tax_rate.is_active
    db.commit()
    db.refresh(tax_rate)
    return tax_rate


@router.get("/payment-terms", response_model=list[PaymentTermResponse])
def list_payment_terms(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DefinitionPaymentTerm]:
    return db.query(DefinitionPaymentTerm).filter(DefinitionPaymentTerm.user_id == current_user.id).order_by(DefinitionPaymentTerm.days).all()


@router.post("/payment-terms", response_model=PaymentTermResponse, status_code=status.HTTP_201_CREATED)
def create_payment_term(
    payload: PaymentTermPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionPaymentTerm:
    payment_term = DefinitionPaymentTerm(
        user_id=current_user.id, label=payload.label, days=payload.days, is_active=payload.is_active
    )
    db.add(payment_term)
    db.commit()
    db.refresh(payment_term)
    return payment_term


@router.put("/payment-terms/{payment_term_id}", response_model=PaymentTermResponse)
def update_payment_term(
    payment_term_id: uuid.UUID,
    payload: PaymentTermPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionPaymentTerm:
    payment_term = _get_own_payment_term(db, current_user.id, payment_term_id)
    payment_term.label = payload.label
    payment_term.days = payload.days
    payment_term.is_active = payload.is_active
    db.commit()
    db.refresh(payment_term)
    return payment_term


@router.delete("/payment-terms/{payment_term_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_term(
    payment_term_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    payment_term = _get_own_payment_term(db, current_user.id, payment_term_id)
    db.delete(payment_term)
    db.commit()


@router.patch("/payment-terms/{payment_term_id}/status")
def toggle_payment_term_status(
    payment_term_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> PaymentTermResponse:
    payment_term = _get_own_payment_term(db, current_user.id, payment_term_id)
    payment_term.is_active = not payment_term.is_active
    db.commit()
    db.refresh(payment_term)
    return payment_term


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DefinitionCategory]:
    return db.query(DefinitionCategory).filter(DefinitionCategory.user_id == current_user.id).order_by(DefinitionCategory.name).all()


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionCategory:
    category = DefinitionCategory(user_id=current_user.id, name=payload.name, is_active=payload.is_active)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionCategory:
    category = _get_own_category(db, current_user.id, category_id)
    category.name = payload.name
    category.is_active = payload.is_active
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    category = _get_own_category(db, current_user.id, category_id)
    db.delete(category)
    db.commit()


@router.patch("/categories/{category_id}/status")
def toggle_category_status(
    category_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> CategoryResponse:
    category = _get_own_category(db, current_user.id, category_id)
    category.is_active = not category.is_active
    db.commit()
    db.refresh(category)
    return category


@router.get("/bank-accounts", response_model=list[BankAccountResponse])
def list_bank_accounts(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DefinitionBankAccount]:
    return (
        db.query(DefinitionBankAccount)
        .filter(DefinitionBankAccount.user_id == current_user.id)
        .order_by(DefinitionBankAccount.bank_name)
        .all()
    )


@router.post("/bank-accounts", response_model=BankAccountResponse, status_code=status.HTTP_201_CREATED)
def create_bank_account(
    payload: BankAccountPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionBankAccount:
    bank_account = DefinitionBankAccount(
        user_id=current_user.id,
        bank_name=payload.bank_name,
        branch_name=payload.branch_name,
        branch_code=payload.branch_code,
        currency=payload.currency,
        account_number=payload.account_number,
        iban=payload.iban,
        is_active=payload.is_active,
    )
    db.add(bank_account)
    db.commit()
    db.refresh(bank_account)
    return bank_account


@router.put("/bank-accounts/{bank_account_id}", response_model=BankAccountResponse)
def update_bank_account(
    bank_account_id: uuid.UUID,
    payload: BankAccountPayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionBankAccount:
    bank_account = _get_own_bank_account(db, current_user.id, bank_account_id)
    bank_account.bank_name = payload.bank_name
    bank_account.branch_name = payload.branch_name
    bank_account.branch_code = payload.branch_code
    bank_account.currency = payload.currency
    bank_account.account_number = payload.account_number
    bank_account.iban = payload.iban
    bank_account.is_active = payload.is_active
    db.commit()
    db.refresh(bank_account)
    return bank_account


@router.delete("/bank-accounts/{bank_account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_account(
    bank_account_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    bank_account = _get_own_bank_account(db, current_user.id, bank_account_id)
    db.delete(bank_account)
    db.commit()


@router.patch("/bank-accounts/{bank_account_id}/status")
def toggle_bank_account_status(
    bank_account_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> BankAccountResponse:
    bank_account = _get_own_bank_account(db, current_user.id, bank_account_id)
    bank_account.is_active = not bank_account.is_active
    db.commit()
    db.refresh(bank_account)
    return bank_account


@router.get("/notes", response_model=list[NoteResponse])
def list_notes(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[DefinitionNote]:
    return db.query(DefinitionNote).filter(DefinitionNote.user_id == current_user.id).order_by(DefinitionNote.label).all()


@router.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NotePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionNote:
    note = DefinitionNote(user_id=current_user.id, label=payload.label, content=payload.content, is_active=payload.is_active)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: uuid.UUID,
    payload: NotePayload,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> DefinitionNote:
    note = _get_own_note(db, current_user.id, note_id)
    note.label = payload.label
    note.content = payload.content
    note.is_active = payload.is_active
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    note = _get_own_note(db, current_user.id, note_id)
    db.delete(note)
    db.commit()


@router.patch("/notes/{note_id}/status")
def toggle_note_status(
    note_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> NoteResponse:
    note = _get_own_note(db, current_user.id, note_id)
    note.is_active = not note.is_active
    db.commit()
    db.refresh(note)
    return note
