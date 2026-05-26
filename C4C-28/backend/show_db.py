import sqlite3

conn = sqlite3.connect('swachh_vayu.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()

print("=" * 60)
print("SWACHH VAYU DATABASE OVERVIEW")
print("=" * 60)

for (table_name,) in tables:
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    row_count = cursor.fetchone()[0]
    
    print(f"\n{'─' * 60}")
    print(f"TABLE: {table_name}  ({row_count} rows)")
    print(f"{'─' * 60}")
    for col in columns:
        pk = " [PK]" if col[5] else ""
        nn = " NOT NULL" if col[3] else ""
        default = f" DEFAULT={col[4]}" if col[4] is not None else ""
        print(f"  {col[1]:<25} {col[2]:<15}{pk}{nn}{default}")

    # Show sample data (first 5 rows)
    if row_count > 0:
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5")
        rows = cursor.fetchall()
        col_names = [c[1] for c in columns]
        print(f"\n  Sample data ({min(5, row_count)} of {row_count}):")
        # Print header
        header = " | ".join(f"{name[:18]:<18}" for name in col_names)
        print(f"  {header}")
        print(f"  {'─' * len(header)}")
        for row in rows:
            vals = " | ".join(f"{str(v)[:18]:<18}" for v in row)
            print(f"  {vals}")

conn.close()
