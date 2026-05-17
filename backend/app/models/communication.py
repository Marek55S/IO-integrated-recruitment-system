import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import relationship

from app.models.user import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("program_applications.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    direction = Column(
        ENUM("outbound", "inbound", name="message_direction", create_type=False),
        nullable=False,
    )
    channel = Column(
        ENUM("system", "email", "whatsapp", name="message_channel", create_type=False),
        nullable=False,
        default="system",
    )
    subject = Column(String(255))
    body = Column(Text, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    application = relationship("ProgramApplication", back_populates="messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(UUID(as_uuid=True), ForeignKey("program_applications.id"))
    type = Column(
        ENUM(
            "documents_incomplete", "payment_reminder", "status_change",
            "welcome", "studies_not_launched", "accepted",
            name="notification_type", create_type=False,
        ),
        nullable=False,
    )
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    channel = Column(
        ENUM("system", "email", "whatsapp", name="message_channel", create_type=False),
        nullable=False,
        default="system",
    )
    sent_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")
