import pandas as pd


def convert_bool(val: str) -> bool:
    """Convert string values to boolean."""
    return str(val).strip().lower() == "yes"


def process_dme_data(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Process the raw DataFrame into normalized DME company and coverage data."""
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
            "lactation_services_available": df["Location Services Available"].apply(
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
