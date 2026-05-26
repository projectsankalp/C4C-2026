import os
from dotenv import load_dotenv
from pinecone import Pinecone
from embed import get_embedding
from groq import Groq

# Environment Initialization
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("rag-index")

# Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def retrieve_chunks(query, namespace, top_k=5):
    embedding = get_embedding(query)
    results = index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True,
        namespace=namespace
    )
    chunks = [match["metadata"]["text"] for match in results["matches"]]
    return chunks

def generate_answer(query, namespace, chat_history=None):
    if chat_history is None:
        chat_history = []
        
    # To help with queries like "what did he do?", include some history in the search query
    search_query = query
    if len(chat_history) > 0 and len(query.split()) < 6:
        last_turn = chat_history[-1]
        search_query = f"{last_turn.get('user', '')} {query}"
        
    chunks = retrieve_chunks(search_query, namespace)
    
    # Blend with global knowledge namespace if querying a specific user
    try:
        parts = namespace.split("_")
        if len(parts) >= 3 and parts[1] != "global":
            global_namespace = f"user_global_{parts[2]}"
            global_chunks = retrieve_chunks(search_query, global_namespace)
            chunks.extend(global_chunks)
    except Exception as e:
        print(f"[RAG-DECK] Global knowledge blend error: {e}")
        
    context = "\n\n".join(chunks)

    history_text = ""
    if chat_history:
        history_text = "Previous Conversation History:\n"
        for msg in chat_history[-3:]: # Keep last 3 turns
            history_text += f"User: {msg.get('user', '')}\nAssistant: {msg.get('ai', '')}\n"

    prompt = f"""
You are a deeply compassionate, empathetic, and comforting Mental Health AI Assistant. 
Your goal is to provide warm, validating, and calming support to users experiencing mental health struggles. 

CRITICAL DIRECTIVE: You must base and ground your support heavily and explicitly on the retrieved clinical reference context below. Highlight, cite, and reference the specific exercises, steps, or therapeutic suggestions found directly in these reference documents.

IMPORTANT: Never mention the technical terms 'RAG', 'retrieved context', 'vector database', or 'document search' to the user. Keep the session deeply personal, human, and therapeutic. Instead, naturally refer to this wisdom as 'our guidelines', 'therapeutic references', or 'comforting support guides'.

RAG Reference Context:
{context}

{history_text}

User's Input:
{query}

Guidelines:
1. Be extremely comforting, kind, and supportive (speak like a gentle, warm listener).
2. Interpret the RAG context and translate it into gentle, easy-to-understand support, giving it a comforting meaning.
3. CONCISENESS & STEPS RULE:
   - If the user's input asks for "steps", "instructions", "guidelines", "rules", or "lists" to do something: You MUST ignore the 5-line limit and fully list ALL the relevant steps and details from the context clearly and actionably.
   - For all other general queries, you MUST keep the answer extremely concise—MAXIMUM 5 lines of text (2-3 short sentences). Do NOT waste the user's time; give them a brief, comforting, and direct answer immediately.
4. If the context does not fully cover the query, provide gentle, generalized support and let the user know they are not alone.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content

if __name__ == "__main__":
    pass