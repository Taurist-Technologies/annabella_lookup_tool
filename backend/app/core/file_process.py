import pandas as pd
from supabase import Client


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
def upsert_provider(row, sb: Client) -> str:

    provider_data = {
        "name": str(row["dme_name"]) if pd.notna(row["dme_name"]) else "",
        "phone": str(row["phone_number"]) if pd.notna(row["phone_number"]) else "",
        "email": str(row["email"]) if pd.notna(row["email"]) else "",
        "dedicated_link": (
            str(row["dedicated_link"]) if pd.notna(row.get("dedicated_link")) else ""
        ),
    }

    # Remove None values from the dictionary
    provider_data = {k: v for k, v in provider_data.items() if v is not None}

    # First check if the provider exists
    existing = (
        sb.table("providers").select("id").eq("name", provider_data["name"]).execute()
    )

    if existing.data:
        # Provider exists, update it
        res = (
            sb.table("providers")
            .update(provider_data)
            .eq("name", provider_data["name"])
            .execute()
        )
        return res.data[0]["id"]
    else:
        # Provider doesn't exist, insert it
        res = sb.table("providers").insert(provider_data).execute()
        return res.data[0]["id"]
