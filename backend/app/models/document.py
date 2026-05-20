import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import relationship

from app.models.user import Base


class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("program_applications.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(
        ENUM(
            "diploma_scan", "application_form", "marketing_consent",
            "enrollment_fee_proof", "id_copy", "other",
            name="required_doc_type", create_type=False,
        ),
        nullable=False,
    )
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    mime_type = Column(String(100))
    status = Column(
        ENUM("pending", "accepted", "rejected", name="document_status", create_type=False),
        nullable=False,
        default="pending",
    )
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    review_note = Column(Text)
    uploaded_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime(timezone=True))

    application = relationship("ProgramApplication", back_populates="documents")
