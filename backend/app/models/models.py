from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime


class DMECoverage(BaseModel):
    dme_id: str = Field(..., description="ID of the DME company")
    insurance: str = Field(..., description="Insurance provider name")
    state: str = Field(..., description="State code")
    medicaid: bool = Field(..., description="Whether Medicaid is accepted")
    resupply_available: bool = Field(..., description="Whether resupply is available")
    accessories_available: bool = Field(
        ..., description="Whether accessories are available"
    )
    lactation_services_available: bool = Field(
        ..., description="Whether lactation services are available"
    )


class DMEUploadResponse(BaseModel):
    companies_loaded: int
    coverage_entries_loaded: int
    message: str


class DMEProvider(BaseModel):
    id: Optional[int] = None
    dme_name: str
    state: str
    insurance_providers: Optional[List[str]] = None
    phone: str
    email: EmailStr
    dedicated_link: str
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


class InsuranceProviders(BaseModel):
    insurances: List[str]


class SearchRequest(BaseModel):
    state: str = Field(..., min_length=2, max_length=2, description="US state code")
    insurance_provider: str = Field(..., description="Full or partial insurance name")
    email: EmailStr


class DMECompany(BaseModel):
    coverage: DMECoverage

    name: str = Field(..., description="Name of the DME company")
    phone: str = Field(..., description="Phone number of the DME company")
    email: str = Field(..., description="Email address of the DME company")
    dedicated_link: str = Field(..., description="Dedicated link for the DME company")

    def to_dme_provider(self) -> DMEProvider:
        return DMEProvider(
            dme_name=self.name,
            phone=self.phone,
            email=self.email,
            dedicated_link=self.dedicated_link,
            resupply_available=self.coverage.resupply_available,
            accessories_available=self.coverage.accessories_available,
            lactation_services_available=self.coverage.lactation_services_available,
        )


class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    dedicated_link: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Updated DME Name",
                "phone": "123-456-7890",
                "email": "updated@example.com",
                "dedicated_link": "https://updated-link.com",
            }
        }


class InsuranceStateUploadResponse(BaseModel):
    mappings_added: int
    skipped_rows: List[str] = []
    message: str


## TRACKING MODELS


class ClickTrackingRequest(BaseModel):
    provider_id: int = Field(..., description="ID of the clicked provider")
    user_email: EmailStr = Field(..., description="Email of the user who clicked")
    search_state: str = Field(
        ..., min_length=2, max_length=2, description="State searched"
    )
    search_insurance: str = Field(..., description="Insurance provider searched")
    click_type: str = Field(
        default="manual", description="Type of click: manual or auto_redirect"
    )
    session_id: Optional[str] = Field(None, description="Unique session identifier")
    user_agent: Optional[str] = Field(None, description="User agent string")
    referrer: Optional[str] = Field(None, description="Referrer URL")


class ClickTrackingResponse(BaseModel):
    success: bool
    message: str
    click_id: Optional[int] = None


class ClickAnalytics(BaseModel):
    provider_id: int
    provider_name: str
    total_clicks: int
    manual_clicks: int
    auto_redirects: int
    unique_users: int
    avg_clicks_per_user: float
    top_states: List[str]
    top_insurances: List[str]


class ClickAnalyticsRequest(BaseModel):
    start_date: Optional[str] = Field(None, description="Start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM-DD)")
    provider_id: Optional[int] = Field(None, description="Filter by specific provider")
    state: Optional[str] = Field(None, description="Filter by specific state")
