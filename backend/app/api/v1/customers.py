import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.invoice import InvoiceCustomer
from app.models.user import User
from app.schemas.customer import CustomerCreatePayload, CustomerResponse, CustomerUpdatePayload

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


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    payload: CustomerCreatePayload,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> InvoiceCustomer:
    customer = InvoiceCustomer(user_id=current_user.id, **payload.model_dump())
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
    for field, value in payload.model_dump().items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: uuid.UUID,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    customer = _get_own_customer(db, customer_id, current_user)
    db.delete(customer)
    db.commit()
