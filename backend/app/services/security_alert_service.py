from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.request_metrics import SLOW_REQUEST_THRESHOLD_MS, get_records
from app.models.audit_log import AuditLog
from app.models.login_attempt import LoginAttempt, LoginAttemptStatus
from app.models.security_alert import SecurityAlert, SecurityAlertSeverity
from app.models.session import UserSession

BRUTE_FORCE_WINDOW_MINUTES = 15
BRUTE_FORCE_THRESHOLD = 5
DEDUPE_WINDOW_HOURS = 1
SERVER_ERROR_THRESHOLD = 5
SLOW_REQUEST_ALERT_THRESHOLD = 10
SESSION_REVOKE_THRESHOLD = 10


def _has_recent_unresolved(db: Session, *, category: str, source: str | None) -> bool:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=DEDUPE_WINDOW_HOURS)
    query = db.query(SecurityAlert).filter(
        SecurityAlert.category == category,
        SecurityAlert.is_resolved.is_(False),
        SecurityAlert.created_at >= cutoff,
    )
    if source is not None:
        query = query.filter(SecurityAlert.source == source)
    return db.query(query.exists()).scalar()


def _check_brute_force(db: Session) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=BRUTE_FORCE_WINDOW_MINUTES)
    rows = (
        db.query(LoginAttempt.email, func.count(LoginAttempt.id))
        .filter(LoginAttempt.status == LoginAttemptStatus.FAILED, LoginAttempt.created_at >= cutoff)
        .group_by(LoginAttempt.email)
        .having(func.count(LoginAttempt.id) >= BRUTE_FORCE_THRESHOLD)
        .all()
    )
    for email, count in rows:
        if _has_recent_unresolved(db, category="brute_force", source=email):
            continue
        db.add(
            SecurityAlert(
                severity=SecurityAlertSeverity.CRITICAL,
                category="brute_force",
                title="Olası kaba kuvvet (brute-force) girişimi",
                description=f"{email} için son {BRUTE_FORCE_WINDOW_MINUTES} dakikada {count} başarısız giriş denemesi tespit edildi.",
                source=email,
            )
        )


def _check_request_metrics(db: Session) -> None:
    records = get_records()
    server_error_count = sum(1 for r in records if r.status_code >= 500)
    slow_count = sum(1 for r in records if r.duration_ms > SLOW_REQUEST_THRESHOLD_MS)

    if server_error_count >= SERVER_ERROR_THRESHOLD and not _has_recent_unresolved(
        db, category="server_error_spike", source=None
    ):
        db.add(
            SecurityAlert(
                severity=SecurityAlertSeverity.HIGH,
                category="server_error_spike",
                title="Sunucu hata oranında artış",
                description=f"Son izlenen istekler içinde {server_error_count} adet 5xx hata tespit edildi.",
                source=None,
            )
        )

    if slow_count >= SLOW_REQUEST_ALERT_THRESHOLD and not _has_recent_unresolved(
        db, category="slow_request_spike", source=None
    ):
        db.add(
            SecurityAlert(
                severity=SecurityAlertSeverity.WEB_SERVER,
                category="slow_request_spike",
                title="Web sunucusunda yavaşlama",
                description=f"Son izlenen istekler içinde {slow_count} adet {int(SLOW_REQUEST_THRESHOLD_MS)}ms üzeri yanıt tespit edildi.",
                source=None,
            )
        )


def _check_session_anomalies(db: Session) -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
    revoked_count = db.query(UserSession).filter(UserSession.revoked_at >= cutoff).count()
    reuse_count = (
        db.query(AuditLog)
        .filter(AuditLog.action == "session.revoked_reuse_detected", AuditLog.created_at >= cutoff)
        .count()
    )
    total = revoked_count + reuse_count
    if total >= SESSION_REVOKE_THRESHOLD and not _has_recent_unresolved(db, category="session_anomaly", source=None):
        db.add(
            SecurityAlert(
                severity=SecurityAlertSeverity.LOW,
                category="session_anomaly",
                title="Anormal oturum iptali hacmi",
                description=f"Son 1 saatte {total} oturum iptali/yeniden kullanım denemesi tespit edildi.",
                source=None,
            )
        )


def sync_security_alerts(db: Session) -> None:
    _check_brute_force(db)
    _check_request_metrics(db)
    _check_session_anomalies(db)
    db.commit()
