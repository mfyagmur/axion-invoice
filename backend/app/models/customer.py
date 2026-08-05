import uuid

from sqlalchemy import Column, DateTime, String, UUID, ForeignKey, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class CustomerContact(Base):
    __tablename__ = "customer_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("invoice_customers.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    customer = relationship("InvoiceCustomer", back_populates="contacts")
