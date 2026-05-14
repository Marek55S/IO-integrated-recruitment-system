from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import require_admin
from app.models.application import ApplicationStatusHistory, ProgramApplication
from app.models.program import ProgramEdition
from app.models.user import CandidateProfile, User
from app.schemas.application import ApplicationDetail, StatusChangeRequest
from app.services.application_service import validate_transition

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/applications", response_model=list[ApplicationDetail])
async def admin_list_applications(
    status_filter: str | None = Query(None, alias="status"),
    program_id: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ProgramApplication)
        .options(
            selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program),
            selectinload(ProgramApplication.user).selectinload(User.profile),
        )
        .order_by(ProgramApplication.updated_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    if status_filter:
        query = query.where(ProgramApplication.status == status_filter)
    if program_id:
        query = query.join(ProgramEdition).where(ProgramEdition.program_id == program_id)

    result = await db.execute(query)
    apps = result.scalars().all()

    return [
        ApplicationDetail(
            id=a.id, user_id=a.user_id, edition_id=a.edition_id,
            status=a.status, form_data=a.form_data or {}, submitted_at=a.submitted_at, updated_at=a.updated_at,
            program_name=a.edition.program.name if a.edition and a.edition.program else None,
            edition_name=a.edition.edition_name if a.edition else None,
            candidate_first_name=a.user.profile.first_name if a.user and a.user.profile else None,
            candidate_last_name=a.user.profile.last_name if a.user and a.user.profile else None,
            candidate_email=a.user.email if a.user else None,
        )
        for a in apps
    ]


@router.get("/programs/{program_id}/applications", response_model=list[ApplicationDetail])
async def admin_program_applications(
    program_id: str,
    status_filter: str | None = Query(None, alias="status"),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
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
    apps = result.scalars().all()

    return [
        ApplicationDetail(
            id=a.id, user_id=a.user_id, edition_id=a.edition_id,
            status=a.status, form_data=a.form_data or {}, submitted_at=a.submitted_at, updated_at=a.updated_at,
            program_name=a.edition.program.name if a.edition and a.edition.program else None,
            edition_name=a.edition.edition_name if a.edition else None,
            candidate_first_name=a.user.profile.first_name if a.user and a.user.profile else None,
            candidate_last_name=a.user.profile.last_name if a.user and a.user.profile else None,
            candidate_email=a.user.email if a.user else None,
        )
        for a in apps
    ]


@router.patch("/applications/{application_id}/status", response_model=ApplicationDetail)
async def admin_change_status(
    application_id: UUID,
    body: StatusChangeRequest,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
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
    await db.commit()
    await db.refresh(app)

    return ApplicationDetail(
        id=app.id, user_id=app.user_id, edition_id=app.edition_id,
        status=app.status, form_data=app.form_data or {}, submitted_at=app.submitted_at, updated_at=app.updated_at,
        program_name=app.edition.program.name if app.edition and app.edition.program else None,
        edition_name=app.edition.edition_name if app.edition else None,
        candidate_first_name=app.user.profile.first_name if app.user and app.user.profile else None,
        candidate_last_name=app.user.profile.last_name if app.user and app.user.profile else None,
        candidate_email=app.user.email if app.user else None,
    )
