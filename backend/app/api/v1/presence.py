from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.core import presence
from app.core.deps import get_optional_user
from app.models.user import User
from app.schemas.presence import HeartbeatRequest

router = APIRouter(prefix="/presence", tags=["presence"])


@router.post("/heartbeat", status_code=status.HTTP_204_NO_CONTENT)
def send_heartbeat(
    body: HeartbeatRequest,
    current_user: Annotated[User | None, Depends(get_optional_user)],
) -> None:
    presence.record_heartbeat(
        client_id=body.client_id,
        user_id=current_user.id if current_user else None,
        is_demo=current_user.is_demo if current_user else False,
    )
