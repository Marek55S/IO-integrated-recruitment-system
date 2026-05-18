from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user, require_candidate
from app.models.application import ApplicationStatusHistory, ProgramApplication
from app.models.program import ProgramEdition
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationResponse, StatusHistoryResponse
from app.services.application_service import validate_transition

router = APIRouter(prefix="/applications", tags=["applications"])


def _to_response(app: ProgramApplication) -> ApplicationResponse:
    """Convert ORM model to response, enriching with joined data."""
    edition = app.edition
    return ApplicationResponse(
        id=app.id,
        user_id=app.user_id,
        edition_id=app.edition_id,
        status=app.status,
        form_data=app.form_data or {},
        submitted_at=app.submitted_at,
        created_at=app.created_at,
        updated_at=app.updated_at,
        program_name=edition.program.name if edition and edition.program else None,
        program_id=edition.program_id if edition else None,
        edition_name=edition.edition_name if edition else None,
    )



@router.get("", response_model=list[ApplicationResponse])
async def my_applications(
    user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
):
    """List current candidate's applications."""
    result = await db.execute(
        select(ProgramApplication)
        .where(ProgramApplication.user_id == user.id)
        .options(selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program))
        .order_by(ProgramApplication.updated_at.desc())
    )
    apps = result.scalars().all()
    return [_to_response(a) for a in apps]


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    body: ApplicationCreate,
    user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
):
    """Create a new application (draft) for a program edition."""
    # Verify edition exists and is active
    edition_result = await db.execute(
        select(ProgramEdition)
        .where(ProgramEdition.id == body.edition_id, ProgramEdition.is_active.is_(True))
        .options(selectinload(ProgramEdition.program))
    )
    edition = edition_result.scalar_one_or_none()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edycja nie znaleziona lub nieaktywna")

    # Check recruitment dates
    today = date.today()
    if edition.recruitment_start and today < edition.recruitment_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rekrutacja jeszcze się nie rozpoczęła. Start: {edition.recruitment_start}",
        )
    if edition.recruitment_end and today > edition.recruitment_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Rekrutacja na tę edycję już się zakończyła ({edition.recruitment_end})",
        )

    # Check for duplicate
    dup = await db.execute(
        select(ProgramApplication).where(
            ProgramApplication.user_id == user.id,
            ProgramApplication.edition_id == body.edition_id,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Już złożono zgłoszenie na tę edycję")

    app = ProgramApplication(
        user_id=user.id,
        edition_id=body.edition_id,
        status="draft",
        form_data=body.form_data,
    )
    db.add(app)
    await db.flush()  # get app.id

    # Initial status history entry
    history = ApplicationStatusHistory(
        application_id=app.id,
        old_status=None,
        new_status="draft",
        changed_by=user.id,
    )
    db.add(history)
    await db.commit()
    await db.refresh(app)

    # Re-load with joins
    result = await db.execute(
        select(ProgramApplication)
        .where(ProgramApplication.id == app.id)
        .options(selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program))
    )
    app = result.scalar_one()
    return _to_response(app)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get application details (owner or admin)."""
    result = await db.execute(
        select(ProgramApplication)
        .where(ProgramApplication.id == application_id)
        .options(selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zgłoszenie nie znalezione")

    # Owner or admin can view
    from app.models.enums import ADMIN_ROLES, UserRole
    if app.user_id != user.id and UserRole(user.role) not in ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostępu")

    return _to_response(app)


@router.patch("/{application_id}/submit", response_model=ApplicationResponse)
async def submit_application(
    application_id: UUID,
    user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
):
    """Submit a draft application."""
    result = await db.execute(
        select(ProgramApplication)
        .where(ProgramApplication.id == application_id, ProgramApplication.user_id == user.id)
        .options(selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zgłoszenie nie znalezione")

    if not validate_transition(app.status, "submitted"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nie można zmienić statusu z '{app.status}' na 'submitted'")

    old_status = app.status
    app.status = "submitted"
    app.submitted_at = datetime.now(timezone.utc)

    history = ApplicationStatusHistory(
        application_id=app.id,
        old_status=old_status,
        new_status="submitted",
        changed_by=user.id,
    )
    db.add(history)
    await db.commit()
    await db.refresh(app)
    return _to_response(app)


@router.patch("/{application_id}/cancel", response_model=ApplicationResponse)
async def cancel_application(
    application_id: UUID,
    user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
):
    """Cancel an application."""
    result = await db.execute(
        select(ProgramApplication)
        .where(ProgramApplication.id == application_id, ProgramApplication.user_id == user.id)
        .options(selectinload(ProgramApplication.edition).selectinload(ProgramEdition.program))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zgłoszenie nie znalezione")

    if not validate_transition(app.status, "cancelled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nie można anulować zgłoszenia w statusie '{app.status}'")

    old_status = app.status
    app.status = "cancelled"

    history = ApplicationStatusHistory(
        application_id=app.id,
        old_status=old_status,
        new_status="cancelled",
        changed_by=user.id,
    )
    db.add(history)
    await db.commit()
    await db.refresh(app)
    return _to_response(app)


@router.get("/{application_id}/history", response_model=list[StatusHistoryResponse])
async def get_status_history(
    application_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get status change history for an application (owner or admin)."""
    # Verify application access
    app_result = await db.execute(
        select(ProgramApplication).where(ProgramApplication.id == application_id)
    )
    app = app_result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zgłoszenie nie znalezione")

    from app.models.enums import ADMIN_ROLES, UserRole
    if app.user_id != user.id and UserRole(user.role) not in ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostępu")

    result = await db.execute(
        select(ApplicationStatusHistory)
        .where(ApplicationStatusHistory.application_id == application_id)
        .order_by(ApplicationStatusHistory.changed_at.asc())
    )
    return result.scalars().all()


