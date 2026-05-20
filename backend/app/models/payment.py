import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, SmallInteger, String
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import relationship

from app.models.user import Base


class PaymentPlan(Base):
    __tablename__ = "payment_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(
        UUID(as_uuid=True),
        ForeignKey("program_applications.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    plan_type = Column(
        ENUM("full", "installments", name="payment_plan_type", create_type=False),
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    application = relationship("ProgramApplication", back_populates="payment_plan")
    installments = relationship("PaymentInstallment", back_populates="plan", lazy="selectin")


class PaymentInstallment(Base):
    __tablename__ = "payment_installments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("payment_plans.id", ondelete="CASCADE"), nullable=False)
    type = Column(
        ENUM("enrollment_fee", "full_payment", "installment", name="installment_type", create_type=False),
        nullable=False,
    )
    installment_no = Column(SmallInteger)
    amount = Column(Numeric(10, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(
        ENUM("pending", "paid", "overdue", "waived", name="installment_status", create_type=False),
        nullable=False,
        default="pending",
    )
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    plan = relationship("PaymentPlan", back_populates="installments")
    payments = relationship("Payment", back_populates="installment", lazy="selectin")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    installment_id = Column(UUID(as_uuid=True), ForeignKey("payment_installments.id"), nullable=False)
    amount_paid = Column(Numeric(10, 2), nullable=False)
    status = Column(
        ENUM("pending", "completed", "failed", "refunded", name="payment_status", create_type=False),
        nullable=False,
        default="pending",
    )
    gateway_tx_id = Column(String(255))
    gateway_status = Column(String(100))
    paid_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    installment = relationship("PaymentInstallment", back_populates="payments")
