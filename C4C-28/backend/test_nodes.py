import requests

base_url = 'http://127.0.0.1:5000/api'

# 1. Login
print('1. Logging in as Admin...')
r = requests.post(f'{base_url}/auth/login', json={'mobile_number': '9999999999', 'password': 'securepassword123'})
token = r.json().get('data', {}).get('token')
headers = {'Authorization': f'Bearer {token}'}

# 2. Create NODE_01
print('\n2. Creating NODE_01...')
node_data = {
    'node_code': 'NODE_01',
    'node_name': 'Khedgaon Sensor Alpha',
    'village': 'Khedgaon',
    'area': 'Panchayat Office',
    'latitude': 19.9876,
    'longitude': 73.7890
}
r_create = requests.post(f'{base_url}/nodes', json=node_data, headers=headers)
print(r_create.json())
node_id = r_create.json().get('data', {}).get('node_id')

# 3. Get all nodes
print('\n3. Getting all nodes...')
r_all = requests.get(f'{base_url}/nodes', headers=headers)
nodes = r_all.json().get('data', {}).get('nodes', [])
for n in nodes:
    print(f"{n['node_code']} -> Status: {n['status']}, Color: {n['marker_color']}")

# 4. Update NODE_01 location
print('\n4. Updating NODE_01 location...')
r_update = requests.put(f'{base_url}/nodes/{node_id}', json={'latitude': 20.0000, 'longitude': 74.0000}, headers=headers)
print(r_update.json())

# 5. Deactivate NODE_01
print('\n5. Deactivating NODE_01...')
r_delete = requests.delete(f'{base_url}/nodes/{node_id}', headers=headers)
print(r_delete.json())

# Fetch again to verify inactive status
r_verify = requests.get(f'{base_url}/nodes/{node_id}', headers=headers)
print('Verified Status:', r_verify.json().get('data', {}).get('node', {}).get('status'))
