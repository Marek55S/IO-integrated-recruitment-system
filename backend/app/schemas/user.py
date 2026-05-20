from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ── Profile sub-models ──────────────────────────────────────
class AddressSchema(BaseModel):
    type: str
    country: str | None = None
    city: str | None = None
    postal_code: str | None = None
    street: str | None = None
    house_number: str | None = None

    model_config = {"from_attributes": True}


class EducationSchema(BaseModel):
    academic_title: str | None = None
    university_name: str | None = None
    graduation_year: int | None = None
    diploma_country: str | None = None
    diploma_country_name: str | None = None

    model_config = {"from_attributes": True}


class EmergencyContactSchema(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None

    model_config = {"from_attributes": True}


class AgreementSchema(BaseModel):
    agreement_type: str
    accepted: bool
    accepted_at: datetime | None = None

    model_config = {"from_attributes": True}


# ── User response ───────────────────────────────────────────
class UserMeResponse(BaseModel):
    id: UUID
    email: str
    role: str
    first_name: str | None = None
    last_name: str | None = None

    model_config = {"from_attributes": True}


# ── Full profile response ──────────────────────────────────
class ProfileResponse(BaseModel):
    id: UUID
    email: str
    role: str
    first_name: str | None = None
    last_name: str | None = None
    family_name: str | None = None
    pesel: str | None = None
    birth_date: date | None = None
    birth_place: str | None = None
    citizenship: str | None = None
    phone: str | None = None
    addresses: list[AddressSchema] = []
    education: EducationSchema | None = None
    emergency_contact: EmergencyContactSchema | None = None
    agreements: list[AgreementSchema] = []

    model_config = {"from_attributes": True}


# ── Profile update ──────────────────────────────────────────
class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    family_name: str | None = None
    pesel: str | None = None
    birth_date: date | None = None
    birth_place: str | None = None
    citizenship: str | None = None
    phone: str | None = None

    # Nested updates
    residence_address: AddressSchema | None = None
    correspondence_address: AddressSchema | None = None
    education: EducationSchema | None = None
    emergency_contact: EmergencyContactSchema | None = None
