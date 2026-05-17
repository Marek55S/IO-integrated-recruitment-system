import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, SmallInteger, String
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


# ════════════════════════════════════════════════════════════
#  USERS
# ════════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        ENUM(
            "candidate", "admin_coordinator", "program_director",
            "cok_staff", "it_admin",
            name="user_role", create_type=False,
        ),
        nullable=False,
        default="candidate",
    )
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # relationships
    profile = relationship("CandidateProfile", back_populates="user", uselist=False, lazy="selectin")
    addresses = relationship("Address", back_populates="user", lazy="selectin")
    education = relationship("EducationRecord", back_populates="user", uselist=False, lazy="selectin")
    emergency_contact = relationship("EmergencyContact", back_populates="user", uselist=False, lazy="selectin")
    agreements = relationship("UserAgreement", back_populates="user", lazy="selectin")
    applications = relationship("ProgramApplication", back_populates="user", lazy="noload")
    notifications = relationship("Notification", back_populates="user", lazy="noload")


# ════════════════════════════════════════════════════════════
#  CANDIDATE DATA
# ════════════════════════════════════════════════════════════

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    family_name = Column(String(100))
    pesel = Column(String(255))
    birth_date = Column(Date)
    birth_place = Column(String(100))
    citizenship = Column(String(100))
    phone = Column(String(20))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=False)  # 'residence' | 'correspondence'
    country = Column(String(100))
    city = Column(String(100))
    postal_code = Column(String(10))
    street = Column(String(200))
    house_number = Column(String(20))

    user = relationship("User", back_populates="addresses")


class EducationRecord(Base):
    __tablename__ = "education_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    academic_title = Column(String(50))
    university_name = Column(String(255))
    graduation_year = Column(SmallInteger)
    diploma_country = Column(String(20))
    diploma_country_name = Column(String(100))

    user = relationship("User", back_populates="education")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(200))
    email = Column(String(255))
    phone = Column(String(20))

    user = relationship("User", back_populates="emergency_contact")


class UserAgreement(Base):
    __tablename__ = "user_agreements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agreement_type = Column(String(50), nullable=False)  # 'rodo' | 'marketing'
    accepted = Column(Boolean, nullable=False, default=False)
    accepted_at = Column(DateTime(timezone=True))


    user = relationship("User", back_populates="agreements")
