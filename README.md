# DME Search Tool

A web application that helps users find Durable Medical Equipment (DME) providers based on their state of residency and insurance provider.

## Features

- Search for DME providers by state and insurance provider
- Email collection for future communications
- Modern, responsive UI built with Next.js and Tailwind CSS
- Fast, scalable backend with FastAPI and Supabase

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- Database: Supabase (PostgreSQL)

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account and project

## Setup

### Backend Setup

1. Create and activate a Python virtual environment:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy the environment file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a new Supabase project
2. Create the following tables in your Supabase database:

   - `dme_providers`
   - `user_emails`
   - `states`
   - `insurance_providers`

3. Set up the appropriate permissions in Supabase

## Development

- Backend API documentation: http://localhost:8000/docs
- Frontend development server: http://localhost:3000

## License

MIT
