import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_get_states(client):
    response = client.get("/api/states")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_insurance_providers(client):
    response = client.get("/api/insurance-providers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_search_dme(client, test_search_request):
    response = client.post("/api/search-dme", json=test_search_request)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_dme(client, test_dme_provider):
    response = client.post("/api/dme", json=test_dme_provider)
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == test_dme_provider["company_name"]
    assert data["state"] == test_dme_provider["state"]


def test_create_bulk_dme(client, test_dme_provider):
    bulk_request = {"dmes": [test_dme_provider, test_dme_provider]}
    response = client.post("/api/dme/bulk", json=bulk_request)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 2


def test_create_dme_invalid_state(client):
    invalid_dme = {
        "company_name": "Test DME Company",
        "state": "XX",  # Invalid state
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
    response = client.post("/api/dme", json=invalid_dme)
    assert response.status_code == 400
    assert "Invalid state abbreviation" in response.json()["detail"]
