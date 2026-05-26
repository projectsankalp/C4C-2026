import requests
from hardware.lora_receiver import parse_lora_packet
from services.hardware_service import process_lora_packet

print("--- Test 1: Corrupted Packet Parser ---")
bad_packet = "NODE_01 | MQ135: "
success, data = parse_lora_packet(bad_packet)
print("Success:", success, "| Output:", data)

print("\n--- Test 2: Valid Packet Parser ---")
good_packet = "NODE_02 | MQ135: 350 | TEMP: 32.5 | HUM: 65 | BAT: 80 | RSSI: -45"
success, data = parse_lora_packet(good_packet)
print("Success:", success, "| Output:", data)

print("\n--- Test 3: Hardware Service API Injection (Simulate LoRa Receive) ---")
base_url = 'http://127.0.0.1:5000/api'

# Register Pune User
user_data = {
    'full_name': 'Pune User',
    'email': 'pune@user.com',
    'password': 'password123',
    'mobile_number': '7777777777',
    'village_name': 'Pune',
    'area_name': 'Shivajinagar',
    'alert_mode': 'sms'
}
requests.post(f'{base_url}/auth/register', json=user_data)

if success:
    process_lora_packet(data)
    
print("\n--- Test 4: Check Database for the injected packet ---")

# Login to get token
r_auth = requests.post(f'{base_url}/auth/login', json={'mobile_number': '7777777777', 'password': 'password123'})
token = r_auth.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

try:
    r = requests.get(f'{base_url}/aqi/village/Pune', headers=headers)
    readings = r.json().get('data', {}).get('readings', [])
    if readings:
        latest = readings[0]
        print(f"Latest DB Reading -> AQI: {latest['calculated_aqi']} | Status: {latest['aqi_status']} | Node: {latest['node_code']}")
except Exception as e:
    print(f"Error checking DB: {str(e)}")
