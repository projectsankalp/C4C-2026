import requests
from utils.logger import hardware_logger

# Assuming the backend is running locally for the hardware mediator
API_BASE = 'http://127.0.0.1:5000/api'

def process_lora_packet(parsed_data):
    """
    Takes parsed LoRa dictionary and injects it into the Flask AQI API.
    """
    try:
        # In a real environment, you would use a secure internal Service Token
        # Since this runs on the same Raspberry Pi as the Flask server, 
        # we make a local HTTP request.
        
        payload = {
            "node_code": parsed_data.get('node_code'),
            "mq135_value": parsed_data.get('mq135_value'),
            "temperature": parsed_data.get('temperature'),
            "humidity": parsed_data.get('humidity'),
            "battery_level": parsed_data.get('battery_level'),
            "lora_rssi": parsed_data.get('lora_rssi')
        }
        
        response = requests.post(f"{API_BASE}/aqi/readings", json=payload)
        
        if response.status_code == 200:
            hardware_logger.info(f"[HARDWARE MEDIATOR] Successfully forwarded AQI for {parsed_data.get('node_code')}")
            return True
        else:
            hardware_logger.error(f"[HARDWARE MEDIATOR ERROR] API rejected packet: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        hardware_logger.critical("[HARDWARE MEDIATOR CRITICAL] Flask API is unreachable. Is the server running?")
        return False
    except Exception as e:
        hardware_logger.error(f"[HARDWARE MEDIATOR ERROR] {str(e)}")
        return False
