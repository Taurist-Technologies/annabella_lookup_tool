from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn
from app.api import routes


# Load environment variables
load_dotenv()

app = FastAPI(
    title="Annabella DME Search Tool API",
    description="API for searching Durable Medical Equipment providers",
    version=os.getenv("APP_VERSION"),
)

# Include the router with a prefix
app.include_router(routes.router, prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Annabella DME Search Tool API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
