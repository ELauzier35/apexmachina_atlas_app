import os
import urllib.parse
import requests
from pathlib import Path
from dotenv import set_key
from flask import Blueprint, redirect, request, url_for, render_template, session, flash
from app.auth_utils import admin_required

linkedin_bp = Blueprint("linkedin", __name__, url_prefix="/admin/linkedin")

CLIENT_ID = os.environ.get("LINKEDIN_CLIENT_ID")
CLIENT_SECRET = os.environ.get("LINKEDIN_CLIENT_SECRET")
REDIRECT_URI = os.environ.get("LINKEDIN_REDIRECT_URI")

# Scopes: adjust as needed (space-separated, must match app config)
SCOPES = "openid profile w_member_social"


@linkedin_bp.route("/connect")
@admin_required
def connect():
    """
    Admin page with a 'Connect with LinkedIn' button.
    """
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPES,
        "state": "randomstring123",  # TODO: replace with CSRF-safe value
    }
    auth_url = "https://www.linkedin.com/oauth/v2/authorization?" + urllib.parse.urlencode(params)

    return render_template("linkedin_connect.html", auth_url=auth_url)


@linkedin_bp.route("/callback")
@admin_required
def callback():
    """
    LinkedIn redirects here with ?code=...&state=...
    We exchange the code for an access token.
    """
    error = request.args.get("error")
    if error:
        return f"Error from LinkedIn: {error}", 400

    code = request.args.get("code")
    state = request.args.get("state")

    if not code:
        return "Missing 'code' in callback", 400

    # (Optional) Verify state matches what you sent for CSRF protection

    # Exchange code -> access_token
    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    resp = requests.post(token_url, data=data, timeout=10)
    if not resp.ok:
        return f"Error exchanging code: {resp.status_code} {resp.text}", 400

    token_data = resp.json()
    access_token = token_data.get("access_token")
    expires_in = token_data.get("expires_in")

    # For dev: just show the token and tell you to put it in .env
    # In production: store it securely in DB or a secret manager.
    print("LINKEDIN ACCESS TOKEN:", access_token)
    print("EXPIRES IN (seconds):", expires_in)

    try:
        # __file__ = app/linkedin_oauth.py
        # parents[1] = dossier racine du projet (là où est ton run.py et ton .env)
        env_path = Path(__file__).resolve().parents[1] / ".env"
        set_key(str(env_path), "LINKEDIN_ACCESS_TOKEN", access_token)
        print(f".env mis à jour à {env_path}")
    except Exception as e:
        print("Erreur lors de la mise à jour du .env :", e)

    # 🔹 2) Mettre à jour aussi os.environ pour ce process
    os.environ["LINKEDIN_ACCESS_TOKEN"] = access_token

    return render_template(
        "linkedin_callback.html",
        access_token=access_token,
        expires_in=expires_in,
        expires_days=int(expires_in) // 86400
    )