from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.plan import Plan
from app.schemas.plan import PlanResponse

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanResponse])
def list_plans(db: Annotated[Session, Depends(get_db)]) -> list[Plan]:
    return db.query(Plan).order_by(Plan.price_monthly.asc()).all()
