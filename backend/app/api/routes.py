from dotenv import load_dotenv
import os
import pandas as pd
import io
from fastapi.responses import StreamingResponse
from app.core.file_process import (
    process_csv_async,
    process_provider_insurance_states_csv,
)


load_dotenv()

from fastapi import APIRouter, HTTPException, File, UploadFile, Query, BackgroundTasks
from ..models.models import (
    SearchRequest,
    DMEProvider,
    State,
    UserEmail,
    InsuranceProviders,
    DMECompany,
    DMECoverage,
    DMEUploadResponse,
    ProviderUpdate,
    InsuranceStateUploadResponse,
)
from ..core.supabase import supabase
from typing import List, Dict
import asyncio
import uuid

router = APIRouter()

# Add to routes.py
processing_status: Dict[str, Dict] = {}


@router.get("/states", response_model=List[State])
async def get_states():
    try:
        response = supabase.table(os.getenv("STATES_TABLE")).select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insurance-providers", response_model=InsuranceProviders)
async def get_insurance_providers():
    try:
        response = supabase.rpc("get_insurance_names").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search-dme", response_model=List[DMEProvider])
async def search_dme(request: SearchRequest):
    try:
        # Check if email exists
        email_response = (
            supabase.table(os.getenv("USER_EMAILS_TABLE"))
            .select("*")
            .eq("email", request.email)
            .execute()
        )
        # Only insert if email doesn't exist
        if not email_response.data:
            supabase.table(os.getenv("USER_EMAILS_TABLE")).insert(
                {"email": request.email}
            ).execute()
        # Query DME providers
        payload = {
            "_state": request.state.upper(),
            "_insurance": request.insurance_provider.title(),
        }
        response = supabase.rpc(os.getenv("SEARCH_PROVIDERS"), payload).execute()
        return response.data if response.data is not None else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_insurance_id(name: str) -> str:
    res = (
        supabase.table(os.getenv("INSURANCES_TABLE"))
        .select("id")
        .eq("name", name)
        .execute()
    )
    if res.data:
        return res.data[0]["id"]

    res = supabase.table(os.getenv("INSURANCES_TABLE")).insert({"name": name}).execute()
    return res.data[0]["id"]


