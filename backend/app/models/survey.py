import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import relationship

from app.models.user import Base


class Survey(Base):
    """Survey created by admin with a list of questions."""
    __tablename__ = "surveys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    # JSON list of questions:
    # [{"id": "q1", "text": "...", "type": "scale"|"text", "required": true}]
    questions = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    responses = relationship("SurveyResponse", back_populates="survey", lazy="dynamic")


class SurveyResponse(Base):
    """Anonymous response to a survey — no user_id by design."""
    __tablename__ = "survey_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    survey_id = Column(
        UUID(as_uuid=True),
        ForeignKey("surveys.id", ondelete="CASCADE"),
        nullable=False,
    )
    # JSON: [{"question_id": "q1", "value": 4}, {"question_id": "q2", "value": "..."}]
    answers = Column(JSON, nullable=False, default=list)
    submitted_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    survey = relationship("Survey", back_populates="responses")
