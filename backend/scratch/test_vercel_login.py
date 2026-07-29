import urllib.request
import json

url = "https://patentmind-ai-p6qx.vercel.app/api/v1/auth/login"
payload = {
    "username": "client",
    "password": "clientpassword"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        res_text = response.read().decode('utf-8')
        print("VERCEL LOGIN SUCCESS RESPONSE:", res_text)
except urllib.error.HTTPError as e:
    print("VERCEL LOGIN HTTP ERROR:", e.code, e.read().decode('utf-8'))
except Exception as err:
    print("VERCEL LOGIN ERROR:", err)
