import stripe
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.user import User

stripe.api_key = settings.stripe_secret_key


def _require_configured() -> None:
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Stripe henüz yapılandırılmadı"
        )


def create_checkout_session(user: User, subscription: Subscription, plan: Plan, interval: str) -> str:
    _require_configured()

    price_id = plan.stripe_price_id_monthly if interval == "monthly" else plan.stripe_price_id_yearly
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Bu plan için Stripe henüz yapılandırılmadı",
        )

    customer_id = subscription.stripe_customer_id
    if customer_id is None:
        customer = stripe.Customer.create(email=user.email, metadata={"user_id": str(user.id)})
        customer_id = customer["id"]
        subscription.stripe_customer_id = customer_id

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        subscription_data={"metadata": {"user_id": str(user.id)}},
        success_url=f"{settings.frontend_url}/dashboard/billing?checkout=success",
        cancel_url=f"{settings.frontend_url}/dashboard/billing?checkout=cancel",
    )
    return session["url"]


def create_portal_session(subscription: Subscription) -> str:
    _require_configured()

    if subscription.stripe_customer_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Önce bir plana abone olmalısınız"
        )

    session = stripe.billing_portal.Session.create(
        customer=subscription.stripe_customer_id,
        return_url=f"{settings.frontend_url}/dashboard/billing",
    )
    return session["url"]


def construct_webhook_event(payload: bytes, sig_header: str | None) -> stripe.Event:
    if not settings.stripe_webhook_secret or not sig_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook doğrulanamadı")

    try:
        return stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz webhook imzası") from exc
