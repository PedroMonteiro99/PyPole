"""User schemas"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Shared properties
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    is_active: bool = True
    is_superuser: bool = False
    favorite_team: Optional[str] = None
    favorite_driver: Optional[str] = None
    theme: str = "dark"


# Properties to receive via API on creation
class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8, max_length=72)


# Properties to receive via API on update
class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=8, max_length=72)
    is_active: Optional[bool] = None
    favorite_team: Optional[str] = None
    favorite_driver: Optional[str] = None
    theme: Optional[str] = None


class UserPreferences(BaseModel):
    """User preferences schema"""
    favorite_team: Optional[str] = None
    favorite_driver: Optional[str] = None
    theme: str = "dark"


# Properties shared by models stored in DB
class UserInDBBase(UserBase):
    """Base user schema with DB fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# Properties to return to client
class User(UserInDBBase):
    """User response schema"""
    pass


# Properties stored in DB
class UserInDB(UserInDBBase):
    """User in DB schema"""
    hashed_password: str


# Token schemas
class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Token payload schema"""
    sub: Optional[int] = None

