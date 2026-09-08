import urllib.request
import json

try:
    req = urllib.request.Request("http://localhost:8000/api/v1/records")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print("GET /api/v1/records Response:", data)
except Exception as e:
    print("Error calling backend:", e)
