import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.invoice import Invoice
from app.models.plan import Plan
from app.models.subscription import BillingInterval, Subscription, SubscriptionStatus
from app.models.template import InvoiceTemplate
from app.models.user import User

logger = logging.getLogger(__name__)


def _get_plan_by_key(db: Session, key: str) -> Plan:
    plan = db.query(Plan).filter(Plan.key == key).first()
    if plan is None:
        raise RuntimeError(f"Plan seed verisi eksik: '{key}'")
    return plan


def ensure_default_subscription(db: Session, user: User) -> Subscription:
    existing = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if existing is not None:
        return existing

    free_plan = _get_plan_by_key(db, "free")
    subscription = Subscription(user_id=user.id, plan_id=free_plan.id, status=SubscriptionStatus.ACTIVE)
    db.add(subscription)
    db.flush()
    return subscription


def get_subscription(db: Session, user: User) -> Subscription:
    subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if subscription is None:
        raise RuntimeError(f"Kullanıcının aboneliği yok: {user.id}")
    return subscription


def get_active_plan(db: Session, user: User) -> Plan:
    return get_subscription(db, user).plan


def _current_month_start() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def count_invoices_this_month(db: Session, user: User) -> int:
    return (
        db.query(func.count(Invoice.id))
        .filter(Invoice.user_id == user.id, Invoice.created_at >= _current_month_start())
        .scalar()
    )


def count_custom_templates(db: Session, user: User) -> int:
    return (
        db.query(func.count(InvoiceTemplate.id))
        .filter(InvoiceTemplate.user_id == user.id, InvoiceTemplate.is_system_template.is_(False))
        .scalar()
    )


def check_invoice_limit(db: Session, user: User) -> None:
    plan = get_active_plan(db, user)
    if plan.max_invoices_per_month is None:
        return

    if count_invoices_this_month(db, user) >= plan.max_invoices_per_month:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Aylık fatura limitine ulaştınız ({plan.max_invoices_per_month}). Planınızı yükseltin.",
        )


def check_template_limit(db: Session, user: User) -> None:
    plan = get_active_plan(db, user)
    if plan.max_templates is None:
        return

    if count_custom_templates(db, user) >= plan.max_templates:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Özel şablon limitine ulaştınız ({plan.max_templates}). Planınızı yükseltin.",
        )


def sync_subscription_from_stripe_object(db: Session, stripe_subscription: dict) -> None:
    user_id = (stripe_subscription.get("metadata") or {}).get("user_id")
    if not user_id:
        logger.warning("Stripe subscription event'inde user_id metadata yok, atlanıyor")
        return

    subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
    if subscription is None:
        logger.warning("Stripe subscription event'i bilinmeyen bir kullanıcıya ait: %s", user_id)
        return

    items = stripe_subscription.get("items", {}).get("data", [])
    if not items:
        logger.warning("Stripe subscription event'inde items yok: %s", stripe_subscription.get("id"))
        return

    price = items[0].get("price", {})
    price_id = price.get("id")
    interval = (price.get("recurring") or {}).get("interval")

    plan = (
        db.query(Plan)
        .filter((Plan.stripe_price_id_monthly == price_id) | (Plan.stripe_price_id_yearly == price_id))
        .first()
    )
    if plan is None:
        logger.warning("Stripe price_id eşleşen bir plan bulunamadı, mevcut plan korunuyor: %s", price_id)
        plan = subscription.plan

    subscription.plan_id = plan.id
    subscription.stripe_customer_id = stripe_subscription.get("customer") or subscription.stripe_customer_id
    subscription.stripe_subscription_id = stripe_subscription.get("id")
    try:
        subscription.status = SubscriptionStatus(stripe_subscription.get("status"))
    except ValueError:
        logger.warning("Bilinmeyen Stripe subscription durumu, mevcut durum korunuyor: %s", stripe_subscription.get("status"))
    subscription.billing_interval = BillingInterval.MONTHLY if interval == "month" else BillingInterval.YEARLY
    period_end = stripe_subscription.get("current_period_end")
    subscription.current_period_end = (
        datetime.fromtimestamp(period_end, tz=timezone.utc) if period_end is not None else None
    )
    db.commit()


def revert_to_free(db: Session, stripe_subscription: dict) -> None:
    subscription_id = stripe_subscription.get("id")
    subscription = db.query(Subscription).filter(Subscription.stripe_subscription_id == subscription_id).first()
    if subscription is None:
        user_id = (stripe_subscription.get("metadata") or {}).get("user_id")
        if user_id:
            subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()

    if subscription is None:
        logger.warning("Stripe subscription.deleted event'i bilinmeyen bir aboneliğe ait: %s", subscription_id)
        return

    free_plan = _get_plan_by_key(db, "free")
    subscription.plan_id = free_plan.id
    subscription.status = SubscriptionStatus.CANCELED
    subscription.stripe_subscription_id = None
    subscription.billing_interval = None
    subscription.current_period_end = None
    db.commit()
