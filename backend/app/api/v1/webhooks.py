from typing import Annotated

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import stripe_service
from app.services.subscription_service import revert_to_free, sync_subscription_from_stripe_object

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

_HANDLED_EVENTS = {"customer.subscription.created", "customer.subscription.updated"}


@router.post("/stripe", status_code=200)
async def stripe_webhook(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    stripe_signature: Annotated[str | None, Header(alias="Stripe-Signature")] = None,
) -> dict[str, bool]:
    payload = await request.body()
    event = stripe_service.construct_webhook_event(payload, stripe_signature)

    if event["type"] in _HANDLED_EVENTS:
        sync_subscription_from_stripe_object(db, event["data"]["object"])
    elif event["type"] == "customer.subscription.deleted":
        revert_to_free(db, event["data"]["object"])

    return {"received": True}
