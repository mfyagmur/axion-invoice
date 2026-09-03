from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardChartsResponse, DashboardOverviewResponse
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview", response_model=DashboardOverviewResponse)
def get_overview(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DashboardOverviewResponse:
    return dashboard_service.get_overview(db, current_user)


@router.get("/charts", response_model=DashboardChartsResponse)
def get_charts(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    currency: str = Query(min_length=3, max_length=3),
    from_: date | None = Query(None, alias="from"),
    to: date | None = Query(None),
) -> DashboardChartsResponse:
    if from_ is not None and to is not None and from_ > to:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="'from' tarihi 'to' tarihinden sonra olamaz")
    return dashboard_service.get_charts(db, current_user, currency.upper(), from_, to)
