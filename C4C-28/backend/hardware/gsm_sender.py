import serial
import time
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from utils.logger import hardware_logger

def _send_at_command(ser, command, wait_time=1):
    """Helper to send AT command and read response."""
    ser.write((command + '\r').encode())
    time.sleep(wait_time)
    response = ''
    while ser.in_waiting > 0:
        response += ser.read(ser.in_waiting).decode('utf-8')
    return response

def send_sms_via_gsm(phone_number, text):
    """
    Sends an SMS via the physical SIM800L module.
    If GSM_MOCK_MODE is True, it simulates success.
    """
    if Config.GSM_MOCK_MODE:
        hardware_logger.info(f"[GSM MOCK] Sending SMS to {phone_number}: {text}")
        return True
        
    port = Config.GSM_SERIAL_PORT
    baud = Config.GSM_BAUD_RATE
    
    try:
        ser = serial.Serial(port, baud, timeout=1)
        
        # 1. Check if module is responding
        resp = _send_at_command(ser, "AT")
        if "OK" not in resp:
            hardware_logger.error("[GSM ERROR] SIM800L not responding to AT.")
            ser.close()
            return False
            
        # 2. Set to Text Mode
        resp = _send_at_command(ser, "AT+CMGF=1")
        if "OK" not in resp:
            hardware_logger.error("[GSM ERROR] Failed to set text mode.")
            ser.close()
            return False
            
        # 3. Send SMS Command
        ser.write((f'AT+CMGS="{phone_number}"\r').encode())
        time.sleep(1)
        
        # 4. Send Message Body and CTRL+Z (\x1A)
        ser.write(text.encode() + b'\x1A')
        time.sleep(3) # SMS sending takes a few seconds
        
        resp = ''
        while ser.in_waiting > 0:
            resp += ser.read(ser.in_waiting).decode('utf-8')
            
        ser.close()
        
        if "+CMGS:" in resp or "OK" in resp:
            hardware_logger.info(f"[GSM SUCCESS] SMS sent to {phone_number}")
            return True
        else:
            hardware_logger.error(f"[GSM ERROR] Failed to send SMS: {resp}")
            return False
            
    except serial.SerialException as e:
        hardware_logger.critical(f"[GSM CRITICAL] Serial port unavailable: {str(e)}")
        return False
