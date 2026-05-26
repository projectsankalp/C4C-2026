import random
from datetime import datetime, timedelta
from twilio.rest import Client
from src.core.config import settings

def generate_otp() -> str:
    # Using dummy 123456 for easy testing
    return "123456"

def get_otp_expiry() -> datetime:
    return datetime.utcnow() + timedelta(minutes=5)

def send_otp_sms(phone: str, otp: str):
    print(f"DEBUG: Attempting to send OTP {otp} to {phone}")
    
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            
            # Option A: Twilio Verify Service
            if settings.TWILIO_VERIFY_SERVICE_SID:
                client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID) \
                    .verifications \
                    .create(to=phone, channel='sms')
                return True
            
            # Option B: Standard SMS
            if settings.TWILIO_PHONE_NUMBER:
                client.messages.create(
                    body=f"Your Code4Change verification code is: {otp}",
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone
                )
                return True
            
        except Exception as e:
            print(f"Twilio error: {e}")
    
    # Fallback/Development: Always print to console
    print(f"DEVELOPMENT MODE: OTP for {phone} is {otp}")
    return True
