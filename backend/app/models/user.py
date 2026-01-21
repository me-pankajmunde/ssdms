from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    TEMPLE_MANAGER = "TEMPLE_MANAGER"
    CONTENT_EDITOR = "CONTENT_EDITOR"
    SEVA_COORDINATOR = "SEVA_COORDINATOR"
    ACCOUNTANT = "ACCOUNTANT"

class Permissions(BaseModel):
    events: dict = {"create": False, "read": True, "update": False, "delete": False}
    donations: dict = {"create": False, "read": False, "update": False, "delete": False}
    content: dict = {"create": False, "read": True, "update": False, "delete": False}
    users: dict = {"create": False, "read": False, "update": False, "delete": False}
    reports: dict = {"read": False, "export": False}

class UserProfile(BaseModel):
    name: str
    phone: Optional[str] = None
    designation: Optional[str] = None

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CONTENT_EDITOR
    profile: UserProfile

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    profile: Optional[UserProfile] = None
    isActive: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: UserRole
    profile: UserProfile
    permissions: Permissions
    isActive: bool
    lastLogin: Optional[datetime] = None
    createdAt: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[UserRole] = None

# Default permissions based on role
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: Permissions(
        events={"create": True, "read": True, "update": True, "delete": True},
        donations={"create": True, "read": True, "update": True, "delete": True},
        content={"create": True, "read": True, "update": True, "delete": True},
        users={"create": True, "read": True, "update": True, "delete": True},
        reports={"read": True, "export": True}
    ),
    UserRole.TEMPLE_MANAGER: Permissions(
        events={"create": True, "read": True, "update": True, "delete": False},
        donations={"create": True, "read": True, "update": False, "delete": False},
        content={"create": True, "read": True, "update": True, "delete": False},
        users={"create": False, "read": True, "update": False, "delete": False},
        reports={"read": True, "export": True}
    ),
    UserRole.CONTENT_EDITOR: Permissions(
        events={"create": True, "read": True, "update": True, "delete": False},
        donations={"create": False, "read": False, "update": False, "delete": False},
        content={"create": True, "read": True, "update": True, "delete": False},
        users={"create": False, "read": False, "update": False, "delete": False},
        reports={"read": False, "export": False}
    ),
    UserRole.SEVA_COORDINATOR: Permissions(
        events={"create": True, "read": True, "update": True, "delete": False},
        donations={"create": False, "read": True, "update": False, "delete": False},
        content={"create": False, "read": True, "update": False, "delete": False},
        users={"create": False, "read": False, "update": False, "delete": False},
        reports={"read": True, "export": False}
    ),
    UserRole.ACCOUNTANT: Permissions(
        events={"create": False, "read": True, "update": False, "delete": False},
        donations={"create": False, "read": True, "update": True, "delete": False},
        content={"create": False, "read": True, "update": False, "delete": False},
        users={"create": False, "read": False, "update": False, "delete": False},
        reports={"read": True, "export": True}
    ),
}
