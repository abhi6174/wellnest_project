from fastapi import APIRouter, HTTPException, Request
from app.services.llm_service import summarize_ehr_record
from app.db.chromadb_client import ehr_collection
import uuid

router = APIRouter()

@router.post("/ehr-record")
async def handle_new_ehr_record(request: Request):
    """
    Webhook endpoint hit by the Express backend whenever a new EHR record is created.
    """
    try:
        data = await request.json()
        
        patient_id = data.get("patient_id")
        record = data.get("record", {})
        
        if not patient_id or not record:
            raise HTTPException(status_code=400, detail="Missing patient_id or record data")

        record_id = record.get("recordId", str(uuid.uuid4()))
        timestamp = record.get("timestamp", "unknown")
        
        print(f"📥 Received webhook for new record: {record_id} (Patient: {patient_id})")

        # 1. Generate LLM Summary
        summary = await summarize_ehr_record(record)
        print(f"📝 Generated Summary for {record_id}: {summary}")

        # 2. Store in ChromaDB
        ehr_collection.add(
            documents=[summary],
            metadatas=[{
                "patient_id": patient_id,
                "record_id": record_id,
                "timestamp": timestamp,
                "diagnosis": record.get("diagnosis", "")
            }],
            ids=[record_id]
        )
        print(f"💾 Stored summary in ChromaDB for record {record_id}")

        return {"status": "success", "message": "Record summarized and stored in Vector DB"}

    except Exception as e:
        print(f"❌ Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
