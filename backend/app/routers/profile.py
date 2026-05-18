from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_candidate
from app.models.user import Address, CandidateProfile, EducationRecord, EmergencyContact, User
from app.schemas.user import AddressSchema, EducationSchema, EmergencyContactSchema, ProfileResponse, ProfileUpdate
from app.utils.security import decrypt_sensitive, encrypt_sensitive

router = APIRouter(prefix="/profile", tags=["profile"])


def _safe_decrypt(value: str | None) -> str | None:
    """Decrypt a value encrypted with AES-256-GCM. Falls back to plain text for legacy values."""
    if not value:
        return value
    try:
        return decrypt_sensitive(value)
    except Exception:
        # Value was stored as plain text (legacy) — return as-is
        return value


@router.get("", response_model=ProfileResponse)
async def get_profile(user: User = Depends(require_candidate)):
    """Get full profile of the current candidate."""
    profile = user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil nie znaleziony")

    return ProfileResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        first_name=profile.first_name,
        last_name=profile.last_name,
        family_name=profile.family_name,
        pesel=_safe_decrypt(profile.pesel),  # always return plain-text PESEL
        birth_date=profile.birth_date,
        birth_place=profile.birth_place,
        citizenship=profile.citizenship,
        phone=profile.phone,
        addresses=[AddressSchema.model_validate(a) for a in user.addresses],
        education=EducationSchema.model_validate(user.education) if user.education else None,
        emergency_contact=EmergencyContactSchema.model_validate(user.emergency_contact) if user.emergency_contact else None,
        agreements=[{"agreement_type": a.agreement_type, "accepted": a.accepted, "accepted_at": a.accepted_at} for a in user.agreements],
    )


@router.put("", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
):
    """Update candidate profile data."""
    profile = user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profil nie znaleziony")

    # Update basic profile fields
    if body.first_name is not None:
        profile.first_name = body.first_name
    if body.last_name is not None:
        profile.last_name = body.last_name
    if body.family_name is not None:
        profile.family_name = body.family_name
    if body.pesel is not None:
        profile.pesel = encrypt_sensitive(body.pesel)
    if body.birth_date is not None:
        profile.birth_date = body.birth_date
    if body.birth_place is not None:
        profile.birth_place = body.birth_place
    if body.citizenship is not None:
        profile.citizenship = body.citizenship
    if body.phone is not None:
        profile.phone = body.phone

    # Update or create residence address
    if body.residence_address is not None:
        await _upsert_address(db, user.id, "residence", body.residence_address)

    # Update or create correspondence address
    if body.correspondence_address is not None:
        await _upsert_address(db, user.id, "correspondence", body.correspondence_address)

    # Update or create education
    if body.education is not None:
        await _upsert_education(db, user.id, body.education)

    # Update or create emergency contact
    if body.emergency_contact is not None:
        await _upsert_emergency(db, user.id, body.emergency_contact)

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    # Re-fetch user with relationships
    await db.refresh(user)
    return await get_profile(user)


async def _upsert_address(db: AsyncSession, user_id, addr_type: str, data: AddressSchema):
    result = await db.execute(
        select(Address).where(Address.user_id == user_id, Address.type == addr_type)
    )
    addr = result.scalar_one_or_none()
    if addr:
        for field in ("country", "city", "postal_code", "street", "house_number"):
            val = getattr(data, field, None)
            if val is not None:
                setattr(addr, field, val)
    else:
        addr = Address(user_id=user_id, type=addr_type, **data.model_dump(exclude={"type"}, exclude_none=True))
        db.add(addr)


async def _upsert_education(db: AsyncSession, user_id, data: EducationSchema):
    result = await db.execute(select(EducationRecord).where(EducationRecord.user_id == user_id))
    edu = result.scalar_one_or_none()
    if edu:
        for field in ("academic_title", "university_name", "graduation_year", "diploma_country", "diploma_country_name"):
            val = getattr(data, field, None)
            if val is not None:
                setattr(edu, field, val)
    else:
        edu = EducationRecord(user_id=user_id, **data.model_dump(exclude_none=True))
        db.add(edu)


async def _upsert_emergency(db: AsyncSession, user_id, data: EmergencyContactSchema):
    result = await db.execute(select(EmergencyContact).where(EmergencyContact.user_id == user_id))
    contact = result.scalar_one_or_none()
    if contact:
        for field in ("full_name", "email", "phone"):
            val = getattr(data, field, None)
            if val is not None:
                setattr(contact, field, val)
    else:
        contact = EmergencyContact(user_id=user_id, **data.model_dump(exclude_none=True))
        db.add(contact)
