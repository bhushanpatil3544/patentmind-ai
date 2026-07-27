import requests
import json
import urllib.parse

try:
    query = "quantum computing"
    encoded_url = f"q={urllib.parse.quote(query)}&num=3"
    url = "https://patents.google.com/xhr/query"
    params = {"url": encoded_url}
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    response = requests.get(url, params=params, headers=headers, timeout=5)
    if response.status_code == 200:
        data = response.json()
        items = data.get("results", {}).get("cluster", [])[0].get("result", [])
        if items:
            print(json.dumps(items[0], indent=2))
except Exception as e:
    print(f"Error: {e}")
