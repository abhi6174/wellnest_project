import httpx
from fastapi import HTTPException

# Base URL for the Express EHR Backend
EXPRESS_BACKEND_URL = "http://localhost:8080"

async def fetch_patient_records(patient_id: str, auth_header: str):
    """
    Fetches patient records from the Express EHR backend.
    Simply forwards the JWT Authorization header.
    """
    
    # We use the endpoint we created earlier for AI Integration:
    url = f"{EXPRESS_BACKEND_URL}/ai/export/{patient_id}"
    
    headers = {
        "Authorization": auth_header
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            
            # If the Express backend rejected the token or access, propagate the error
            if response.status_code != 200:
                error_detail = "EHR Backend Error"
                try:
                    error_detail = response.json().get("message", error_detail)
                except ValueError:
                    pass
                raise HTTPException(status_code=response.status_code, detail=error_detail)
                
            return response.json()
            
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Failed to connect to EHR backend: {str(exc)}")
