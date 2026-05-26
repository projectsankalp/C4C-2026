import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-dev-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret-key')
    DATABASE_NAME = os.environ.get('DATABASE_NAME', 'swachh_vayu.db')
    DEBUG_MODE = os.environ.get('DEBUG_MODE', 'True') == 'True'
    
    # AQI Alert Thresholds
    AQI_MODERATE = 101
    AQI_POOR = 201
    AQI_HAZARDOUS = 301
    
    # Alert Cooldown Time in seconds (e.g., 15 minutes = 900 seconds)
    ALERT_COOLDOWN_SECONDS = int(os.environ.get('ALERT_COOLDOWN_SECONDS', 900))
    
    # Placeholders for later
    GSM_SERIAL_PORT = os.environ.get('GSM_SERIAL_PORT', '/dev/ttyUSB0')
    SARVAM_API_KEY = os.environ.get('SARVAM_API_KEY', '')
    # Hardware Configuration
    LORA_SERIAL_PORT = os.getenv('LORA_SERIAL_PORT', 'COM3') # /dev/ttyUSB0 for Pi
    LORA_BAUD_RATE = int(os.getenv('LORA_BAUD_RATE', 9600))
    GSM_SERIAL_PORT = os.getenv('GSM_SERIAL_PORT', 'COM4') # /dev/ttyS0 for Pi
    GSM_BAUD_RATE = int(os.getenv('GSM_BAUD_RATE', 9600))
    GSM_MOCK_MODE = os.getenv('GSM_MOCK_MODE', 'True').lower() == 'true'
