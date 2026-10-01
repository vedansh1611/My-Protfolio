from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
import time
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactSubmission(BaseModel):
    name: str
    email: str
    project_type: str
    message: str
    website: str = ""

class ContactSubmissionResponse(ContactSubmission):
    id: str
    created_at: str

contact_attempts = {}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Ved portfolio API"}

@api_router.post("/contact", response_model=ContactSubmissionResponse)
async def create_contact_submission(input: ContactSubmission, request: Request):
    if input.website:
        raise HTTPException(status_code=400, detail="Spam check failed")
    client_ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    recent = [stamp for stamp in contact_attempts.get(client_ip, []) if now - stamp < 300]
    if len(recent) >= 3:
        raise HTTPException(status_code=429, detail="Please wait before sending another message")
    contact_attempts[client_ip] = [*recent, now]
    submission = ContactSubmissionResponse(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc).isoformat(),
        **input.model_dump(),
    )
    doc = submission.model_dump()
    await db.contact_submissions.insert_one(doc)
    return submission

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()