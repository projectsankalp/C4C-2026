import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")
phone_from = os.getenv("TWILIO_PHONE_NUMBER")
phone_to = "+916363478425"

try:
    client = Client(sid, token)
    call = client.calls.create(
        twiml='<Response><Say>Mind Mitra SOS Alert. Your emergency contact needs help.</Say></Response>',
        to=phone_to,
        from_=phone_from
    )
    print("Call initiated! SID:", call.sid)
except Exception as e:
    print("Call Error:", e)
