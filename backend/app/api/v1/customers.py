import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.invoice import InvoiceCustomer
from app.models.customer import CustomerContact
from app.models.user import User
from app.schemas.customer import (
    CustomerCreatePayload,
    CustomerResponse,
    CustomerStatusUpdatePayload,
    CustomerUpdatePayload,
    CustomerContactPayload,
    CustomerContactResponse,
)

router = APIRouter(prefix="/customers", tags=["customers"])


def _get_own_customer(db: Session, customer_id: uuid.UUID, current_user: User) -> InvoiceCustomer:
    customer = db.get(InvoiceCustomer, customer_id)
    if customer is None or customer.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Müşteri bulunamadı")
    return customer


@router.get("", response_model=list[CustomerResponse])
def list_customers(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[InvoiceCustomer]:
    return db.query(InvoiceCustomer).filter(InvoiceCustomer.user_id == current_user.id).order_by(
        InvoiceCustomer.name
    ).all()


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceCustomer:
    return _get_own_customer(db, customer_id, current_user)


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreatePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceCustomer:
    data = payload.model_dump()
    name = f"{data['first_name']} {data['last_name']}".strip()
    customer = InvoiceCustomer(user_id=current_user.id, name=name, **data)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: uuid.UUID,
    payload: CustomerUpdatePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceCustomer:
    customer = _get_own_customer(db, customer_id, current_user)
    data = payload.model_dump()
    if 'first_name' in data or 'last_name' in data:
        first_name = data.get('first_name', customer.first_name or '')
        last_name = data.get('last_name', customer.last_name or '')
        data['name'] = f"{first_name} {last_name}".strip()
    for field, value in data.items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.patch("/{customer_id}/status", response_model=CustomerResponse)
def update_customer_status(
    customer_id: uuid.UUID,
    payload: CustomerStatusUpdatePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceCustomer:
    customer = _get_own_customer(db, customer_id, current_user)
    customer.is_active = payload.is_active
    db.commit()
    db.refresh(customer)
    return customer


@router.post("/{customer_id}/contacts", response_model=CustomerContactResponse, status_code=status.HTTP_201_CREATED)
def add_customer_contact(
    customer_id: uuid.UUID,
    payload: CustomerContactPayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> CustomerContact:
    _get_own_customer(db, customer_id, current_user)
    contact = CustomerContact(customer_id=customer_id, **payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.put("/{customer_id}/contacts/{contact_id}", response_model=CustomerContactResponse)
def update_customer_contact(
    customer_id: uuid.UUID,
    contact_id: uuid.UUID,
    payload: CustomerContactPayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> CustomerContact:
    _get_own_customer(db, customer_id, current_user)
    contact = db.get(CustomerContact, contact_id)
    if contact is None or contact.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kişi bulunamadı")
    for field, value in payload.model_dump().items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{customer_id}/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_contact(
    customer_id: uuid.UUID,
    contact_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    _get_own_customer(db, customer_id, current_user)
    contact = db.get(CustomerContact, contact_id)
    if contact is None or contact.customer_id != customer_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kişi bulunamadı")
    db.delete(contact)
    db.commit()
