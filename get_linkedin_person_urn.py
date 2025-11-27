import os
import requests
from dotenv import load_dotenv

load_dotenv()

ACCESS_TOKEN = os.environ.get("LINKEDIN_ACCESS_TOKEN")

resp = requests.get(
    "https://api.linkedin.com/v2/userinfo",
    headers={
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "X-Restli-Protocol-Version": "2.0.0",
    },
)

print(resp.status_code)
print(resp.json())