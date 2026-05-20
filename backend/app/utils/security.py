from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings


# ── Password hashing (bcrypt) ──────────────────────────────
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── JWT ─────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


# ── AES-256-GCM encryption (for PESEL etc.) ────────────────
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def encrypt_sensitive(text: str) -> str:
    """Encrypt to format compatible with Next.js: iv_hex:tag_hex:ciphertext_hex"""
    if not text:
        return text
    key = settings.ENCRYPTION_KEY.encode()
    iv = os.urandom(16)
    aesgcm = AESGCM(key)
    # AESGCM returns ciphertext + tag concatenated
    ct_with_tag = aesgcm.encrypt(iv, text.encode(), None)
    # Split: last 16 bytes = tag, rest = ciphertext
    ciphertext = ct_with_tag[:-16]
    tag = ct_with_tag[-16:]
    return f"{iv.hex()}:{tag.hex()}:{ciphertext.hex()}"


def decrypt_sensitive(encrypted: str) -> str:
    """Decrypt format: iv_hex:tag_hex:ciphertext_hex"""
    if not encrypted:
        return encrypted
    parts = encrypted.split(":")
    if len(parts) != 3:
        raise ValueError("Invalid encrypted format")
    iv = bytes.fromhex(parts[0])
    tag = bytes.fromhex(parts[1])
    ciphertext = bytes.fromhex(parts[2])
    key = settings.ENCRYPTION_KEY.encode()
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(iv, ciphertext + tag, None)
    return plaintext.decode()
