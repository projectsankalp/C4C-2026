import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)
resp = supabase.table("emergency_contacts").select("*").execute()
print("Contacts:")
for c in resp.data:
    print(c)
