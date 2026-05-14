import os
from datetime import datetime, timezone
from uuid import UUID

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.application import ProgramApplication
from app.models.document import ApplicationDocument
from app.models.enums import ADMIN_ROLES, UserRole
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentReviewRequest

router = APIRouter(tags=["documents"])


@router.get("/applications/{application_id}/documents", response_model=list[DocumentResponse])
async def list_documents(
    application_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List documents for an application (owner or admin)."""
    app_result = await db.execute(
        select(ProgramApplication).where(ProgramApplication.id == application_id)
    )
    app = app_result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zgłoszenie nie znalezione")

    if app.user_id != user.id and UserRole(user.role) not in ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostępu")

    result = await db.execute(
        select(ApplicationDocument)
        .where(ApplicationDocument.application_id == application_id)
        .order_by(ApplicationDocument.uploaded_at.desc())
    )
    return result.scalars().all()


@router.post(
    "/applications/{application_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    application_id: UUID,
    file: UploadFile,
    doc_type: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document for an application."""
    # Verify ownership
    app_result = await db.execute(
        select(ProgramApplication).where(
            ProgramApplication.id == application_id,
            ProgramApplication.user_id == user.id,
        )
    )
    if not app_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Brak dostępu do tego zgłoszenia")

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)

    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    doc = ApplicationDocument(
        application_id=application_id,
        doc_type=doc_type,
        file_path=f"/uploads/{safe_name}",
        file_name=file.filename or safe_name,
        mime_type=file.content_type,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.patch("/documents/{document_id}/review", response_model=DocumentResponse)
async def review_document(
    document_id: UUID,
    body: DocumentReviewRequest,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin reviews a document (accept/reject)."""
    if body.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status musi być 'accepted' lub 'rejected'")

    result = await db.execute(select(ApplicationDocument).where(ApplicationDocument.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dokument nie znaleziony")

    doc.status = body.status
    doc.review_note = body.note
    doc.reviewed_by = user.id
    doc.reviewed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(doc)
    return doc
