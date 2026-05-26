from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    password: str
    role: str = "USER" # USER or ASHA

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: str
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    role: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
