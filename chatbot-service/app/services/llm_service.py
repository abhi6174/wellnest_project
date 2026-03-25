import os
from openai import AsyncOpenAI
from fastapi import HTTPException
from dotenv import load_dotenv
import json
load_dotenv()

# Ensure GROQ_API_KEY is set in environment, or handle gracefully
api_key = os.environ.get("GROQ_API_KEY")
client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1") if api_key else None

async def summarize_ehr_record(record_data: dict) -> str:
    """
    Uses an LLM to generate a concise clinical summary of an EHR record.
    """
    if not client:
        # Fallback if no API key is set for local testing
        print("⚠️ GROQ_API_KEY not set. Using dummy summarization.")
        diagnosis = record_data.get('diagnosis', 'Unknown')
        treatment = record_data.get('treatment', 'Unknown')
        return f"Clinical Summary: Patient presented with {diagnosis}. Treatment plan: {treatment}."
    if not record_data:
        raise HTTPException(status_code=400, detail="Empty EHR record")
    prompt = f"""
    You are an expert clinical summarizer. Summarize the following Electronic Health Record.

    Include:
    - Diagnosis
    - Key symptoms
    - Treatments or medications
    - Important alerts (allergies, chronic conditions)

    CRITICAL RULES:
    1. DO NOT include any patient names, IDs, hashes, or identifiers.
    2. DO NOT hallucinate. Do not invent demographics (age, gender), dates, or clinical facts.
    3. Correctly distinguish between medical symptoms and lifestyle factors/triggers.
    4. Write unambiguously. Use separate, short sentences for distinct medical facts (e.g., separate allergies from family history).
    5. Write one concise paragraph optimized for semantic search retrieval.

    raw record : {json.dumps(record_data, indent=2)}
    
    Provide ONLY the summary paragraph.
    """

    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful medical AI assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"LLM Summarization failed: {e}")
        # Return a basic fallback string so the pipeline doesn't break entirely
        return f"Summary unavailable due to LLM error. Raw Diagnosis: {record_data.get('diagnosis', 'N/A')}"

async def generate_chat_response(user_query: str, retrieved_context: list[str]) -> str:
    """
    RAG generation: Uses retrieved ChromaDB records to answer a user's question.
    """
    if not client:
        return "⚠️ GROQ_API_KEY not set. Cannot generate chat response."
    
    if not retrieved_context:
        return "I don't have enough medical records on file to answer that question."

    context_str = "\n\n".join([f"Record Entry:\n{text}" for text in retrieved_context])
    
    prompt = f"""
    You are an expert AI clinical assistant for the Wellnest healthcare platform.
    Answer the user's medical query using ONLY the following retrieved medical records.
    
    CRITICAL RULES:
    1. If the answer is not contained in the context, explicitly say "I don't have enough information in your medical records to answer that."
    2. STRICT ANTI-HALLUCINATION: DO NOT invent, assume, or hallucinate any medical facts, dates, diagnoses, or demographics (such as age or gender) that are not explicitly written in the Retrieved Context.
    3. If the context does not state the patient's age or gender, refer to them neutrally as "the patient".
    4. Keep your response conversational, empathetic, and easy to understand.
    5. When summarizing history, organize it coherently by Date or Diagnosis.
    
    Retrieved Context:
    {context_str}
    
    User Query: {user_query}
    """

    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful, accurate medical AI assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Chat generation failed: {e}")
        return "I'm sorry, I encountered an error while formulating your response."

async def generate_medical_query_response(user_query: str, retrieved_context: list[str]) -> str:
    """
    RAG generation: Uses retrieved ChromaDB medical book context to answer a general medical question.
    """
    if not client:
        return "⚠️ GROQ_API_KEY not set. Cannot generate chat response."
    
    if not retrieved_context:
        return "I'm sorry, I couldn't find relevant information in the medical literature to answer your question."

    context_str = "\n\n".join([f"Medical Text Excerpt:\n{text}" for text in retrieved_context])
    
    prompt = f"""
    You are an expert AI clinical assistant for the Wellnest healthcare platform.
    Answer the user's general medical query clearly using ONLY the following retrieved medical textbook excerpts.
    
    CRITICAL RULES:
    1. If the answer is not contained in the excerpts, explicitly say "I don't have enough information in the medical literature provided to answer that."
    2. STRICT ANTI-HALLUCINATION: DO NOT invent medical facts, statistics, or treatments outside of the provided text.
    3. Keep your response conversational, empathetic, and exceptionally easy to understand for a patient without medical training.
    4. Provide clear disclaimers that this is general information and not a substitute for professional medical advice.
    5. Organize the information coherently, use bullet points if it helps readability.
    
    Retrieved Context:
    {context_str}
    
    User Query: {user_query}
    """

    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an empathetic, accurate patient-facing AI medical assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400,
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Medical query generation failed: {e}")
        return "I'm sorry, I encountered an error while formulating your response."
