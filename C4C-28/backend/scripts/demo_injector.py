import requests
import random
import time
import argparse

API_URL = "http://127.0.0.1:5000/api/aqi/readings"
NODES = ['NODE_001', 'NODE_002', 'NODE_003', 'NODE_004', 'NODE_005']

def inject_loop(interval=5):
    print(f"📡 Starting Fake Packet Injector (Interval: {interval}s)")
    print(f"Targeting: {API_URL}")
    print("Press Ctrl+C to stop.")
    
    while True:
        node = random.choice(NODES)
        
        # Base values that fluctuate
        base_mq135 = random.randint(40, 250)
        temp = 25.0 + random.uniform(-2, 2)
        humidity = 50.0 + random.uniform(-5, 5)
        battery = random.randint(70, 100)
        rssi = random.randint(-110, -50)
        
        payload = {
            "node_code": node,
            "mq135_value": base_mq135,
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "battery_level": battery,
            "lora_rssi": rssi
        }
        
        try:
            r = requests.post(API_URL, json=payload)
            if r.status_code == 200:
                print(f"✅ Injected -> {node}: MQ135={base_mq135}")
            else:
                print(f"❌ Failed -> {r.status_code} {r.text}")
        except Exception as e:
            print(f"⚠️ Connection Error: {e}")
            
        time.sleep(interval)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Inject fake LoRa packets.")
    parser.add_argument("--interval", type=int, default=5, help="Seconds between packets")
    args = parser.parse_args()
    
    inject_loop(args.interval)
