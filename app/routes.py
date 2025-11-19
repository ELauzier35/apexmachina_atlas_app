# FLASK IMPORTS
from flask import Flask, redirect, session, render_template, flash, get_flashed_messages, send_from_directory, jsonify, abort, redirect, request, url_for, make_response
from app import app
from app.db import indicators_atlas, indicators_atlas_cohorte
from app.scripts.query_generator_atlas import *
from datetime import timedelta


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
    # if request.method == 'POST':
    #     request_data = request.get_json()
    #     if request_data and request_data.get('name') == 'main-query':
    #         indicator = json.loads(request_data.get('indicator'))
    #         output = query_atlas(indicator)
    #         print(output)
    #         return {
    #             'output': output
    #         }
    #     elif request_data and request_data.get('name') == 'tendency-query':
    #         indicator = json.loads(request_data.get('indicator'))
    #         rls_codes = json.loads(request_data.get('rls_codes'))
    #         output = query_tendencies(indicator, rls_codes)
    #         return {
    #             'output': output
    #         }
    #     elif request_data and request_data.get('name') == 'coh-tendency-query':
    #         indicator = json.loads(request_data.get('indicator'))
    #         coh_codes = json.loads(request_data.get('coh_codes'))
    #         output = query_tendencies_coh(indicator, coh_codes)
    #         return {
    #             'output': output
    #         }
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



