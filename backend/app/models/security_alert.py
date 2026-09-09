import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SecurityAlertSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    WEB_SERVER = "web_server"
    LOW = "low"


class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    severity: Mapped[SecurityAlertSeverity] = mapped_column(
        Enum(SecurityAlertSeverity, name="security_alert_severity", values_callable=lambda enum_cls: [e.value for e in enum_cls]),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
