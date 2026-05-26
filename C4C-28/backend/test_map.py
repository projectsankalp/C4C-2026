import requests
import time

base_url = 'http://127.0.0.1:5000/api'

# 1. Login Admin
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

node_id = 1

print("--- Test 1: Update Node Location ---")
loc_data = {'latitude': 18.5204, 'longitude': 73.8567}
r1 = requests.put(f'{base_url}/map/node/{node_id}/location', json=loc_data, headers=headers)
print(r1.json())

print("\n--- Test 2: Add Hazardous AQI to ensure Map Intensity is 1.0 ---")
aqi_data = {
    'node_code': 'NODE_01',
    'mq135_value': 345,
    'temperature': 35.0,
    'humidity': 40
}
requests.post(f'{base_url}/aqi/readings', json=aqi_data)

print("\n--- Test 3: Fetch All Map Nodes ---")
r3 = requests.get(f'{base_url}/map/nodes', headers=headers)
nodes = r3.json().get('data', {}).get('nodes', [])
for n in nodes:
    print(f"{n['node_code']} -> Lat: {n['latitude']}, Lng: {n['longitude']}, Color: {n['marker_color']}")

print("\n--- Test 4: Fetch Village Map (Khedgaon) ---")
r4 = requests.get(f'{base_url}/map/village/Khedgaon', headers=headers)
print(f"Nodes in Khedgaon: {len(r4.json().get('data', {}).get('nodes', []))}")

print("\n--- Test 5: Fetch Heatmap Data ---")
r5 = requests.get(f'{base_url}/map/heatmap', headers=headers)
heatmap = r5.json().get('data', {}).get('heatmap', [])
for point in heatmap:
    print(f"Heatmap Point -> Intensity: {point['aqi_intensity']}, Status: {point['aqi_status']}")

print("\n--- Test 6: Fetch Danger Zones ---")
r6 = requests.get(f'{base_url}/map/danger-zones', headers=headers)
danger_zones = r6.json().get('data', {}).get('danger_zones', [])
for dz in danger_zones:
    print(f"Danger Zone -> Node: {dz['node']}, AQI: {dz['aqi']}, Status: {dz['status']}, Advice: {dz['advice']}")

print("\n--- Test 7: Fetch Offline Nodes ---")
# To test offline properly, we would manipulate last_seen in the DB.
# Right now, since we just added a reading, it should be active.
r7 = requests.get(f'{base_url}/map/offline-nodes', headers=headers)
print("Offline Nodes:", len(r7.json().get('data', {}).get('offline_nodes', [])))
