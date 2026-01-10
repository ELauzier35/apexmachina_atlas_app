# FLASK IMPORTS
from flask import redirect, session, render_template, jsonify, redirect, request, url_for
from app import app
from app.db import indicators_atlas, indicators_atlas_cohorte, projects
from app.scripts.query_generator_atlas import *
from datetime import timedelta
from app.linkedin_oauth import linkedin_bp
from app.auth_utils import ADMIN_USERNAME, ADMIN_PASSWORD, admin_required
# from flask_mail import Mail, Message
import os

app.register_blueprint(linkedin_bp)


app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=5)
app.config['SESSION_COOKIE_SECURE'] = True  # If using HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_REFRESH_EACH_REQUEST'] = True


# ============= GMAIL SMTP SETUP =======================
# mailSettings = {
#     'MAIL_SERVER': os.environ.get("SMTP_HOST"),
#     'MAIL_PORT': os.environ.get("SMTP_PORT"),
#     'MAIL_USE_TLS': True,
#     'MAIL_USE_SSL': False,
#     'MAIL_USERNAME': os.environ.get("SMTP_USER"),
#     'MAIL_PASSWORD': os.environ.get("SMTP_PASSWORD"),
# }
# app.config.update(mailSettings)
# mail = Mail(app)


@app.route("/", methods=["GET", "POST"])
@app.route("/<project_id>/", methods=["GET", "POST"])
def atlas(project_id=None):
    # Keep your "+" behavior (note: '+' in URL often becomes space)
    inds = request.args.get("inds", " ").replace(" ", "+")
    base = request.args.get("base", "satLayer")

    project = None
    if project_id is not None:
        project = projects.find_one({"id": project_id}, {"_id": 0})

        if project is None:
            return redirect(url_for("atlas", inds=inds, base=base))
        else:
            inds = "+".join(project['indicators-on-map']) + "+"

    atlas_indicators = list(indicators_atlas.find({}, {"_id": 0, "data": 0}))
    atlas_indicators_cohorte = list(indicators_atlas_cohorte.find({}, {"_id": 0, "data": 0}))
    all_projects = list(projects.find({}, {"_id": 0}))

    return render_template(
        "index.html",
        title="ApexMachina — Atlas",
        project=project,
        init_inds=inds,
        init_base=base,
        atlas_indicators=atlas_indicators,
        atlas_indicators_cohorte=atlas_indicators_cohorte,
        all_projects=all_projects
    )


@app.route('/tendency_query', methods=['POST'])
def tendency_query():
    params = request.get_json()
    indicator = params[0]
    rls_codes = params[1]
    level = params[2]
    output = query_tendencies(indicator, rls_codes, level)
    return jsonify(output)

@app.route('/tendency_query_provincial', methods=['POST'])
def tendency_query_provincial():
    params = request.get_json()
    indicator = params[0]
    output = query_provincial_tendency(indicator)
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

@app.route('/dispersion_query', methods=['POST'])
def dispersion_query():
    params = request.get_json()
    indicator = params[0]
    output = query_dispersion(indicator)
    return jsonify(output)




@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    error = None

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session["is_admin"] = True
            next_url = request.args.get("next") or url_for("new_project")
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


# @app.route("/admin/linkedin/test-post")
# @admin_required
# def linkedin_test_post():
#     person_urn = os.environ.get("LINKEDIN_PERSON_URN")
#     if not person_urn:
#         return "LINKEDIN_PERSON_URN not set in .env", 500

#     res = post_to_linkedin(person_urn, "Testing an automatic post via python app")
#     return f"Posted! Response: {res}"


@app.route("/admin/new_project")
@admin_required
def new_project():
    atlas_indicators = list(indicators_atlas.find({}, {"_id": 0, "data": 0, "ranking": 0, "unit": 0, "source": 0}))
    return render_template("new_project.html",
                           atlas_indicators=atlas_indicators)

@app.route("/admin/new_project_analysis")
def new_project_analysis():
    atlas_indicators = list(indicators_atlas.find({}, {"_id": 0, "data": 0, "ranking": 0, "unit": 0, "source": 0}))
    return render_template("new_project_analysis.html",
                           atlas_indicators=atlas_indicators)


@app.route("/admin/new_project/create", methods=["POST"])
@admin_required
def create_project():
    try:
        project_data = request.get_json()

        if not project_data:
            return jsonify({"success": False, "message": "Aucune donnée reçue"}), 400

        # Insert into MongoDB
        result = projects.insert_one(project_data)

        return jsonify({
            "success": True,
            "message": "Projet créé avec succès",
            "id": str(result.inserted_id)
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Erreur lors de la création du projet: {str(e)}"
        }), 500