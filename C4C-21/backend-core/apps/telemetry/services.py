from datetime import datetime
import random

# Temporary memory storage
telemetry_db = []

class TelemetryService:

    @staticmethod
    def calculate_risk(water_level):

        if water_level < 2:
            return "HIGH"

        elif water_level < 3:
            return "MEDIUM"

        return "SAFE"

    @staticmethod
    def generate_dummy_data():

        water_level = round(random.uniform(1.0, 5.0), 2)

        telemetry_data = {
            "water_level": water_level,
            "soil_moisture": random.randint(30, 90),
            "temperature": random.randint(20, 40),
            "location": random.choice([
                "Bantwal",
                "Mangalore",
                "Udupi",
                "Mysore"
            ]),
            "risk_level": TelemetryService.calculate_risk(water_level),
            "timestamp": datetime.utcnow().isoformat()
        }

        telemetry_db.append(telemetry_data)

        return telemetry_data

    @staticmethod
    def get_latest_data():

        if len(telemetry_db) == 0:
            return {
                "message": "No telemetry data available"
            }

        return telemetry_db[-1]

    @staticmethod
    def get_history():

        return telemetry_db