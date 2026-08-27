from celery import Celery
from celery.schedules import crontab

import app.models  # noqa: F401 - ensures all SQLAlchemy models are registered before mappers configure
from app.core.config import settings

celery_app = Celery(
    "axion_invoice",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.pdf_tasks", "app.tasks.email_tasks"],
)

celery_app.conf.timezone = "UTC"
celery_app.conf.beat_schedule = {
    "check-payment-reminders": {
        "task": "check_payment_reminders",
        "schedule": crontab(minute=0),
    },
}
