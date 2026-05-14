import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import ENUM, JSONB, UUID
from sqlalchemy.orm import relationship

from app.models.user import Base


class ProgramApplication(Base):
    __tablename__ = "program_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    edition_id = Column(UUID(as_uuid=True), ForeignKey("program_editions.id"), nullable=False)
    status = Column(
        ENUM(
            "draft", "submitted", "documents_incomplete", "documents_verified",
            "awaiting_enrollment_fee", "enrollment_fee_paid", "awaiting_payment",
            "payment_confirmed", "accepted", "waitlisted", "rejected",
            "cancelled", "studies_not_launched",
            name="application_status", create_type=False,
        ),
        nullable=False,
        default="draft",
    )
    form_data = Column(JSONB, nullable=False, default=dict)
    submitted_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    user = relationship("User", back_populates="applications")
    edition = relationship("ProgramEdition", back_populates="applications", lazy="selectin")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", lazy="noload")
    documents = relationship("ApplicationDocument", back_populates="application", lazy="noload")
    payment_plan = relationship("PaymentPlan", back_populates="application", uselist=False, lazy="noload")
    messages = relationship("ContactMessage", back_populates="application", lazy="noload")


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("program_applications.id", ondelete="CASCADE"), nullable=False)
    old_status = Column(
        ENUM(
            "draft", "submitted", "documents_incomplete", "documents_verified",
            "awaiting_enrollment_fee", "enrollment_fee_paid", "awaiting_payment",
            "payment_confirmed", "accepted", "waitlisted", "rejected",
            "cancelled", "studies_not_launched",
            name="application_status", create_type=False,
        ),
    )
    new_status = Column(
        ENUM(
            "draft", "submitted", "documents_incomplete", "documents_verified",
            "awaiting_enrollment_fee", "enrollment_fee_paid", "awaiting_payment",
            "payment_confirmed", "accepted", "waitlisted", "rejected",
            "cancelled", "studies_not_launched",
            name="application_status", create_type=False,
        ),
        nullable=False,
    )
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    note = Column(Text)
    changed_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    application = relationship("ProgramApplication", back_populates="status_history")
