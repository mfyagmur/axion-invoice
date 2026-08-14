import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_not_demo
from app.core.security import decode_token
from app.models.session import UserSession
from app.models.user import User
from app.schemas.session import SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[SessionResponse])
def list_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> list[SessionResponse]:
    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == current_user.id, UserSession.revoked_at.is_(None))
        .order_by(UserSession.last_used_at.desc())
        .all()
    )

    current_jti = None
    if refresh_token:
        token_payload = decode_token(refresh_token)
        if token_payload and token_payload.get("type") == "refresh":
            current_jti = token_payload.get("jti")

    return [
        SessionResponse(
            id=session.id,
            user_agent=session.user_agent,
            ip_address=session.ip_address,
            created_at=session.created_at,
            last_used_at=session.last_used_at,
            is_current=(session.refresh_token_jti == current_jti) if current_jti else False,
        )
        for session in sessions
    ]


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_session(
    session_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    session = db.get(UserSession, session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oturum bulunamadı")
    session.revoked_at = func.now()
    db.commit()


@router.post("/revoke-others", response_model=dict)
def revoke_other_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    _: Annotated[None, Depends(require_not_demo)],
    db: Annotated[Session, Depends(get_db)],
    refresh_token: Annotated[str | None, Cookie()] = None,
) -> dict:
    current_jti = None
    if refresh_token:
        token_payload = decode_token(refresh_token)
        if token_payload and token_payload.get("type") == "refresh":
            current_jti = token_payload.get("jti")

    if current_jti:
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.refresh_token_jti != current_jti,
            UserSession.revoked_at.is_(None),
        ).update({UserSession.revoked_at: func.now()})
    else:
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.revoked_at.is_(None),
        ).update({UserSession.revoked_at: func.now()})

    db.commit()
    revoked_count = (
        db.query(UserSession)
        .filter(
            UserSession.user_id == current_user.id,
            UserSession.revoked_at.is_(None),
        )
        .count()
    )

    return {"revoked_count": len(db.query(UserSession).filter(UserSession.user_id == current_user.id).all()) - revoked_count - 1}
