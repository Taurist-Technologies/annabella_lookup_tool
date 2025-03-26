from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class DMEProvider(BaseModel):
    id: Optional[int] = None
    company_name: str
    state: str
    insurance_providers: List[str]
    phone_number: str
    email: EmailStr
    weblink: str
    multiple_pump_models: bool
    upgrade_pumps_available: bool
    resupply_available: bool
    accessories_available: bool
    lactation_services_available: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


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
