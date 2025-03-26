import pytest
from datetime import datetime
from app.models.models import (
    DMEProvider,
    UserEmail,
    State,
    InsuranceProvider,
    SearchRequest,
    BulkDMERequest,
)


def test_dme_provider_model():
    dme_data = {
        "company_name": "Test DME Company",
        "state": "CA",
        "insurance_providers": ["Test Insurance"],
        "phone_number": "123-456-7890",
        "email": "test@example.com",
        "weblink": "https://test.com",
        "multiple_pump_models": True,
        "upgrade_pumps_available": True,
        "resupply_available": True,
        "accessories_available": True,
        "lactation_services_available": True,
    }
    dme = DMEProvider(**dme_data)
    assert dme.company_name == dme_data["company_name"]
    assert dme.state == dme_data["state"]
    assert dme.insurance_providers == dme_data["insurance_providers"]
    assert dme.phone_number == dme_data["phone_number"]
    assert dme.email == dme_data["email"]
    assert dme.weblink == dme_data["weblink"]
    assert dme.multiple_pump_models == dme_data["multiple_pump_models"]
    assert dme.upgrade_pumps_available == dme_data["upgrade_pumps_available"]
    assert dme.resupply_available == dme_data["resupply_available"]
    assert dme.accessories_available == dme_data["accessories_available"]
    assert dme.lactation_services_available == dme_data["lactation_services_available"]


def test_user_email_model():
    email_data = {"email": "test@example.com"}
    user_email = UserEmail(**email_data)
    assert user_email.email == email_data["email"]


def test_state_model():
    state_data = {"name": "California", "abbreviation": "CA"}
    state = State(**state_data)
    assert state.name == state_data["name"]
    assert state.abbreviation == state_data["abbreviation"]


def test_insurance_provider_model():
    insurance_data = {"name": "Test Insurance"}
    insurance = InsuranceProvider(**insurance_data)
    assert insurance.name == insurance_data["name"]


def test_search_request_model():
    search_data = {
        "state": "CA",
        "insurance_provider": "Test Insurance",
        "email": "test@example.com",
    }
    search = SearchRequest(**search_data)
    assert search.state == search_data["state"]
    assert search.insurance_provider == search_data["insurance_provider"]
    assert search.email == search_data["email"]


def test_bulk_dme_request_model():
    dme_data = {
        "company_name": "Test DME Company",
        "state": "CA",
        "insurance_providers": ["Test Insurance"],
        "phone_number": "123-456-7890",
        "email": "test@example.com",
        "weblink": "https://test.com",
        "multiple_pump_models": True,
        "upgrade_pumps_available": True,
        "resupply_available": True,
        "accessories_available": True,
        "lactation_services_available": True,
    }
    bulk_data = {"dmes": [dme_data, dme_data]}
    bulk = BulkDMERequest(**bulk_data)
    assert len(bulk.dmes) == 2
    assert all(isinstance(dme, DMEProvider) for dme in bulk.dmes)
