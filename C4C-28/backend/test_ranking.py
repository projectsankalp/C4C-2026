import sqlite3
import requests

# 1. Direct DB Injection for Q1 2026
conn = sqlite3.connect('swachh_vayu.db')
cursor = conn.cursor()

# Make sure we have 2 nodes
cursor.execute("INSERT OR IGNORE INTO nodes (id, node_code, node_name, village, area, latitude, longitude) VALUES (2, 'NODE_02', 'City Center', 'Pune', 'Shivajinagar', 18.5204, 73.8567)")
conn.commit()

# Inject 10 days of readings for Khedgaon (Node 1) in Jan 2026
for i in range(1, 11):
    date_str = f"2026-01-{i:02d} 10:00:00"
    aqi = 60 + i # ~65 avg
    cursor.execute("INSERT INTO aqi_readings (node_id, mq135_value, calculated_aqi, aqi_status, reading_time) VALUES (1, ?, ?, 'Moderate', ?)", (aqi, aqi, date_str))

# Inject 10 days of readings for Pune (Node 2) in Jan 2026
for i in range(1, 11):
    date_str = f"2026-01-{i:02d} 10:00:00"
    aqi = 150 + i # ~155 avg
    cursor.execute("INSERT INTO aqi_readings (node_id, mq135_value, calculated_aqi, aqi_status, reading_time) VALUES (2, ?, ?, 'Poor', ?)", (aqi, aqi, date_str))

conn.commit()
conn.close()

print("--- Mock Data Injected ---")

# 2. Test via API
base_url = 'http://127.0.0.1:5000/api'
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

print("\n--- Test 1: Generate Ranking for Q1 2026 ---")
r1 = requests.post(f'{base_url}/rankings/generate', json={'quarter': 'Q1', 'year': 2026}, headers=headers)
print(r1.json())

print("\n--- Test 2: Fetch Current Ranking ---")
r2 = requests.get(f'{base_url}/rankings/current', headers=headers)
rankings = r2.json().get('data', {}).get('rankings', [])
for r in rankings:
    print(f"Rank {r['rank_position']}: {r['village_name']} | Avg AQI: {r['average_aqi']} | Final Score: {r['final_score']} | Reward: {r['reward_status']}")

print("\n--- Test 3: Update Reward Status ---")
if rankings:
    top_rank_id = rankings[0]['id']
    r3 = requests.put(f'{base_url}/rankings/{top_rank_id}/reward', json={'reward_status': 'rewarded'}, headers=headers)
    print(r3.json())
