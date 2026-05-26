from database import get_db
db = get_db()
res = db.table("interactions").select("type").order("timestamp", desc=True).limit(20).execute()
print("Recent types:")
for row in res.data:
    print(row["type"])
