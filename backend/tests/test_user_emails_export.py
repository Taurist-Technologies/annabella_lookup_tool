import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pandas as pd
import io
from app.main import app

client = TestClient(app)


class TestUserEmailsExport:

    @patch("app.api.routes.supabase")
    def test_export_user_emails_success(self, mock_supabase):
        """Test successful export of user emails"""
        # Mock Supabase response
        mock_response = MagicMock()
        mock_response.data = [
            {
                "id": 1,
                "email": "user1@example.com",
                "created_at": "2024-01-01T00:00:00",
            },
            {
                "id": 2,
                "email": "user2@example.com",
                "created_at": "2024-01-02T00:00:00",
            },
            {
                "id": 3,
                "email": "user3@example.com",
                "created_at": "2024-01-03T00:00:00",
            },
        ]
        mock_supabase.table.return_value.select.return_value.execute.return_value = (
            mock_response
        )

        # Make request
        response = client.get("/api/export/user-emails")

        # Assertions
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert (
            "attachment; filename=user_emails.csv"
            in response.headers["content-disposition"]
        )

        # Check CSV content
        csv_content = response.content.decode("utf-8")
        assert "user1@example.com" in csv_content
        assert "user2@example.com" in csv_content
        assert "user3@example.com" in csv_content
        assert "id,email,created_at" in csv_content

    @patch("app.api.routes.supabase")
    def test_export_user_emails_no_data(self, mock_supabase):
        """Test export when no user emails exist"""
        # Mock empty Supabase response
        mock_response = MagicMock()
        mock_response.data = []
        mock_supabase.table.return_value.select.return_value.execute.return_value = (
            mock_response
        )

        # Make request
        response = client.get("/api/export/user-emails")

        # Assertions
        assert response.status_code == 404
        assert "No user emails found" in response.json()["detail"]

    @patch("app.api.routes.supabase")
    def test_export_user_emails_database_error(self, mock_supabase):
        """Test export when database error occurs"""
        # Mock Supabase to raise an exception
        mock_supabase.table.return_value.select.return_value.execute.side_effect = (
            Exception("Database connection error")
        )

        # Make request
        response = client.get("/api/export/user-emails")

        # Assertions
        assert response.status_code == 500
        assert "Failed to export user emails" in response.json()["detail"]
        assert "Database connection error" in response.json()["detail"]
