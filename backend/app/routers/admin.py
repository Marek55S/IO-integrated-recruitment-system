from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_admin
from app.models.application import ApplicationStatusHistory, ProgramApplication
from app.models.communication import Notification
from app.models.program import ProgramEdition
from app.models.user import CandidateProfile, User
from app.schemas.application import ApplicationDetail, ApplicationListResponse, StatusChangeRequest
from app.services.application_service import validate_transition

router = APIRouter(prefix="/admin", tags=["admin"])


def _to_detail(a: ProgramApplication) -> ApplicationDetail:
    return ApplicationDetail(
        id=a.id, user_id=a.user_id, edition_id=a.edition_id,
        status=a.status, form_data=a.form_data or {},
        submitted_at=a.submitted_at, created_at=a.created_at, updated_at=a.updated_at,
        program_name=a.edition.program.name if a.edition and a.edition.program else None,
        edition_name=a.edition.edition_name if a.edition else None,
        candidate_first_name=a.user.profile.first_name if a.user and a.user.profile else None,
        candidate_last_name=a.user.profile.last_name if a.user and a.user.profile else None,
        candidate_email=a.user.email if a.user else None,
    )


@router.get("/applications", response_model=ApplicationListResponse)
async def admin_list_applications(
    status_filter: str | None = Query(None, alias="status"),
    program_id: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all applications with pagination and total count."""
    base_query = select(ProgramApplication)
    count_query = select(func.count(ProgramApplication.id))

    if status_filter:
        base_query = base_query.where(ProgramApplication.status == status_filter)
        count_query = count_query.where(ProgramApplication.status == status_filter)
    if program_id:
        base_query = base_query.join(ProgramEdition).where(ProgramEdition.program_id == program_id)
        count_query = count_query.join(ProgramEdition).where(ProgramEdition.program_id == program_id)

    total = await db.scalar(count_query)

    query = (
        base_query
        .options(
            selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program),
            selectinload(ProgramApplication.user).selectinload(User.profile),
        )
        .order_by(ProgramApplication.updated_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await db.execute(query)
    apps = result.scalars().all()

    return ApplicationListResponse(
        items=[_to_detail(a) for a in apps],
        total=total or 0,
        page=page,
        limit=limit,
    )


@router.get("/programs/{program_id}/applications", response_model=list[ApplicationDetail])
async def admin_program_applications(
    program_id: str,
    status_filter: str | None = Query(None, alias="status"),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List applications for a specific program."""
    query = (
        select(ProgramApplication)
        .join(ProgramEdition)
        .where(ProgramEdition.program_id == program_id)
        .options(
            selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program),
            selectinload(ProgramApplication.user).selectinload(User.profile),
        )
        .order_by(ProgramApplication.updated_at.desc())
    )
    if status_filter:
        query = query.where(ProgramApplication.status == status_filter)

    result = await db.execute(query)
    return [_to_detail(a) for a in result.scalars().all()]


@router.patch("/applications/{application_id}/status", response_model=ApplicationDetail)
async def admin_change_status(
    application_id: UUID,
    body: StatusChangeRequest,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Change application status (admin only). Creates a notification for the candidate."""
    result = await db.execute(
        select(ProgramApplication).where(ProgramApplication.id == application_id)
        .options(
            selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program),
            selectinload(ProgramApplication.user).selectinload(User.profile),
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(404, "Zgłoszenie nie znalezione")

    if not validate_transition(app.status, body.new_status):
        raise HTTPException(400, f"Niedozwolone przejście: {app.status} → {body.new_status}")

    old = app.status
    app.status = body.new_status

    db.add(ApplicationStatusHistory(
        application_id=app.id, old_status=old, new_status=body.new_status,
        changed_by=user.id, note=body.note, changed_at=datetime.now(timezone.utc),
    ))

    # Create notification for the candidate
    notification_titles = {
        "submitted": "Zgłoszenie otrzymane",
        "documents_incomplete": "Dokumenty wymagają uzupełnienia",
        "documents_verified": "Dokumenty zweryfikowane",
        "awaiting_enrollment_fee": "Wymagana opłata wpisowa",
        "enrollment_fee_paid": "Opłata wpisowa potwierdzona",
        "awaiting_payment": "Wymagana opłata za studia",
        "payment_confirmed": "Płatność potwierdzona",
        "accepted": "Zostałeś przyjęty!",
        "waitlisted": "Jesteś na liście rezerwowej",
        "rejected": "Zgłoszenie odrzucone",
        "cancelled": "Zgłoszenie anulowane",
        "studies_not_launched": "Studia nie zostały uruchomione",
    }
    title = notification_titles.get(body.new_status, f"Zmiana statusu: {body.new_status}")
    body_text = body.note or f"Status Twojego zgłoszenia zmienił się z '{old}' na '{body.new_status}'."

    db.add(Notification(
        user_id=app.user_id,
        application_id=app.id,
        type="status_change",
        title=title,
        body=body_text,
        channel="system",
    ))

    await db.commit()
    await db.refresh(app)
    return _to_detail(app)
