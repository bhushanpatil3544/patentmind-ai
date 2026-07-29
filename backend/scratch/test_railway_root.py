import urllib.request

url = "https://patentmind-ai-production.up.railway.app/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

try:
    with urllib.request.urlopen(req) as response:
        res_text = response.read().decode('utf-8')
        print("RAILWAY ROOT SUCCESS RESPONSE:", res_text)
except urllib.error.HTTPError as e:
    print("RAILWAY ROOT HTTP ERROR:", e.code, e.read().decode('utf-8'))
except Exception as err:
    print("RAILWAY ROOT ERROR:", err)
