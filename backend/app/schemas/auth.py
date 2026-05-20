from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Hasło musi mieć co najmniej 8 znaków")
    firstName: str
    lastName: str
    pesel: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(char.isupper() for char in v):
            raise ValueError("Hasło musi zawierać co najmniej jedną wielką literę")
        if not any(char.isdigit() for char in v):
            raise ValueError("Hasło musi zawierać co najmniej jedną cyfrę")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str
