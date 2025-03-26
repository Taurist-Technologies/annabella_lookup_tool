import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add the mock_supabase to sys.modules before importing app
sys.path.insert(0, str(Path(__file__).parent))
import mock_supabase

sys.modules["app.core.supabase"] = mock_supabase

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_dme_provider():
    return {
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


@pytest.fixture
def test_search_request():
    return {
        "state": "CA",
        "insurance_provider": "Test Insurance",
        "email": "test@example.com",
    }
