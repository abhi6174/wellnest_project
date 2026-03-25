import os
import gc
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

# -------- CONFIG (tune if needed) --------
PDF_PATH = "data/medical_book.pdf"
CHUNK_SIZE = 500
BATCH_SIZE = 16        # safe for 16GB RAM
MAX_PAGES = None      # process the full PDF
PERSIST_DIR = "chroma_db"

# -------- INIT --------
model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path=PERSIST_DIR)

collection = client.get_or_create_collection(name="medical_docs")


# -------- HELPERS --------
def chunk_text(text, chunk_size):
    for i in range(0, len(text), chunk_size):
        yield text[i:i + chunk_size]


# -------- MAIN INGEST --------
def ingest():
    print(f"📄 Loading PDF: {PDF_PATH}")

    reader = PdfReader(PDF_PATH)
    total_pages = len(reader.pages)

    if MAX_PAGES:
        total_pages = min(total_pages, MAX_PAGES)

    print(f"Total pages to process: {total_pages}")

    batch_chunks = []
    chunk_id = 0

    for page_num in range(total_pages):

        if (page_num + 1) % 5 == 0:
            print(f"Processing page {page_num + 1}/{total_pages}")

        page = reader.pages[page_num]
        text = page.extract_text()

        if not text:
            continue

        # --- chunk per page ---
        for chunk in chunk_text(text, CHUNK_SIZE):
            chunk = chunk.strip()
            if not chunk:
                continue

            batch_chunks.append(chunk)

            # --- when batch full → embed + store ---
            if len(batch_chunks) >= BATCH_SIZE:

                embeddings = model.encode(batch_chunks)

                ids = [f"doc_{chunk_id + i}" for i in range(len(batch_chunks))]
                metadatas = [{"source": "medical_book"} for _ in batch_chunks]

                collection.add(
                    documents=batch_chunks,
                    embeddings=embeddings.tolist(),
                    metadatas=metadatas,
                    ids=ids
                )

                print(f"✅ Stored {len(batch_chunks)} chunks")

                chunk_id += len(batch_chunks)
                batch_chunks = []

                gc.collect()  # free memory

    # -------- FINAL FLUSH --------
    if batch_chunks:
        embeddings = model.encode(batch_chunks)

        ids = [f"doc_{chunk_id + i}" for i in range(len(batch_chunks))]
        metadatas = [{"source": "medical_book"} for _ in batch_chunks]

        collection.add(
            documents=batch_chunks,
            embeddings=embeddings.tolist(),
            metadatas=metadatas,
            ids=ids
        )

        print(f"✅ Final stored {len(batch_chunks)} chunks")

    print("\n🎯 Ingestion completed safely.")


# -------- SEARCH --------
def search(query, k=3):
    query_embedding = model.encode([query]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=k
    )

    return results["documents"][0]


# -------- RUN --------
if __name__ == "__main__":
    ingest()