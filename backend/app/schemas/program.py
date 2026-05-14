from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class EditionResponse(BaseModel):
    id: UUID
    edition_name: str
    recruitment_start: date | None = None
    recruitment_end: date | None = None
    studies_start: date | None = None
    studies_end: date | None = None
    min_enrollment: int
    max_enrollment: int | None = None
    enrollment_fee: Decimal
    tuition_fee: Decimal | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class ProgramListItem(BaseModel):
    id: str
    name: str
    description: str | None = None
    image_src: str | None = None
    is_active: bool

    model_config = {"from_attributes": True}


class ProgramDetail(ProgramListItem):
    editions: list[EditionResponse] = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
