from database import get_db

db = get_db()
try:
    response = db.table("interactions").insert({"type": "chat", "content": "test", "user_id": "123e4567-e89b-12d3-a456-426614174000"}).execute()
    print("Success:", response)
except Exception as e:
    print("Error:", e)
