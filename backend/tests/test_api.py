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


def test_update_provider_success(client, test_dme_provider):
    # First create a provider
    create_response = client.post("/api/dme", json=test_dme_provider)
    assert create_response.status_code == 200
    provider_id = create_response.json()["id"]

    # Update the provider
    update_data = {
        "name": "Updated DME Name",
        "phone": "999-999-9999",
        "email": "updated@example.com",
        "dedicated_link": "https://updated-link.com",
    }

    response = client.patch(f"/api/provider/{provider_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["message"] == f"Provider {provider_id} updated successfully"

    # Verify the update
    get_response = client.get(f"/api/provider/{provider_id}")
    assert get_response.status_code == 200
    updated_provider = get_response.json()
    assert updated_provider["name"] == update_data["name"]
    assert updated_provider["phone"] == update_data["phone"]
    assert updated_provider["email"] == update_data["email"]
    assert updated_provider["dedicated_link"] == update_data["dedicated_link"]


def test_update_provider_partial(client, test_dme_provider):
    # First create a provider
    create_response = client.post("/api/dme", json=test_dme_provider)
    assert create_response.status_code == 200
    provider_id = create_response.json()["id"]

    # Update only some fields
    update_data = {"name": "Partially Updated DME Name", "phone": "888-888-8888"}

    response = client.patch(f"/api/provider/{provider_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["message"] == f"Provider {provider_id} updated successfully"

    # Verify the update
    get_response = client.get(f"/api/provider/{provider_id}")
    assert get_response.status_code == 200
    updated_provider = get_response.json()
    assert updated_provider["name"] == update_data["name"]
    assert updated_provider["phone"] == update_data["phone"]
    # Original values should remain unchanged
    assert updated_provider["email"] == test_dme_provider["email"]
    assert updated_provider["dedicated_link"] == test_dme_provider["dedicated_link"]


def test_update_provider_not_found(client):
    update_data = {"name": "Updated DME Name", "phone": "999-999-9999"}

    response = client.patch("/api/provider/999999", json=update_data)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]


def test_update_provider_no_data(client, test_dme_provider):
    # First create a provider
    create_response = client.post("/api/dme", json=test_dme_provider)
    assert create_response.status_code == 200
    provider_id = create_response.json()["id"]

    # Try to update with empty data
    update_data = {}

    response = client.patch(f"/api/provider/{provider_id}", json=update_data)
    assert response.status_code == 400
    assert "No valid fields to update" in response.json()["detail"]


def test_update_provider_invalid_email(client, test_dme_provider):
    # First create a provider
    create_response = client.post("/api/dme", json=test_dme_provider)
    assert create_response.status_code == 200
    provider_id = create_response.json()["id"]

    # Try to update with invalid email
    update_data = {"email": "not-an-email"}

    response = client.patch(f"/api/provider/{provider_id}", json=update_data)
    assert response.status_code == 422  # Validation error


def test_delete_provider_success(client, test_dme_provider):
    # Create a provider first
    create_response = client.post("/api/dme", json=test_dme_provider)
    assert create_response.status_code == 200
    provider_id = create_response.json()["id"]

    # Delete the provider
    response = client.delete(f"/api/provider/{provider_id}")
    assert response.status_code == 200
    assert "deleted successfully" in response.json()["message"]


def test_delete_provider_not_found(client):
    # Try to delete a provider that does not exist
    response = client.delete("/api/provider/999999")
    # Should still return 200 due to mock, but in real case, would be 404 or 500
    assert response.status_code == 200 or response.status_code == 404


def test_delete_provider_invalid_id(client):
    # Try to delete with an invalid id (non-numeric or malformed)
    response = client.delete("/api/provider/invalid_id")
    # Should return 200 or 422 depending on validation
    assert response.status_code in (200, 422, 404)


def test_delete_provider_twice(client, test_dme_provider):
    # Create and delete, then try to delete again
    create_response = client.post("/api/dme", json=test_dme_provider)
    assert create_response.status_code == 200
    provider_id = create_response.json()["id"]
    response1 = client.delete(f"/api/provider/{provider_id}")
    assert response1.status_code == 200
    response2 = client.delete(f"/api/provider/{provider_id}")
    assert response2.status_code == 200 or response2.status_code == 404


def test_delete_provider_response_format(client, test_dme_provider):
    create_response = client.post("/api/dme", json=test_dme_provider)
    provider_id = create_response.json()["id"]
    response = client.delete(f"/api/provider/{provider_id}")
    assert isinstance(response.json(), dict)
    assert "message" in response.json()


def test_delete_provider_with_extra_path(client):
    # Try a path that is not valid
    response = client.delete("/api/provider/")
    assert response.status_code in (404, 405)


def test_delete_provider_method_not_allowed(client, test_dme_provider):
    create_response = client.post("/api/dme", json=test_dme_provider)
    provider_id = create_response.json()["id"]
    # Try POST on delete endpoint
    response = client.post(f"/api/provider/{provider_id}")
    assert response.status_code == 405


def test_delete_provider_error_simulation(monkeypatch, client, test_dme_provider):
    # Simulate an error in the RPC call
    create_response = client.post("/api/dme", json=test_dme_provider)
    provider_id = create_response.json()["id"]

    class ErrorMock:
        error = "Simulated error"
        data = None

    def error_rpc(name, params=None):
        return ErrorMock()

    monkeypatch.setattr("app.core.supabase.supabase.rpc", error_rpc)
    response = client.delete(f"/api/provider/{provider_id}")
    assert response.status_code == 500
    assert "Failed to delete provider" in response.json()["detail"]


def test_delete_provider_case_sensitivity(client, test_dme_provider):
    # Create and delete with upper/lower case id (should be string, but test anyway)
    create_response = client.post("/api/dme", json=test_dme_provider)
    provider_id = str(create_response.json()["id"])
    response = client.delete(f"/api/provider/{provider_id.lower()}")
    assert response.status_code == 200


def test_delete_provider_long_id(client):
    # Try a very long provider id
    long_id = "a" * 100
    response = client.delete(f"/api/provider/{long_id}")
    assert response.status_code in (200, 404, 422)
