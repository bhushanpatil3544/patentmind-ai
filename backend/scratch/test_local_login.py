import urllib.request
import json

url = "http://127.0.0.1:8000/api/v1/auth/login"
payload = {
    "username": "BHUSHAN",
    "password": "3544"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        res_text = response.read().decode('utf-8')
        print("LOCAL LOGIN SUCCESS RESPONSE:", res_text)
except urllib.error.HTTPError as e:
    print("LOCAL LOGIN HTTP ERROR:", e.code, e.read().decode('utf-8'))
except Exception as err:
    print("LOCAL LOGIN ERROR:", err)
