import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")
phone_from = os.getenv("TWILIO_PHONE_NUMBER")

print("From:", phone_from)
phone_to = "+916363478425"

try:
    client = Client(sid, token)
    msg = client.messages.create(
        body="Test message from MindMitra",
        from_=phone_from,
        to=phone_to
    )
    print("Success! Message SID:", msg.sid)
except Exception as e:
    print("Twilio SMS Error:", e)
