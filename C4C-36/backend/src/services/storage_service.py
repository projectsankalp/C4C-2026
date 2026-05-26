from fastapi import UploadFile
from supabase import create_client, Client
from src.core.config import settings

supabase: Client | None = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
def upload_file_to_cloud(file: UploadFile, folder: str = "submissions") -> str:
    """
    Uploads a file to Supabase Storage bucket.
    Assumes a bucket named 'uploads' exists.
    """
    try:
        if not supabase:
            print("Supabase credentials not found. Falling back to local URL.")
            return f"/uploads/{file.filename}"
        
        # Read file content
        file_content = file.file.read()
        
        # Define the file path in the bucket
        file_path = f"{folder}/{file.filename}"
        
        # Upload to 'uploads' bucket
        # Note: upsert=True allows overwriting
        res = supabase.storage.from_("uploads").upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type, "upsert": "true"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("uploads").get_public_url(file_path)
        return public_url
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        # Fallback to local-style path if upload fails during dev
        return f"/uploads/{file.filename}"
    finally:
        file.file.seek(0)
