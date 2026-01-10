import os
from pymongo import MongoClient

def read_secret(path: str) -> str | None:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return None

host = os.environ.get("MONGO_HOST", "localhost")
port = os.environ.get("MONGO_PORT", "27017")
db_name = os.environ.get("MONGO_DB", "atlas")
auth_source = os.environ.get("MONGO_AUTH_SOURCE", "admin")

user = read_secret("/run/secrets/mongo_app_username")
pwd = read_secret("/run/secrets/mongo_app_password")

if user and pwd:
    mongo_uri = f"mongodb://{user}:{pwd}@{host}:{port}/{db_name}?authSource={auth_source}"
else:
    mongo_uri = os.environ.get("MONGO_URI", f"mongodb://{host}:{port}/{db_name}")

client = MongoClient(mongo_uri)

# Atlas
db_atlas = client['atlas']
indicators_atlas =  db_atlas['indicators']
indicators_atlas_cohorte=  db_atlas['indicators_cohorte']
dispersion =  db_atlas['dispersion']
projects = db_atlas['project']

