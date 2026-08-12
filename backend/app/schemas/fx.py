from decimal import Decimal

from pydantic import BaseModel


class FxRateResponse(BaseModel):
    currency: str
    rate: Decimal
    source: str
