from apps.core.database import supabase

response = supabase.table("telemetry").select("*").execute()

print(response)