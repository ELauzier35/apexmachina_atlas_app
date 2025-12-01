# FLASK IMPORTS
from flask import Flask, redirect, session, render_template, render_template_string, flash, get_flashed_messages, send_from_directory, jsonify, abort, redirect, request, url_for, make_response
from app import app
from app.db import indicators_atlas, indicators_atlas_cohorte
from app.scripts.query_generator_atlas import *
from datetime import timedelta
from app.linkedin_oauth import linkedin_bp
import os
from app.auth_utils import ADMIN_USERNAME, ADMIN_PASSWORD, admin_required
from app.socials import post_to_linkedin

app.register_blueprint(linkedin_bp)


app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=5)
app.config['SESSION_COOKIE_SECURE'] = True  # If using HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_REFRESH_EACH_REQUEST'] = True

@app.route("/<querystring>/", methods=['GET', 'POST'])
@app.route("/", methods=['GET', 'POST'])
def atlas(querystring='/inds=+&base=satLayer'):
    atlas_indicators = list(indicators_atlas.find({}, {"_id": 0, "data" : 0}))
    atlas_indicators_cohorte = list(indicators_atlas_cohorte.find({}, {"_id": 0, "data" : 0}))
    return render_template('index.html', 
                           title='ApexMachina — Atlas', 
                           atlas_indicators=atlas_indicators,
                           atlas_indicators_cohorte=atlas_indicators_cohorte)


@app.route('/tendency_query', methods=['POST'])
def tendency_query():
    params = request.get_json()
    indicator = params[0]
    rls_codes = params[1]
    output = query_tendencies(indicator, rls_codes)
    return jsonify(output)

@app.route('/cohort_query', methods=['POST'])
def cohort_query():
    params = request.get_json()
    indicator = params[0]
    coh_codes = params[1]
    output = query_tendencies_coh(indicator, coh_codes)
    return jsonify(output)


@app.route('/indicator_query', methods=['POST'])
def indicator_query():
    params = request.get_json()
    indicator = params[0]
    output = query_atlas(indicator)
    return jsonify(output)




@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    error = None

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["is_admin"] = True
            next_url = request.args.get("next") or url_for("index")
            return redirect(next_url)
        else:
            error = "Invalid credentials"

    return render_template("admin_login.html", error=error)

@app.route("/admin/logout")
def admin_logout():
    # Remove admin flag from session
    session.pop("is_admin", None)
    
    # Optionally redirect to home or login
    return redirect(url_for("admin_login"))


@app.route("/admin/linkedin/test-post")
@admin_required
def linkedin_test_post():
    person_urn = os.environ.get("LINKEDIN_PERSON_URN")
    if not person_urn:
        return "LINKEDIN_PERSON_URN not set in .env", 500

    res = post_to_linkedin(person_urn, "Testing an automatic post via python app")
    return f"Posted! Response: {res}"



