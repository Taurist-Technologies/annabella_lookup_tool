from fastapi import APIRouter, HTTPException
from ..models.models import (
    SearchRequest,
    DMEProvider,
    State,
    InsuranceProvider,
    UserEmail,
    BulkDMERequest,
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
        raise HTTPException(status_code=500, detail=str("Nah Son.."))


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
        # supabase.table("user_emails").insert({"email": request.email}).execute()

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


@router.post("/dme", response_model=DMEProvider)
async def create_dme(dme: DMEProvider):
    try:
        # Validate state exists
        state_response = (
            supabase.table("states")
            .select("abbreviation")
            .eq("abbreviation", dme.state)
            .execute()
        )
        if not state_response.data:
            raise HTTPException(
                status_code=400, detail=f"Invalid state abbreviation: {dme.state}"
            )

        # Insert the new DME provider
        response = (
            supabase.table("dme_providers")
            .insert(dme.dict(exclude={"id", "created_at", "updated_at"}))
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create DME provider")

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dme/bulk", response_model=List[DMEProvider])
async def create_bulk_dme(request: BulkDMERequest):
    try:
        # Validate states exist
        states = set(dme.state for dme in request.dmes)
        state_response = (
            supabase.table("states")
            .select("abbreviation")
            .in_("abbreviation", list(states))
            .execute()
        )
        valid_states = set(state["abbreviation"] for state in state_response.data)

        invalid_states = states - valid_states
        if invalid_states:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid state abbreviations: {', '.join(invalid_states)}",
            )

        # Insert all DME providers
        dme_data = [
            dme.dict(exclude={"id", "created_at", "updated_at"}) for dme in request.dmes
        ]
        response = supabase.table("dme_providers").insert(dme_data).execute()

        if not response.data:
            raise HTTPException(
                status_code=500, detail="Failed to create DME providers"
            )

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
