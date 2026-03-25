import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.orchestrator.router import route_patient_medical_query

async def main():
    print("Testing Patient Chatbot RAG...")
    response = await route_patient_medical_query(
        message="What are the common symptoms of a migraine?",
        auth_header="mock_token"
    )
    print("Response Received:")
    print(response["text"])
    print("\nSources Used:")
    print(response["sources_used"])

if __name__ == "__main__":
    asyncio.run(main())
