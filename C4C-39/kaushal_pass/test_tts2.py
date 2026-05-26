import requests, json

api_key = "sk_x9l3uxxx_5N2WhYswqp07fDAcbqxRxYpR"

headers = {
    "api-subscription-key": api_key,
    "Content-Type": "application/json"
}
payload1 = {
    "inputs": ["नमस्ते, यह एक परीक्षण है।"],
    "target_language_code": "hi-IN",
    "speaker": "anushka",
    "model": "bulbul:v1"
}
res1 = requests.post("https://api.sarvam.ai/text-to-speech", json=payload1, headers=headers)
print("Payload 1 Status:", res1.status_code)

payload2 = {
    "text": "नमस्ते, यह एक परीक्षण है।",
    "target_language_code": "hi-IN",
    "speaker": "anushka",
    "model": "bulbul:v3",
    "pace": 1.0,
    "sampling_rate": 24000
}
res2 = requests.post("https://api.sarvam.ai/text-to-speech", json=payload2, headers=headers)
print("Payload 2 Status:", res2.status_code)
