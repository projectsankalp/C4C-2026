#!/usr/bin/env python3
import sys
sys.path.insert(0, '/c/Users/ASUS/Desktop/np/backend')

from src.database import db

print("🔧 Deleting all documents from Firestore collections...")

collections = ['volunteers', 'users', 'certifications']

for coll_name in collections:
    docs = db.collection(coll_name).stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    print(f"  ✅ Deleted {count} documents from {coll_name}")

print("\n✅ Database has been reset!")
