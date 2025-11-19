from flask import Flask
import os  , uuid

# app definition
app = Flask(__name__)
app.secret_key = uuid.uuid4().hex
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from app import routes


