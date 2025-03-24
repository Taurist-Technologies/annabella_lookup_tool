from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class DMEProvider(BaseModel):
    id: Optional[int] = None
    name: str
    state: str
    insurance_providers: List[str]
    contact_info: str
    location: str


class UserEmail(BaseModel):
    id: Optional[int] = None
    email: EmailStr
    created_at: Optional[datetime] = None


class State(BaseModel):
    id: Optional[int] = None
    name: str
    abbreviation: str


class InsuranceProvider(BaseModel):
    id: Optional[int] = None
    name: str


class SearchRequest(BaseModel):
    state: str
    insurance_provider: str
    email: EmailStr
