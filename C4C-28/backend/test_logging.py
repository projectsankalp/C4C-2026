import requests
import os

base_url = 'http://127.0.0.1:5000/api'

print("--- Test 1: Trigger 400 Bad Request ---")
r1 = requests.post(f'{base_url}/aqi/readings', json={"node_code": "NODE_01", "mq135_value": "INVALID_STRING"})
print("Status Code:", r1.status_code)
print("Response JSON:", r1.json())

print("\n--- Test 2: Trigger 404 Not Found ---")
r2 = requests.get(f'{base_url}/this_route_does_not_exist')
print("Status Code:", r2.status_code)
print("Response JSON:", r2.json())

print("\n--- Test 3: Trigger 401 Unauthorized ---")
r3 = requests.get(f'{base_url}/auth/profile', headers={"Authorization": "Bearer BAD_TOKEN"})
print("Status Code:", r3.status_code)
print("Response JSON:", r3.json())

print("\n--- Test 4: Check Logs Directory ---")
logs_dir = os.path.join(os.path.dirname(__file__), 'logs')
if os.path.exists(logs_dir):
    files = os.listdir(logs_dir)
    print("Log files generated:", files)
    
    # Read aqi.log
    if 'aqi.log' in files:
        print("\n--- Contents of aqi.log ---")
        with open(os.path.join(logs_dir, 'aqi.log'), 'r') as f:
            print(f.read())
            
    # Read app.log
    if 'app.log' in files:
        print("\n--- Contents of app.log ---")
        with open(os.path.join(logs_dir, 'app.log'), 'r') as f:
            print(f.read())
else:
    print("Logs directory not found!")
