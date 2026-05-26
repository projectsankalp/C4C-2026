import serial
import re
import time
import requests
import os
import sys

# Add parent dir to path so we can import config if running stand-alone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from utils.logger import hardware_logger

def parse_lora_packet(packet_string):
    """
    Parses a string like:
    NODE_01 | MQ135: 286 | TEMP: 31 | HUM: 62 | BAT: 82
    """
    try:
        data = {}
        parts = packet_string.split('|')
        
        if len(parts) < 2:
            return False, "Corrupted packet: Missing delimiters"
            
        data['node_code'] = parts[0].strip()
        
        for part in parts[1:]:
            if ':' in part:
                key, val = part.split(':')
                key = key.strip().upper()
                val = float(val.strip())
                
                if key == 'MQ135': data['mq135_value'] = val
                elif key == 'TEMP': data['temperature'] = val
                elif key == 'HUM': data['humidity'] = val
                elif key == 'BAT': data['battery_level'] = val
                elif key == 'RSSI': data['lora_rssi'] = val
                
        if 'node_code' not in data or 'mq135_value' not in data:
            return False, "Corrupted packet: Missing required fields"
            
        return True, data
        
    except Exception as e:
        return False, f"Parsing error: {str(e)}"


def start_listener(mock_mode=False):
    """
    Continuously listens to the LoRa serial port.
    For local development without a LoRa module, set mock_mode=True.
    """
    if mock_mode:
        hardware_logger.info("[LORA MOCK] Starting mock listener...")
        return
        
    port = Config.LORA_SERIAL_PORT
    baud = Config.LORA_BAUD_RATE
    
    try:
        ser = serial.Serial(port, baud, timeout=1)
        hardware_logger.info(f"[LORA] Listening on {port} at {baud} baud...")
        
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                hardware_logger.info(f"[LORA RECEIVED] {line}")
                
                success, parsed_data = parse_lora_packet(line)
                if success:
                    # Send to the Hardware Service mediator
                    from services.hardware_service import process_lora_packet
                    process_lora_packet(parsed_data)
                else:
                    hardware_logger.warning(f"[LORA ERROR] {parsed_data}")
                    
            time.sleep(0.1)
            
    except serial.SerialException as e:
        hardware_logger.critical(f"[LORA CRITICAL] Serial port unavailable: {str(e)}")
        
if __name__ == '__main__':
    start_listener(mock_mode=True)
