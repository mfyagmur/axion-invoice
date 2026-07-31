from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "axion_invoice",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.pdf_tasks", "app.tasks.email_tasks"],
)
