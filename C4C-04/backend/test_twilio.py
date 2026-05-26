import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")
phone = os.getenv("TWILIO_PHONE_NUMBER")

print("SID:", sid)
print("TOKEN:", token)
print("PHONE:", phone)

try:
    client = Client(sid, token)
    # Just checking account info to see if auth works
    account = client.api.accounts(sid).fetch()
    print("Twilio Auth Success. Account Status:", account.status)
except Exception as e:
    print("Twilio Error:", e)
