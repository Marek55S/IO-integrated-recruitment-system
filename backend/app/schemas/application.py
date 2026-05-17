from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    edition_id: UUID
    form_data: dict = {}


class ApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    edition_id: UUID
    status: str
    form_data: dict = {}
    submitted_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime

    # Enriched fields (joined)
    program_name: str | None = None
    edition_name: str | None = None

    model_config = {"from_attributes": True}


class ApplicationDetail(ApplicationResponse):
    candidate_first_name: str | None = None
    candidate_last_name: str | None = None
    candidate_email: str | None = None

    model_config = {"from_attributes": True}


class StatusChangeRequest(BaseModel):
    new_status: str
    note: str | None = None


class StatusHistoryResponse(BaseModel):
    id: UUID
    application_id: UUID
    old_status: str | None = None
    new_status: str
    changed_by: UUID | None = None
    note: str | None = None
    changed_at: datetime

    model_config = {"from_attributes": True}


class ApplicationListResponse(BaseModel):
    """Paginated list of applications with total count."""
    items: list[ApplicationDetail]
    total: int
    page: int
    limit: int

