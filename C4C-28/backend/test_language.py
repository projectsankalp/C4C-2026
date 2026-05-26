import requests

base_url = 'http://127.0.0.1:5000/api'

# 1. Login Admin to get token
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

print("--- Test 1: Fetch all languages ---")
r1 = requests.get(f'{base_url}/languages', headers=headers)
print("Languages returned:", len(r1.json().get('data', {}).get('languages', [])))

print("\n--- Test 2: Update User Preference to Marathi (mr) ---")
# We registered Khedgaon User as user_id = 2 in the previous test step
user_id = 2
r2 = requests.put(f'{base_url}/languages/user/{user_id}', json={'language_code': 'mr'}, headers=headers)
print(r2.json())

print("\n--- Test 3: Fetch UI Translations for Marathi ---")
r3 = requests.get(f'{base_url}/languages/ui/mr')
print(r3.json().get('data', {}).get('translations', {}).get('dashboard_title'))

print("\n--- Test 4: Simulate Alert to Trigger Translation ---")
# Manually trigger a "Hazardous" AQI alert for NODE_01 (node_id 1) in Khedgaon
trigger_data = {'node_id': 1, 'severity': 'emergency', 'alert_type': 'AQI_WARNING', 'aqi_value': 345}
r4 = requests.post(f'{base_url}/alerts/create', json=trigger_data, headers=headers)

# Wait 1 sec
import time
time.sleep(1)

# Fetch latest alerts and find the one for user_id = 2
r5 = requests.get(f'{base_url}/alerts/user/2', headers=headers)
latest_alerts = r5.json().get('data', {}).get('alerts', [])
if latest_alerts:
    # Print the Marathi message!
    print("Translated Alert Stored in DB:", latest_alerts[0]['message'])
else:
    print("No alert created. (Check if cooldown blocked it?)")
