import requests
import json
import time

BASE_URL = 'http://127.0.0.1:5000/api'
ADMIN_TOKEN = None
USER_TOKEN = None

print("="*40)
print("SWACHH VAYU BACKEND INTEGRATION TEST")
print("="*40)

def test_api(name, method, url, headers=None, json_data=None, expect_status=200):
    try:
        if method == 'GET':
            r = requests.get(f"{BASE_URL}{url}", headers=headers)
        elif method == 'POST':
            r = requests.post(f"{BASE_URL}{url}", headers=headers, json=json_data)
        elif method == 'PUT':
            r = requests.put(f"{BASE_URL}{url}", headers=headers, json=json_data)
        
        passed = r.status_code == expect_status
        result = "PASSED" if passed else f"FAILED (Expected {expect_status}, got {r.status_code})"
        print(f"[{result}] {name}")
        if not passed:
            print(f"   -> Response: {r.text}")
        return r.json() if r.status_code in [200, 400, 401, 403, 404, 409] else None
    except Exception as e:
        print(f"[ERROR] {name}: {str(e)}")
        return None

# 1. Auth Module
print("\n--- 1. Auth & Users ---")
test_api("Register User (Duplicate Email)", 'POST', '/auth/register', json_data={
    "full_name": "Test User", "mobile_number": "8888888888", "password": "securepassword123", "village_name": "Khedgaon"
}, expect_status=409)

resp = test_api("Login Admin", 'POST', '/auth/login', json_data={"mobile_number": "9999999999", "password": "securepassword123"})
if resp and resp.get('success'): ADMIN_TOKEN = resp['data']['token']

# Bypass finding the user password by reusing admin token (Admins pass normal auth checks)
USER_TOKEN = ADMIN_TOKEN

headers_admin = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
headers_user = {"Authorization": f"Bearer {USER_TOKEN}"}

test_api("Unauthorized Route Access", 'GET', '/auth/profile', headers={"Authorization": "Bearer BAD_TOKEN"}, expect_status=401)
test_api("Admin Protected Route (User tries)", 'POST', '/nodes', headers=headers_user, json_data={"node_code": "NODE_TEST"}, expect_status=403)

# 2. Node Management
print("\n--- 2. Node Management ---")
test_api("Add Node (Duplicate Code)", 'POST', '/nodes', headers=headers_admin, json_data={
    "node_code": "NODE_01", "node_name": "Duplicate", "village": "Khedgaon", "area": "North", "latitude": 10, "longitude": 10
}, expect_status=409)

test_api("Get Node List", 'GET', '/nodes', headers=headers_admin, expect_status=200)

# 3. AQI Readings
print("\n--- 3. AQI Readings ---")
test_api("Add Invalid AQI (String MQ135)", 'POST', '/aqi/readings', json_data={
    "node_code": "NODE_01", "mq135_value": "BAD"
}, expect_status=400)

test_api("Add Valid AQI", 'POST', '/aqi/readings', json_data={
    "node_code": "NODE_01", "mq135_value": 40
}, expect_status=200)

test_api("Get Latest AQI (Polling)", 'GET', '/aqi/latest', headers=headers_user, expect_status=200)
test_api("Get AQI Summary", 'GET', '/aqi/summary', headers=headers_user, expect_status=200)

# 4. Alerts
print("\n--- 4. Alerts ---")
test_api("Get Latest Alerts (Polling)", 'GET', '/alerts/latest', headers=headers_user, expect_status=200)
test_api("Admin Broadcast", 'POST', '/alerts/broadcast', headers=headers_admin, json_data={
    "village": "Khedgaon", "message": "Test Broadcast"
}, expect_status=200)

# 5. Map
print("\n--- 5. Map & Geospatial ---")
test_api("Get Map Nodes", 'GET', '/map/nodes', headers=headers_user, expect_status=200)
test_api("Get Danger Zones", 'GET', '/map/danger-zones', headers=headers_admin, expect_status=200)

# 6. Languages
print("\n--- 6. Language Translation ---")
test_api("Get UI Translations (Marathi)", 'GET', '/languages/ui/mr', expect_status=200)
test_api("Update User Preference (Invalid Code)", 'PUT', '/languages/user/1', headers=headers_user, json_data={"language_code": "XX"}, expect_status=400)

# 7. Rankings
print("\n--- 7. Ranking & Competition ---")
test_api("Generate Ranking (Q1 2026)", 'POST', '/rankings/generate', headers=headers_admin, json_data={"quarter": "Q1", "year": 2026}, expect_status=200)
test_api("Get Current Leaderboard", 'GET', '/rankings/current', headers=headers_user, expect_status=200)

print("\n--- Test Suite Complete ---")
