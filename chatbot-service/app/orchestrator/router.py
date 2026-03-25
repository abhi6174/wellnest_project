from app.services.ehr_client import fetch_patient_records
from app.db.chromadb_client import ehr_collection
from app.services.llm_service import generate_chat_response

async def route_request(message: str, patient_id: str, auth_header: str):
    """
    Orchestrates the Chatbot Query:
    1. Validates authentication securely against Express
    2. Performs Semantic Vector Search in ChromaDB
    3. Synthesizes an answer using the LLM
    """
    
    # 1. SECURITY: Validate JWT/Access by performing a quick fetch to the Express backend.
    # If the user is unauthenticated or a doctor trying to access a patient unapproved, 
    # fetch_patient_records will throw an HTTP 401/403/404 exception automatically.
    await fetch_patient_records(patient_id, auth_header)
    
    # 2. SEMANTIC SEARCH: Query ChromaDB for relevant summaries
    # We fetch a large pool of records (e.g. 50 maximum)
    results = ehr_collection.query(
        query_texts=[message],
        n_results=50, 
        where={"patient_id": patient_id} # HARD SECURITY FILTER: Ensure no cross-patient leakage
    )
    
    # Parse retrieved documents
    retrieved_docs = results.get("documents", [[]])[0]
    retrieved_meta = results.get("metadatas", [[]])[0]
    retrieved_distances = results.get("distances", [[]])[0]
    
    # 3. DYNAMIC PRUNING: Filter by Semantic Distance
    # A smaller distance value means higher semantic similarity. 
    # Adjusted threshold to 1.0 to strictly filter out noisy records for specific queries.
    DISTANCE_THRESHOLD = 1.0
    
    context_list = []
    sources = []
    
    for i, text in enumerate(retrieved_docs):
        dist = retrieved_distances[i] if i < len(retrieved_distances) else 999
        
        # Only include records that are semantically relevant based on our threshold
        if dist <= DISTANCE_THRESHOLD:
            doc_meta = retrieved_meta[i] if i < len(retrieved_meta) else {}
            date_info = doc_meta.get("timestamp", "Unknown Date")
            diag_info = doc_meta.get("diagnosis", "Unknown Diagnosis")
            
            context_list.append(f"[Date: {date_info}] [Diagnosis: {diag_info}]\nSummary: {text}")
            sources.append(doc_meta)
            
    # 4. BROAD QUERY FALLBACK
    # If the user asks a very generic question (e.g. "give me my history summary"), 
    # the semantic distance to specific records will be weak and might fail the strict 1.0 threshold.
    # In this case, we fallback to just feeding the LLM the top 10 overall most relevant records.
    if len(context_list) == 0 and len(retrieved_docs) > 0:
        print(f"⚠️ Strict threshold yielded 0 results. Falling back to top 10 records for broad query.")
        for i, text in enumerate(retrieved_docs[:10]):
            doc_meta = retrieved_meta[i] if i < len(retrieved_meta) else {}
            date_info = doc_meta.get("timestamp", "Unknown Date")
            diag_info = doc_meta.get("diagnosis", "Unknown Diagnosis")
            context_list.append(f"[Date: {date_info}] [Diagnosis: {diag_info}]\nSummary: {text}")
            sources.append(doc_meta)

    # Safety cap: ensure we don't pass an absurd amount of text to the LLM
    if len(context_list) > 25:
        context_list = context_list[:25]
        sources = sources[:25]
    
    print(f"🔍 Evaluated {len(retrieved_docs)} records. Found {len(context_list)} highly relevant records (Distance < {DISTANCE_THRESHOLD}) for query: '{message}'")
    
    # 3. LLM SYNTHESIS: Generate contextual answer
    chat_response = await generate_chat_response(
        user_query=message,
        retrieved_context=context_list
    )
    
    # Append Record IDs deterministically
    if sources:
        record_ids = list(dict.fromkeys([s.get("record_id") for s in sources if s.get("record_id")]))
        if record_ids:
            chat_response += "\n\n**Sources Used (Record IDs):**\n"
            for rid in record_ids:
                chat_response += f"- `{rid}`\n"
    
    return {
        "text": chat_response.strip(),
        "sources_used": sources
    }

async def route_patient_medical_query(message: str, auth_header: str):
    """
    Orchestrates the Patient Chatbot Query for general medical questions.
    Queries the custom medical_docs collection using SentenceTransformers.
    """
    # 1. Validation (Currently just ensuring header exists)
    
    # 2. SEMANTIC SEARCH: Query the custom ChromaDB
    import chromadb
    from chromadb.config import Settings
    from sentence_transformers import SentenceTransformer
    import os
    from app.services.llm_service import generate_medical_query_response
    
    # Connect to the user's custom persist directory
    db_path = os.path.join(os.path.dirname(__file__), "../../chroma_db")
    client = chromadb.PersistentClient(path=db_path)
    medical_docs_collection = client.get_or_create_collection(name="medical_docs")
    
    # Generate query embedding using the same model as ingestion
    print("Generating query embedding using all-MiniLM-L6-v2...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    query_embedding = model.encode([message]).tolist()

    results = medical_docs_collection.query(
        query_embeddings=query_embedding,
        n_results=10
    )
    
    retrieved_docs = results.get("documents", [[]])[0]
    retrieved_distances = results.get("distances", [[]])[0]
    retrieved_metadatas = results.get("metadatas", [[]])[0]
    
    # Prune by distance if necessary (threshold 1.2 or similar based on SentenceTransformer L2 distance)
    # Note: all-MiniLM distances are often around 1.0 - 1.5 for semantic matches.
    DISTANCE_THRESHOLD = 1.3
    
    context_list = []
    sources = []
    
    for i, text in enumerate(retrieved_docs):
        dist = retrieved_distances[i] if i < len(retrieved_distances) else 999
        if dist <= DISTANCE_THRESHOLD:
            context_list.append(text)
            sources.append(retrieved_metadatas[i] if i < len(retrieved_metadatas) else {"source": "medical_book"})
            
    # Fallback to top 3 if strict filter yields nothing but we have docs
    if len(context_list) == 0 and len(retrieved_docs) > 0:
        context_list = retrieved_docs[:3]
        for i in range(min(3, len(retrieved_docs))):
             sources.append(retrieved_metadatas[i] if i < len(retrieved_metadatas) else {"source": "medical_book"})
        
    print(f"🔍 Evaluated {len(retrieved_docs)} medical book chunks from custom DB. Found {len(context_list)} relevant chunks.")
    
    # 3. LLM SYNTHESIS
    chat_response = await generate_medical_query_response(
        user_query=message,
        retrieved_context=context_list
    )
    
    # Deduplicate sources
    unique_sources = []
    seen = set()
    for s in sources:
        val = s.get("source", "Unknown")
        if val not in seen:
            seen.add(val)
            unique_sources.append(s)
            
    return {
        "text": chat_response.strip(),
        "sources_used": unique_sources
    }
