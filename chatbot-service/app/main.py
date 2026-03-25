from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router
from app.routes.webhooks import router as webhooks_router

app = FastAPI(title="Healthcare Chatbot Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(webhooks_router, prefix="/webhooks", tags=["webhooks"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Chatbot Service is running"}
