import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import CandidateProfile, User
from app.schemas.auth import LoginRequest, MessageResponse, RegisterRequest, TokenResponse
from app.schemas.user import UserMeResponse
from app.utils.security import create_access_token, encrypt_sensitive, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

# Simple in-memory token store: {token: (user_id, expires_at)}
_reset_tokens: dict[str, tuple[str, datetime]] = {}


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new candidate account."""
    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email już istnieje")

    # Create user
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role="candidate",
    )
    db.add(user)
    await db.flush()  # get user.id

    # Create candidate profile
    profile = CandidateProfile(
        user_id=user.id,
        first_name=body.firstName,
        last_name=body.lastName,
        pesel=encrypt_sensitive(body.pesel) if body.pesel else None,
    )
    db.add(profile)
    await db.commit()

    return MessageResponse(message="Rejestracja zakończona pomyślnie")


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and return JWT token."""
    result = await db.execute(
        select(User).where(User.email == body.email, User.is_active.is_(True))
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nieprawidłowe dane logowania")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMeResponse)
async def me(user: User = Depends(get_current_user)):
    """Return current authenticated user info."""
    return UserMeResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        first_name=user.profile.first_name if user.profile else None,
        last_name=user.profile.last_name if user.profile else None,
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(user: User = Depends(get_current_user)):
    """Logout — client should discard the token."""
    return MessageResponse(message="Wylogowano pomyślnie")


# ── Password Reset ─────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generate a password reset token. In production, send via email."""
    result = await db.execute(
        select(User).where(User.email == body.email, User.is_active.is_(True))
    )
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        return MessageResponse(message="Jeśli email istnieje w systemie, wyślemy link resetujący")

    # Invalidate old tokens for this user
    global _reset_tokens
    _reset_tokens = {
        t: (uid, exp) for t, (uid, exp) in _reset_tokens.items()
        if uid != str(user.id)
    }

    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    _reset_tokens[token] = (str(user.id), expires)

    # In production: send email. For now, return token in response for dev use.
    return MessageResponse(message=f"Token resetowania: {token}")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using a token."""
    entry = _reset_tokens.get(body.token)
    if not entry:
        raise HTTPException(status_code=400, detail="Nieprawidłowy lub wygasły token resetowania")

    user_id, expires = entry
    if datetime.now(timezone.utc) > expires:
        del _reset_tokens[body.token]
        raise HTTPException(status_code=400, detail="Token wygasł — wygeneruj nowy")

    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Hasło musi mieć co najmniej 8 znaków")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")

    user.password_hash = hash_password(body.new_password)
    del _reset_tokens[body.token]
    await db.commit()

    return MessageResponse(message="Hasło zostało zmienione pomyślnie")

