import sqlite3
import random
import time
from datetime import datetime, timedelta

DB_PATH = "swachh_vayu.db"

def seed_data():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    print("🌱 Seeding Demo Data...")

    # Ensure a demo admin user exists so alerts have a user_id
    c.execute("INSERT OR IGNORE INTO users (id, full_name, mobile_number, password_hash, village_name, role) VALUES (1, 'Admin', '9999999999', 'hash', 'Khedgaon', 'admin')")
    
    # 1. Seed Nodes (Map Nodes)
    nodes = [
        (1, 'NODE_001', 'Khedgaon Main', 'Khedgaon', 'North Zone', 19.987, 73.789, 'active'),
        (2, 'NODE_002', 'Khedgaon School', 'Khedgaon', 'South Zone', 19.985, 73.791, 'active'),
        (3, 'NODE_003', 'Pimpalgaon Center', 'Pimpalgaon', 'East Zone', 20.012, 73.811, 'active'),
        (4, 'NODE_004', 'Ozar Highway', 'Ozar', 'West Zone', 20.105, 73.921, 'active'),
        (5, 'NODE_005', 'Chandwad Market', 'Chandwad', 'Central', 20.329, 74.249, 'active'),
    ]
    
    for node in nodes:
        c.execute("""
            INSERT OR IGNORE INTO nodes (id, node_code, node_name, village, area, latitude, longitude, status, battery_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 100)
        """, node)
    
    conn.commit()
    print("✅ Nodes seeded.")

    # 2. Seed 30 Days of Historical AQI Data
    c.execute("DELETE FROM aqi_readings")
    
    now = datetime.now()
    readings = []
    
    def get_status(aqi):
        if aqi <= 50: return 'Good'
        if aqi <= 100: return 'Satisfactory'
        if aqi <= 200: return 'Moderate'
        if aqi <= 300: return 'Poor'
        if aqi <= 400: return 'Very Poor'
        return 'Severe'

    # Generate 1 reading per hour for the past 30 days for each node
    for node in nodes:
        node_id = node[0]
        base_aqi = random.randint(40, 150) # Different baseline per node
        
        for day in range(30, -1, -1):
            for hour in range(0, 24, 4): # Every 4 hours to keep DB size reasonable
                read_time = now - timedelta(days=day, hours=hour)
                
                # Add some noise and daily patterns
                noise = random.randint(-20, 20)
                if 8 <= hour <= 20: # Daytime is more polluted
                    noise += 30
                    
                aqi = max(10, min(500, base_aqi + noise))
                
                readings.append((
                    node_id, 
                    aqi + random.randint(-10, 10), # mq135_value
                    aqi,                           # calculated_aqi
                    get_status(aqi),               # aqi_status
                    25.0 + random.uniform(-5, 5),  # temperature
                    50.0 + random.uniform(-10, 10),# humidity
                    random.randint(50, 100),       # battery_level
                    random.randint(-120, -50),     # lora_signal_strength
                    read_time.strftime('%Y-%m-%d %H:%M:%S')
                ))

    c.executemany("""
        INSERT INTO aqi_readings (node_id, mq135_value, calculated_aqi, aqi_status, temperature, humidity, battery_level, lora_signal_strength, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, readings)
    conn.commit()
    print(f"✅ {len(readings)} Historical AQI readings seeded.")

    # 3. Seed Alerts
    c.execute("DELETE FROM alerts")
    alerts = [
        (1, 1, 'SMS', 'Hazardous AQI detected. Please stay indoors.', 1, 350, 'emergency', 'Delivered', now.strftime('%Y-%m-%d %H:%M:%S')),
        (4, 1, 'Voice', 'AQI is poor due to crop burning. Wear masks.', 1, 280, 'warning', 'Delivered', (now - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')),
        (5, 1, 'SMS', 'AQI is normal today. Enjoy the fresh air.', 1, 45, 'info', 'Delivered', (now - timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S'))
    ]
    
    c.executemany("""
        INSERT INTO alerts (node_id, user_id, alert_type, message, language_id, aqi_value, severity_level, delivery_status, alert_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alerts)
    conn.commit()
    print("✅ Alerts seeded.")

    # 4. Seed Village Rankings
    c.execute("DELETE FROM rankings")
    rankings = [
        ('Pimpalgaon', 'Q2', 2026, 45, 20, 80, 5.0, 95, 90.0, 1, 'Eligible'),
        ('Chandwad', 'Q2', 2026, 62, 30, 110, 2.1, 85, 80.0, 2, 'Pending Evaluation'),
        ('Khedgaon', 'Q2', 2026, 110, 60, 210, -4.5, 70, 60.0, 3, 'Not Eligible'),
        ('Ozar', 'Q2', 2026, 155, 80, 280, -12.0, 60, 45.0, 4, 'Not Eligible'),
    ]
    
    c.executemany("""
        INSERT INTO rankings (village_name, quarter, year, average_aqi, best_aqi, worst_aqi, reduction_percentage, participation_score, final_score, rank_position, reward_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rankings)
    conn.commit()
    print("✅ Rankings seeded.")
    
    conn.close()
    print("🚀 Seed complete! Dashboard should look alive now.")

if __name__ == "__main__":
    seed_data()
