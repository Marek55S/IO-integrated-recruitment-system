from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    body: str
    is_read: bool
    channel: str
    application_id: UUID | None = None
    sent_at: datetime

    model_config = {"from_attributes": True}
