from app.db.chromadb_client import ehr_collection

def test_chroma():
    results = ehr_collection.get()
    
    print(f"Total documents in ChromaDB: {len(results['ids'])}")
    
    if len(results['ids']) > 0:
        print("\n=== Sample Document ===")
        print(f"ID: {results['ids'][0]}")
        print(f"Metadata: {results['metadatas'][0]}")
        print(f"Summary Text: {results['documents'][0]}")
        print("=======================\n")
    else:
        print("No documents found in ChromaDB yet.")

if __name__ == "__main__":
    test_chroma()
