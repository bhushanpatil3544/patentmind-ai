import urllib.request
import json

url = "https://patentmind-ai-production.up.railway.app/api/v1/auth/gmail-otp/request"
payload = {
    "email": "patilbhushan3544@gmail.com",
    "username": "testuser_cloud99"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        res_text = response.read().decode('utf-8')
        print("RAILWAY API SUCCESS RESPONSE:", res_text)
except urllib.error.HTTPError as e:
    print("RAILWAY API HTTP ERROR:", e.code, e.read().decode('utf-8'))
except Exception as err:
    print("RAILWAY API ERROR:", err)
