# app/auth_utils.py
from functools import wraps
from flask import session, redirect, url_for, request
import os

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("is_admin"):
            # redirect to login with ?next=<original_path>
            return redirect(url_for("admin_login", next=request.path))
        return f(*args, **kwargs)
    return decorated_function