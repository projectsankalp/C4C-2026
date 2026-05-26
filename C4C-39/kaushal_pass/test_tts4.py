import requests, json

api_key = "sk_x9l3uxxx_5N2WhYswqp07fDAcbqxRxYpR"
headers = {
    "api-subscription-key": api_key,
    "Content-Type": "application/json"
}

payload2 = {
    "inputs": ["नमस्ते, यह एक परीक्षण है।"],
    "target_language_code": "hi-IN",
    "speaker": "priya",
    "model": "bulbul:v3"
}
res2 = requests.post("https://api.sarvam.ai/text-to-speech", json=payload2, headers=headers)
print("Payload inputs Status:", res2.status_code)
if res2.status_code != 200:
    print(res2.text[:200])
