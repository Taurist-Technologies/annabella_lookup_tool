from dotenv import load_dotenv
import os
import pandas as pd
import io
from app.core.file_process import process_dme_data

load_dotenv()

from fastapi import APIRouter, HTTPException, File, UploadFile
from ..models.models import (
    SearchRequest,
    DMEProvider,
    State,
    UserEmail,
    InsuranceProviders,
    DMECompany,
    DMECoverage,
    DMEUploadResponse,
)
from ..core.supabase import supabase
from typing import List

router = APIRouter()


@router.get("/states", response_model=List[State])
async def get_states():
    try:
        response = supabase.table(os.getenv("STATES_TABLE")).select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str("Nah Son.."))


@router.get("/insurance-providers", response_model=InsuranceProviders)
async def get_insurance_providers():
    try:
        response = supabase.rpc("get_unique_insurances").execute()
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
        # print(email_response.data)
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
        response = supabase.rpc("search_dmes_2", payload).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-dme", response_model=DMEUploadResponse)
async def upload_dme(file: UploadFile = File(...)):
    """
    Upload and process a DME CSV file.

    The CSV should contain the following columns:
    - DME Name
    - Phone Number
    - Email
    - Insurance
    - State
    - Medicaid
    - Resupply Available
    - Accessories Available
    - Location Services Available
    - Dedicated Link
    """
    try:
        # Read the uploaded file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        df.fillna(method="ffill", inplace=True)

        # Process the data
        dmes_df, coverage_df = process_dme_data(df)

        # Insert DME companies
        dmes_inserted = (
            supabase.table("dme_companies")
            .insert(
                dmes_df.rename(columns={"dme_name": "name"}).to_dict(orient="records")
            )
            .execute()
        )

        # Create a mapping of DME names to their IDs
        dme_id_mapping = {record["name"]: record["id"] for record in dmes_inserted.data}

        # Add DME IDs to coverage data using the mapping
        coverage_records = []
        for _, row in coverage_df.iterrows():
            coverage_record = row.to_dict()
            dme_name = coverage_record.pop(
                "dme_name"
            )  # Remove dme_name and replace with dme_id
            coverage_record["dme_id"] = dme_id_mapping[dme_name]
            coverage_records.append(coverage_record)

        # Insert coverage data
        coverage_result = (
            supabase.table("dme_coverage").insert(coverage_records).execute()
        )

        return DMEUploadResponse(
            companies_loaded=len(dmes_inserted.data),
            coverage_entries_loaded=len(coverage_result.data),
            message="DME data uploaded successfully",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing DME data: {str(e)}"
        )
