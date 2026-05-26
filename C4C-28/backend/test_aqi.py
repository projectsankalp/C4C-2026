import requests
import time

base_url = 'http://127.0.0.1:5000/api'

# 1. Login to get token for protected routes
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

# Helper to insert reading
def send_reading(mq135):
    data = {
        'node_code': 'NODE_01',
        'mq135_value': mq135,
        'temperature': 25.5,
        'humidity': 60,
        'battery_level': 85
    }
    return requests.post(f'{base_url}/aqi/readings', json=data)

print("--- Test 1: Normal Reading (MQ135: 80) ---")
r = send_reading(80)
print(r.json())

print("\n--- Test 2: Moderate Reading (MQ135: 160) ---")
r = send_reading(160)
print(r.json())

print("\n--- Test 3: Poor Reading (MQ135: 260) ---")
r = send_reading(260)
print(r.json())

print("\n--- Test 4: Hazardous Reading (MQ135: 350) ---")
r = send_reading(350)
print(r.json())

print("\n--- Test 5: Duplicate Hazardous Reading (Cooldown test) ---")
r = send_reading(355)
print(r.json())

print("\n--- Test 6: Get AQI Summary ---")
r_sum = requests.get(f'{base_url}/aqi/summary', headers=headers)
print(r_sum.json())
