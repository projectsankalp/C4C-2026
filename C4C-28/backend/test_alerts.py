import requests
import time

base_url = 'http://127.0.0.1:5000/api'

# 1. Login
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}
admin_user_id = r_auth.json().get('data', {}).get('user', {}).get('id')

print("--- Test 1: Fetch all alerts ---")
r1 = requests.get(f'{base_url}/alerts', headers=headers)
print("Total alerts:", len(r1.json().get('data', {}).get('alerts', [])))

print("\n--- Test 1.5: Register Khedgaon User ---")
user_data = {
    'full_name': 'Khedgaon User',
    'email': 'user@khedgaon.com',
    'password': 'password123',
    'mobile_number': '8888888888',
    'village_name': 'Khedgaon',
    'area_name': 'Panchayat Office',
    'alert_mode': 'sms'
}
requests.post(f'{base_url}/auth/register', json=user_data)

print("\n--- Test 2: Emergency Broadcast ---")
broadcast_data = {
    'village': 'Khedgaon',
    'message': 'Crop burning smoke detected near school area.'
}
r2 = requests.post(f'{base_url}/alerts/broadcast', json=broadcast_data, headers=headers)
print(r2.json())

print("\n--- Test 3: Fetch latest alerts (Check broadcast) ---")
r3 = requests.get(f'{base_url}/alerts/latest', headers=headers)
latest = r3.json().get('data', {}).get('alerts', [])
for alert in latest[:2]:
    print(f"Alert ID: {alert['id']}, Type: {alert['alert_type']}, Status: {alert['delivery_status']}, Msg: {alert['message']}")

print("\n--- Test 4: Update Delivery Status ---")
if latest:
    alert_id = latest[0]['id']
    r4 = requests.put(f'{base_url}/alerts/{alert_id}/status', json={'status': 'sent'}, headers=headers)
    print(f"Updated status for alert {alert_id}:", r4.json())
    
print("\n--- Test 5: Duplicate SMS Protection Test (Simulate Node Trigger) ---")
# Manually trigger a "Poor" alert for NODE_01
node_id = 1
trigger_data = {'node_id': node_id, 'severity': 'high', 'alert_type': 'AQI_WARNING', 'aqi_value': 260}
r5 = requests.post(f'{base_url}/alerts/create', json=trigger_data, headers=headers)
print(r5.json())
