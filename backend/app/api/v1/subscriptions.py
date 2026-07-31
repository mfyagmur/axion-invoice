from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.models.plan import Plan
from app.models.user import User
from app.schemas.subscription import CheckoutRequest, CheckoutResponse, PortalResponse, SubscriptionResponse
from app.services import stripe_service
from app.services.subscription_service import (
    count_custom_templates,
    count_invoices_this_month,
    get_subscription,
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/me", response_model=SubscriptionResponse)
def get_my_subscription(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SubscriptionResponse:
    subscription = get_subscription(db, current_user)
    return SubscriptionResponse(
        plan=subscription.plan,
        status=subscription.status,
        billing_interval=subscription.billing_interval,
        current_period_end=subscription.current_period_end,
        has_stripe_customer=subscription.stripe_customer_id is not None,
        invoices_used_this_month=count_invoices_this_month(db, current_user),
        templates_used=count_custom_templates(db, current_user),
    )


@router.post("/checkout", response_model=CheckoutResponse)
def checkout(
    payload: CheckoutRequest,
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> CheckoutResponse:
    subscription = get_subscription(db, current_user)
    plan = db.query(Plan).filter(Plan.key == payload.plan_key).first()
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan bulunamadı")

    url = stripe_service.create_checkout_session(current_user, subscription, plan, payload.interval)
    db.commit()
    return CheckoutResponse(url=url)


@router.post("/portal", response_model=PortalResponse)
def portal(
    current_user: Annotated[User, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> PortalResponse:
    subscription = get_subscription(db, current_user)
    url = stripe_service.create_portal_session(subscription)
    return PortalResponse(url=url)
