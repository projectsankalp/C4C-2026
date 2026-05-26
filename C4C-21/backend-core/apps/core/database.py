from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

SUPABASE_URL = "https://thrvxwcdecmiknmyxyox.supabase.co"

SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocnZ4d2NkZWNtaWtubXl4eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTE0NzcsImV4cCI6MjA5NTI4NzQ3N30.GX1CsH5a0jH72juVx4N9BSN07Eqb5Okpe5SWiHvebDY"

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)