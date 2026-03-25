from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.orchestrator.router import route_request

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    patient_id: str

@router.post("/query")
async def chat_query(
    request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # Route the request through the orchestrator to decide which service to call
    response_data = await route_request(
        message=request.message,
        patient_id=request.patient_id,
        auth_header=authorization
    )

    return response_data

class PatientChatRequest(BaseModel):
    message: str

@router.post("/patient/query")
async def patient_query(
    request: PatientChatRequest,
    authorization: Optional[str] = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    from app.orchestrator.router import route_patient_medical_query
    response_data = await route_patient_medical_query(
        message=request.message,
        auth_header=authorization
    )

    return response_data
