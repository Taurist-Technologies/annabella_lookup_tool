from fastapi import APIRouter, HTTPException
from ..models.models import (
    SearchRequest,
    DMEProvider,
    State,
    InsuranceProvider,
    UserEmail,
)
from ..core.supabase import supabase
from typing import List

router = APIRouter()


@router.get("/states", response_model=List[State])
async def get_states():
    try:
        response = supabase.table("states").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insurance-providers", response_model=List[InsuranceProvider])
async def get_insurance_providers():
    try:
        response = supabase.table("insurance_providers").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search-dme", response_model=List[DMEProvider])
async def search_dme(request: SearchRequest):
    try:
        # Store email
        supabase.table("user_emails").insert({"email": request.email}).execute()

        # Query DME providers
        response = (
            supabase.table("dme_providers")
            .select("*")
            .eq("state", request.state)
            .contains("insurance_providers", [request.insurance_provider])
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
