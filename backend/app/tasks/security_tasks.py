import logging
import uuid

from app.core.database import SessionLocal
from app.models.login_attempt import LoginAttempt
from app.services import geolocation_service
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="resolve_login_geolocation")
def resolve_login_geolocation_task(login_attempt_id: str) -> None:
    db = SessionLocal()
    try:
        attempt = db.get(LoginAttempt, uuid.UUID(login_attempt_id))
        if attempt is None or attempt.ip_address is None:
            return

        geo = geolocation_service.lookup(attempt.ip_address)
        if geo is None:
            return

        attempt.country = geo.country
        attempt.city = geo.city
        attempt.latitude = geo.lat
        attempt.longitude = geo.lon
        db.commit()
    except Exception:
        logger.exception("Failed to resolve geolocation for login attempt %s", login_attempt_id)
        db.rollback()
    finally:
        db.close()
