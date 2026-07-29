import urllib.request

url = "https://patentmind-backend-bhushan.loca.lt/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Bypass-Tunnel-Remainder': 'true'})

try:
    with urllib.request.urlopen(req) as response:
        res_text = response.read().decode('utf-8')
        print("LOCALTUNNEL ROOT SUCCESS RESPONSE:", res_text)
except urllib.error.HTTPError as e:
    print("LOCALTUNNEL ROOT HTTP ERROR:", e.code, e.read().decode('utf-8'))
except Exception as err:
    print("LOCALTUNNEL ROOT ERROR:", err)
