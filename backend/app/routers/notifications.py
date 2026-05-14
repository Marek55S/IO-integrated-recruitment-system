from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.communication import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    unread_only: bool = False,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Notification).where(Notification.user_id == user.id).order_by(Notification.sent_at.desc())
    if unread_only:
        query = query.where(Notification.is_read.is_(False))
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(404, "Powiadomienie nie znalezione")
    notif.is_read = True
    await db.commit()
    return {"message": "Oznaczono jako przeczytane"}
