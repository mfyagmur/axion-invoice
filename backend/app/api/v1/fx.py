import urllib.error
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.fx import FxRateResponse
from app.services import fx_service

router = APIRouter(prefix="/fx", tags=["fx"])


@router.get("/rate", response_model=FxRateResponse)
def get_rate(
    current_user: Annotated[User, Depends(get_current_user)],
    currency: str = Query(..., min_length=3, max_length=3),
    base: str = Query("TRY", min_length=3, max_length=3),
) -> FxRateResponse:
    code = currency.upper()
    base_code = base.upper()
    try:
        rate = fx_service.get_conversion_rate(code, base_code)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Desteklenmeyen para birimi") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Kur servisine ulaşılamadı") from exc

    return FxRateResponse(currency=code, rate=rate, source="TCMB")
