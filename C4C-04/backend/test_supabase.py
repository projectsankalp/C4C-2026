import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing Supabase credentials in .env file.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Testing Supabase insert...")
    response = supabase.table("interactions").insert({"type": "chat", "content": "Test message"}).execute()
    print("SUCCESS: Insert worked. Data:", response.data)
except Exception as e:
    print("ERROR testing Supabase insert:", str(e))