@router.post("/upload_providers", response_model=Dict[str, str])
async def upload_providers(
    background_tasks: BackgroundTasks, file: UploadFile = File(...)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # Generate unique job ID
    job_id = str(uuid.uuid4())

    # Read file content
    content = await file.read()

    # Start background processing
    background_tasks.add_task(process_csv_async, job_id, content)

    # Initialize status
    processing_status[job_id] = {
        "status": "processing",
        "progress": 0,
        "total": 0,
        "companies_loaded": 0,
        "coverage_entries_loaded": 0,
        "message": "Starting CSV processing...",
    }

    return {"job_id": job_id, "message": "CSV processing started"}


@router.get("/upload_status/{job_id}")
async def get_upload_status(job_id: str):
    if job_id not in processing_status:
        raise HTTPException(status_code=404, detail="Job not found")
    return processing_status[job_id]


@router.patch("/provider/{provider_id}", response_model=Dict[str, str])
async def update_provider(provider_id: str, update_data: ProviderUpdate):
    """
    Update a provider's information.

    Args:
        provider_id: The ID of the provider to update
        update_data: The data to update for the provider

    Returns:
        A message indicating success
    """
    try:
        # Remove None values from the update data
        update_dict = update_data.model_dump(exclude_unset=True)

        if not update_dict:
            raise HTTPException(
                status_code=400, detail="No valid fields to update provided"
            )

        # Check if provider exists
        provider = (
            supabase.table(os.getenv("PROVIDERS_TABLE"))
            .select("id")
            .eq("id", provider_id)
            .execute()
        )

        if not provider.data:
            raise HTTPException(
                status_code=404, detail=f"Provider with ID {provider_id} not found"
            )

        # Update the provider
        result = (
            supabase.table(os.getenv("PROVIDERS_TABLE"))
            .update(update_dict)
            .eq("id", provider_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update provider")

        return {"message": f"Provider {provider_id} updated successfully"}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/providers/search", response_model=List[DMEProvider])
async def search_providers(
    q: str = Query(..., min_length=2, description="Search query")
):
    """
    Search for providers by name.

    Args:
        q: The search query string

    Returns:
        A list of providers matching the search query
    """
    try:
        if not q or len(q.strip()) < 2:
            raise HTTPException(
                status_code=400, detail="Search query must be at least 2 characters"
            )

        # Perform case-insensitive search using Supabase's ilike operator
        result = (
            supabase.table(os.getenv("PROVIDERS_TABLE"))
            .select("id, name, phone, email, dedicated_link")
            .ilike("name", f"%{q}%")
            .limit(10)
            .execute()
        )

        if not result.data:
            return []

        # Transform the data to match the DMEProvider structure
        providers = []
        for provider in result.data:
            providers.append(
                {
                    "id": provider["id"],
                    "dme_name": provider["name"],
                    "state": "",  # We won't show state in the search results
                    "insurance_providers": [],  # We won't show insurance providers in the search results
                    "phone": provider["phone"],
                    "email": provider["email"],
                    "dedicated_link": provider["dedicated_link"],
                    "resupply_available": False,  # Default value, not used in the UI
                    "accessories_available": False,  # Default value, not used in the UI
                    "lactation_services_available": False,  # Default value, not used in the UI
                }
            )

        return providers

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/provider/{provider_id}", response_model=Dict)
async def get_provider(provider_id: str):
    """
    Get a provider's details by ID.

    Args:
        provider_id: The ID of the provider to fetch

    Returns:
        The provider details
    """
    try:
        result = (
            supabase.table(os.getenv("PROVIDERS_TABLE"))
            .select("id, name, phone, email, dedicated_link")
            .eq("id", provider_id)
            .execute()
        )

        if not result.data:
            raise HTTPException(
                status_code=404, detail=f"Provider with ID {provider_id} not found"
            )

        return result.data[0]

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/provider/{provider_id}", response_model=Dict[str, str])
async def delete_provider(provider_id: str):
    """
    Delete a provider and all related data using the delete_provider_cascade RPC.

    Args:
        provider_id: The ID of the provider to delete

    Returns:
        A message indicating success
    """
    try:
        # Call the RPC to delete the provider and related data
        result = supabase.rpc(
            os.getenv("DELETE_PROVIDER_CASCADE"), {"p_provider_id": provider_id}
        ).execute()

        return {"message": f"Provider {provider_id} deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/user-emails")
async def export_user_emails():
    """
    Export all user emails as a CSV file.

    Returns:
        A streaming response containing the CSV file
    """
    try:
        # Fetch all user emails from Supabase
        response = supabase.table(os.getenv("USER_EMAILS_TABLE")).select("*").execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="No user emails found")

        # Convert to DataFrame
        df = pd.DataFrame(response.data)

        # Create CSV string
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)

        # Create streaming response
        response = StreamingResponse(
            io.BytesIO(csv_buffer.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=user_emails.csv"},
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to export user emails: {str(e)}"
        )


@router.post(
    "/provider/{provider_id}/upload-insurance-states",
    response_model=InsuranceStateUploadResponse,
)
async def upload_provider_insurance_states(
    provider_id: str, file: UploadFile = File(...)
):
    """
    Upload a CSV file with insurance-state mappings for a specific provider.

    CSV must have exactly 2 columns: "Insurances" and "States"
    States can be 2-letter codes or "ALL" for all states.

    Args:
        provider_id: The ID of the provider to add mappings for
        file: CSV file with Insurances and States columns

    Returns:
        Response with count of mappings added and any skipped rows
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(".csv"):
            raise HTTPException(status_code=400, detail="File must be a CSV")

        # Check if provider exists
        provider = (
            supabase.table(os.getenv("PROVIDERS_TABLE"))
            .select("id")
            .eq("id", provider_id)
            .execute()
        )

        if not provider.data:
            raise HTTPException(
                status_code=404, detail=f"Provider with ID {provider_id} not found"
            )

        # Read file content
        content = await file.read()

        # Process the CSV
        result = process_provider_insurance_states_csv(provider_id, content)

        return InsuranceStateUploadResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
