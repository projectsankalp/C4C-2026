import requests
import time

base_url = 'http://127.0.0.1:5000/api'
# Re-login as Khedgaon User
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

print("--- Test 1: Fetch Latest AQI (Polling Route) ---")
r1 = requests.get(f'{base_url}/aqi/latest', headers=headers)
data = r1.json()

print(f"Global Response last_updated: {data.get('last_updated')}")
readings = data.get('data', {}).get('readings', [])
if readings:
    for r in readings:
        if 'is_fresh' in r:
            print(f"Node {r['node_code']} -> is_fresh: {r['is_fresh']} (Recorded: {r['recorded_at']})")

print("\n--- Test 2: Inject New AQI Reading ---")
requests.post(f'{base_url}/aqi/readings', json={"node_code": "NODE_01", "mq135_value": 75})
time.sleep(1)

print("\n--- Test 3: Fetch Latest AQI Again ---")
r3 = requests.get(f'{base_url}/aqi/latest', headers=headers)
readings = r3.json().get('data', {}).get('readings', [])
for r in readings:
    if r['node_code'] == 'NODE_01':
        print(f"Node NODE_01 -> is_fresh: {r['is_fresh']} (Recorded: {r['recorded_at']})")

print("\n--- Test 4: Check Alert Freshness ---")
# Trigger manual alert using Broadcast to bypass cooldown
requests.post(f'{base_url}/alerts/broadcast', json={"village_name": "Khedgaon", "message": "Realtime Broadcast Test"}, headers=headers)
r4 = requests.get(f'{base_url}/alerts/latest?limit=1', headers=headers)
alerts = r4.json().get('data', {}).get('alerts', [])
for a in alerts:
    print(f"Alert ID {a['id']} -> is_new: {a['is_new']} (Time: {a['alert_time']})")
