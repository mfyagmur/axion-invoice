from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_admin
from app.models.user import User
from app.schemas.admin_dashboard import (
    AdminDeliveryIntegrationsResponse,
    AdminFinancialOverviewResponse,
    AdminOperationalMetricsResponse,
    AdminSystemHealthResponse,
    SecurityAlertsResponse,
    SecurityAuditLogsResponse,
    SecurityLoginActivitiesResponse,
    SecurityThreatMapResponse,
    SlowQueryDetailResponse,
)
from app.services import admin_dashboard_service

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])


@router.get("/financial", response_model=AdminFinancialOverviewResponse)
def get_admin_financial_overview(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminFinancialOverviewResponse:
    return admin_dashboard_service.get_admin_financial_overview(db)


@router.get("/system-health", response_model=AdminSystemHealthResponse)
def get_admin_system_health(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminSystemHealthResponse:
    return admin_dashboard_service.get_admin_system_health(db)


@router.get("/slow-query-details", response_model=SlowQueryDetailResponse)
def get_admin_slow_query_details(
    current_user: Annotated[User, Depends(require_admin)],
) -> SlowQueryDetailResponse:
    return admin_dashboard_service.get_admin_slow_query_details()


@router.get("/delivery-integrations", response_model=AdminDeliveryIntegrationsResponse)
def get_admin_delivery_integrations(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminDeliveryIntegrationsResponse:
    return admin_dashboard_service.get_admin_delivery_integrations(db)


@router.get("/operational-metrics", response_model=AdminOperationalMetricsResponse)
def get_admin_operational_metrics(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> AdminOperationalMetricsResponse:
    return admin_dashboard_service.get_admin_operational_metrics(db)


@router.get("/security-threat-map", response_model=SecurityThreatMapResponse)
def get_admin_security_threat_map(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> SecurityThreatMapResponse:
    return admin_dashboard_service.get_admin_security_threat_map(db)


@router.get("/security-login-activities", response_model=SecurityLoginActivitiesResponse)
def get_admin_security_login_activities(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> SecurityLoginActivitiesResponse:
    return admin_dashboard_service.get_admin_security_login_activities(db)


@router.get("/security-audit-logs", response_model=SecurityAuditLogsResponse)
def get_admin_security_audit_logs(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
    event_type: str | None = None,
) -> SecurityAuditLogsResponse:
    return admin_dashboard_service.get_admin_security_audit_logs(db, event_type)


@router.get("/security-alerts", response_model=SecurityAlertsResponse)
def get_admin_security_alerts(
    current_user: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
) -> SecurityAlertsResponse:
    return admin_dashboard_service.get_admin_security_alerts(db)
