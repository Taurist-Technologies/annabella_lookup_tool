import pandas as pd
from typing import Dict, List
import os
import io
from app.core.supabase import supabase as sb


def convert_bool(val: str) -> bool:
    """Convert string values to boolean.
    Returns True only if value is explicitly 'yes', False for empty fields, 'no', or any other value.
    """
    if str(val).strip().lower() == "yes":
        return True
    return False


def cleanup_headers(df: pd.DataFrame) -> pd.DataFrame:
    """Clean up DataFrame headers by removing extra whitespace and ensuring consistency."""
    # Create a mapping of possible header variations to standard headers
    header_mapping = {
        "dme name": "DME Name",
        "phone number": "Phone Number",
        "email": "Email",
        "insurance": "Insurance",
        "state": "State",
        "medicaid": "Medicaid",
        "resupply available": "Resupply Available",
        "accessories available": "Accessories Available",
        "lactation services available": "Lactation Services Available",
        "dedicated link": "Dedicated Link",
    }

    # Clean up headers: remove extra whitespace and convert to lowercase
    df.columns = df.columns.str.strip().str.lower()

    # Rename columns using the mapping
    df = df.rename(columns=header_mapping)

    return df


def process_dme_data(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Process the raw DataFrame into normalized DME company and coverage data."""
    # Clean up headers first
    df = cleanup_headers(df)

    # Convert boolean columns
    df["Dedicated Link"] = df["Dedicated Link"].astype(str)

    # Create normalized DataFrame
    df_normalized = pd.DataFrame(
        {
            "dme_name": df["DME Name"].str.strip(),
            "phone": df["Phone Number"].str.strip(),
            "email": df["Email"].str.strip(),
            "insurance": df["Insurance"].str.strip(),
            "state": df["State"].str.strip(),
            "medicaid": df["Medicaid"].apply(convert_bool),
            "resupply_available": df["Resupply Available"].apply(convert_bool),
            "accessories_available": df["Accessories Available"].apply(convert_bool),
            "lactation_services_available": df["Lactation Services Available"].apply(
                convert_bool
            ),
            "dedicated_link": df["Dedicated Link"].str.strip(),
        }
    )

    # Deduplicate DMEs
    dmes_df = (
        df_normalized[["dme_name", "phone", "email", "dedicated_link"]]
        .drop_duplicates()
        .reset_index(drop=True)
    )

    # Prepare coverage data without relying on id
    coverage_df = df_normalized[
        [
            "dme_name",  # Keep dme_name for later mapping
            "insurance",
            "state",
            "medicaid",
            "resupply_available",
            "accessories_available",
            "lactation_services_available",
        ]
    ].drop_duplicates()

    return dmes_df, coverage_df


# V4 Functions
def normalize_frame(raw: pd.DataFrame) -> pd.DataFrame:
    # Strip weird chars, lower-case headers
    raw.columns = (
        raw.columns.str.replace(r"\xa0", " ", regex=True)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    # Forward-fill provider-level fields down the block
    raw[["dme_name", "phone_number", "email"]] = raw[
        ["dme_name", "phone_number", "email"]
    ].ffill()

    # Clean booleans
    for col in [
        "resupply_available",
        "accessories_available",
        "lactation_services_available",
        "medicaid",
    ]:
        if col in raw:
            raw[col] = raw[col].astype(str).str.strip().str.lower().eq("yes")

    # Trim whitespace in text cols
    raw["state"] = raw["state"].str.strip()
    raw["insurance"] = raw["insurance"].str.strip()

    return raw


# --- 🟢 1. provider fields: booleans removed
def batch_upsert_providers(
    df: pd.DataFrame, sb, batch_size: int = 100
) -> Dict[str, str]:
    """Batch upsert providers to minimize database calls."""
    unique_providers = df[
        ["dme_name", "phone_number", "email", "dedicated_link"]
    ].drop_duplicates()

    provider_name_to_id = {}

    for i in range(0, len(unique_providers), batch_size):
        batch = unique_providers.iloc[i : i + batch_size]

        # Check existing providers in batch
        names = batch["dme_name"].tolist()
        existing = sb.table("providers").select("id, name").in_("name", names).execute()

        for provider in existing.data:
            provider_name_to_id[provider["name"]] = provider["id"]

        # Prepare new providers for insertion
        new_providers = []
        for _, row in batch.iterrows():
            if row["dme_name"] not in provider_name_to_id:
                new_providers.append(
                    {
                        "name": str(row["dme_name"]),
                        "phone": str(row["phone_number"]),
                        "email": str(row["email"]),
                        "dedicated_link": str(row.get("dedicated_link", "")),
                    }
                )

        # Batch insert new providers
        if new_providers:
            result = sb.table("providers").insert(new_providers).execute()
            for provider in result.data:
                provider_name_to_id[provider["name"]] = provider["id"]

    return provider_name_to_id


def batch_get_insurance_ids(insurance_names: List[str], sb) -> Dict[str, str]:
    """Batch process insurance IDs to minimize database calls."""
    unique_names = list(set(insurance_names))

    # Get existing insurance IDs
    existing = (
        sb.table(os.getenv("INSURANCES_TABLE"))
        .select("id, name")
        .in_("name", unique_names)
        .execute()
    )
    name_to_id = {ins["name"]: ins["id"] for ins in existing.data}

    # Create missing insurance entries
    missing_names = [name for name in unique_names if name not in name_to_id]
    if missing_names:
        new_insurances = [{"name": name} for name in missing_names]
        result = (
            sb.table(os.getenv("INSURANCES_TABLE")).insert(new_insurances).execute()
        )
        for ins in result.data:
            name_to_id[ins["name"]] = ins["id"]

    return name_to_id


async def process_csv_async(job_id: str, file_content: bytes):
    """Async CSV processing with progress tracking."""
    try:
        from app.api.routes import processing_status

        # Parse CSV
        df = pd.read_csv(io.StringIO(file_content.decode()))
        df = normalize_frame(df)

        total_rows = len(df)
        processing_status[job_id]["total"] = total_rows
        processing_status[job_id]["message"] = f"Processing {total_rows} rows..."

        # Batch process providers
        provider_name_to_id = batch_upsert_providers(df, sb)
        processing_status[job_id]["progress"] = total_rows * 0.6
        processing_status[job_id]["companies_loaded"] = len(provider_name_to_id)

        # Batch process insurance IDs
        insurance_names = df["insurance"].unique().tolist()
        insurance_name_to_id = batch_get_insurance_ids(insurance_names, sb)
        processing_status[job_id]["progress"] = total_rows * 0.8

        # Prepare coverage records with vectorized operations
        df["provider_id"] = df["dme_name"].map(provider_name_to_id)
        df["insurance_id"] = df["insurance"].map(insurance_name_to_id)

        coverage_records = (
            df[
                [
                    "provider_id",
                    "insurance_id",
                    "state",
                    "resupply_available",
                    "accessories_available",
                    "lactation_services_available",
                    "medicaid",
                ]
            ]
            .rename(columns={"state": "state_code"})
            .to_dict("records")
        )

        # Batch upsert coverage records
        batch_size = 500
        for i in range(0, len(coverage_records), batch_size):
            batch = coverage_records[i : i + batch_size]
            sb.table(os.getenv("PROVIDER_COVERAGE_TABLE")).upsert(
                batch, on_conflict="provider_id,insurance_id,state_code"
            ).execute()

            # Update progress
            progress = min(
                total_rows, (i + batch_size) / len(coverage_records) * total_rows
            )
            processing_status[job_id]["progress"] = progress

        # Final status
        processing_status[job_id].update(
            {
                "status": "completed",
                "progress": total_rows,
                "coverage_entries_loaded": len(coverage_records),
                "message": "CSV processing completed successfully!",
            }
        )

    except Exception as e:
        processing_status[job_id].update(
            {"status": "error", "message": f"Error processing CSV: {str(e)}"}
        )


def process_provider_insurance_states_csv(
    provider_id: str, file_content: bytes
) -> dict:
    """Process CSV with Insurances and States columns for a specific provider."""
    try:
        # Parse CSV
        df = pd.read_csv(io.StringIO(file_content.decode()))

        # Clean headers
        df.columns = df.columns.str.strip().str.lower()

        # Validate required columns
        required_columns = ["insurance", "state"]
        if not all(col in df.columns for col in required_columns):
            raise ValueError(
                f"CSV must contain exactly these columns: {required_columns}"
            )

        # Get valid state codes from database
        states_response = (
            sb.table(os.getenv("STATES_TABLE")).select("abbreviation").execute()
        )
        valid_states = set([state["abbreviation"] for state in states_response.data])
        valid_states.add("ALL")  # Add ALL as valid state

        mappings_added = 0
        skipped_rows = []

        # Process each row
        for index, row in df.iterrows():
            insurance_name = str(row["insurance"]).strip().title()
            state_code = str(row["state"]).strip().upper()

            # Validate state code
            if state_code not in valid_states:
                skipped_rows.append(
                    f"Row {index + 1}: Invalid state code '{state_code}'"
                )
                print("skipped row", skipped_rows)

                continue

            try:
                # Get or create insurance ID
                insurance_id = get_insurance_id(insurance_name)

                # Prepare coverage record
                coverage_record = {
                    "provider_id": provider_id,
                    "insurance_id": insurance_id,
                    "state_code": state_code,
                    "resupply_available": False,
                    "accessories_available": False,
                    "lactation_services_available": False,
                    "medicaid": False,
                }

                # Upsert to provider_coverage table
                sb.table(os.getenv("PROVIDER_COVERAGE_TABLE")).upsert(
                    coverage_record, on_conflict="provider_id,insurance_id,state_code"
                ).execute()

                mappings_added += 1
                print("mappings_added", mappings_added)

            except Exception as e:
                skipped_rows.append(f"Row {index + 1}: Database error - {str(e)}")
                print("skipped row", skipped_rows)
                return

        return {
            "mappings_added": mappings_added,
            "skipped_rows": skipped_rows,
            "message": f"Successfully added {mappings_added} insurance-state mappings",
        }

    except Exception as e:
        raise ValueError(f"Error processing CSV: {str(e)}")


def get_insurance_id(name: str) -> str:
    """Get or create insurance ID by name."""
    res = (
        sb.table(os.getenv("INSURANCES_TABLE")).select("id").eq("name", name).execute()
    )
    if res.data:
        return res.data[0]["id"]

    res = sb.table(os.getenv("INSURANCES_TABLE")).insert({"name": name}).execute()
    return res.data[0]["id"]
