import chromadb
from chromadb.config import Settings
import os

# Initialize local ChromaDB persistent client
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "../../chroma_data")
client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

# Get or create the collection for EHR summaries
ehr_collection = client.get_or_create_collection(
    name="ehr_summaries",
    metadata={"description": "Summaries of patient EHR records"}
)

# Get or create the collection for Medical Book retrieval (General RAG)
medical_book_collection = client.get_or_create_collection(
    name="medical_book",
    metadata={"description": "Chunks from the general medical book for patient queries"}
)
