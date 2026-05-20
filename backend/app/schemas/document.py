from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: UUID
    doc_type: str
    file_name: str
    mime_type: str | None = None
    status: str
    review_note: str | None = None
    uploaded_at: datetime
    reviewed_at: datetime | None = None

    model_config = {"from_attributes": True}


class DocumentReviewRequest(BaseModel):
    status: str  # 'accepted' | 'rejected'
    note: str | None = None
