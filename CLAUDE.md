# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Annabella DME (Durable Medical Equipment) Search Tool - a full-stack web application that helps users find DME providers based on their state and insurance provider. The application features a Next.js frontend with TypeScript and TailwindCSS, and a FastAPI backend with Supabase as the database.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start development server on localhost:3000 (configured to bind to 0.0.0.0)
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linter

### Backend (FastAPI)
- `cd backend && uvicorn app.main:app --reload` - Start development server on localhost:8000
- `cd backend && pytest` - Run tests (configured in pytest.ini)
- `cd backend && python -m pytest tests/` - Run specific test directory

## Architecture

### Frontend Structure
- **Next.js App Router**: Uses the new app directory structure
- **Components**: `SearchForm.tsx` and `ResultsList.tsx` handle the main user interactions
- **Configuration**: Centralized config in `src/app/config.ts` with environment variable support
- **Styling**: TailwindCSS with custom fonts (Gibson and Meno Banner)
- **Types**: Shared TypeScript interfaces in `src/app/types/index.ts`

### Backend Structure
- **FastAPI Application**: Main app in `backend/app/main.py` with CORS and middleware configuration
- **API Routes**: All endpoints in `backend/app/api/routes.py` with `/api` prefix
- **Database Layer**: Supabase client configuration in `backend/app/core/supabase.py`
- **Data Processing**: CSV upload and processing logic in `backend/app/core/file_process.py`
- **Models**: Pydantic models in `backend/app/models/models.py`

### Key API Endpoints
- `GET /api/states` - Fetch available states
- `GET /api/insurance-providers` - Fetch insurance provider names
- `POST /api/search-dme` - Search DME providers by state and insurance
- `POST /api/upload_providers` - Upload provider data via CSV (background processing)
- `GET /api/upload_status/{job_id}` - Check CSV processing status
- `GET /api/providers/search` - Search providers by name
- `PATCH /api/provider/{provider_id}` - Update provider information
- `DELETE /api/provider/{provider_id}` - Delete provider (cascade)
- `GET /api/export/user-emails` - Export user emails as CSV

### Database Integration
- **Supabase**: PostgreSQL database with RPC functions
- **Key Tables**: `dme_providers`, `user_emails`, `states`, `insurance_providers`
- **RPC Functions**: `search_providers`, `get_insurance_names`, `delete_provider_cascade`
- **Environment Variables**: All database credentials and table names are environment-based

### Admin Features
- Admin panel at `/admin` with provider management
- Add provider functionality at `/admin/add-provider`
- Update provider functionality at `/admin/update-provider`
- CSV bulk upload with background processing and real-time status updates
- User email export functionality

## Environment Configuration

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL (defaults to http://localhost:8000)
- `NEXT_PUBLIC_APP_ENV` - Application environment
- `NEXT_PUBLIC_FEATURE_FLAG_BETA` - Beta feature flag
- `NEXT_PUBLIC_API_VERSION` - API version
- `NEXT_PUBLIC_CACHE_MAX_AGE` - Cache configuration
- `NEXT_PUBLIC_WORDPRESS_BASE_URL` - WordPress integration base URL (defaults to https://annabellastg.comitdevelopers.com)

### Backend Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase API key
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `APP_VERSION` - Application version
- Table name environment variables for all database tables

## Testing

Backend tests are configured with pytest and include:
- API endpoint testing
- Database model testing
- User email export functionality testing
- Mock Supabase client for testing

Test configuration is in `backend/pytest.ini` with verbose output and short tracebacks.

## Key Business Logic

1. **DME Provider Search**: Users select state and insurance provider, enter email, and get matched providers
2. **Email Collection**: User emails are stored for future communications (with terms acceptance)
3. **Provider Management**: Admin can add, update, search, and delete providers
4. **CSV Processing**: Background processing for bulk provider uploads with real-time status updates
5. **Data Export**: Admin can export collected user emails as CSV files

## Development Notes

- Frontend uses custom fonts loaded via `src/app/fonts.ts`
- Backend includes comprehensive error handling and HTTP exception management
- CSV processing uses pandas for data manipulation
- All API responses follow consistent JSON structure
- Database operations use Supabase RPC functions for complex queries
- CORS is configured to allow frontend-backend communication