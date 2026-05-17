import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.user import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    image_src = Column(String(500))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    editions = relationship("ProgramEdition", back_populates="program", lazy="selectin")


class ProgramEdition(Base):
    __tablename__ = "program_editions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_id = Column(String(100), ForeignKey("programs.id"), nullable=False)
    edition_name = Column(String(100), nullable=False)
    recruitment_start = Column(Date)
    recruitment_end = Column(Date)
    studies_start = Column(Date)
    studies_end = Column(Date)
    min_enrollment = Column(Integer, nullable=False, default=15)
    max_enrollment = Column(Integer)
    enrollment_fee = Column(Numeric(10, 2), nullable=False, default=100.00)
    tuition_fee = Column(Numeric(10, 2))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    program = relationship("Program", back_populates="editions")
    required_documents = relationship("EditionRequiredDocument", back_populates="edition", lazy="selectin")
    applications = relationship("ProgramApplication", back_populates="edition", lazy="noload")


class EditionRequiredDocument(Base):
    __tablename__ = "edition_required_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    edition_id = Column(UUID(as_uuid=True), ForeignKey("program_editions.id"), nullable=False)
    doc_type = Column(
        String(50),
        nullable=False,
    )
    description = Column(String(255))
    is_required = Column(Boolean, nullable=False, default=True)

    edition = relationship("ProgramEdition", back_populates="required_documents")
