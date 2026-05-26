import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)
resp = supabase.table("emergency_contacts").update({"phone": "+916363478425"}).eq("phone", "6363478425").execute()
print("Updated:", resp.data)
