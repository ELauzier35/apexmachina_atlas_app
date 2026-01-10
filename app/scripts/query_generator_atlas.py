# -*- coding: utf-8 -*-
"""
Created on Fri Dec 13 09:11:13 2024

@author: Etienne
"""

from app.db import indicators_atlas, indicators_atlas_cohorte, dispersion
import math
from collections import defaultdict

def replace_nan_with_none(d):
    for key, value in d.items():
        if isinstance(value, dict):
            replace_nan_with_none(value)  # Recursively handle nested dictionaries
        elif isinstance(value, list):
            for i in range(len(value)):
                if isinstance(value[i], (float)) and math.isnan(value[i]):
                    value[i] = None  # Replace NaN in lists
        elif isinstance(value, float) and math.isnan(value):
            d[key] = None  # Replace NaN in the dictionary
    return d



def query_atlas(indicator_list):


    full_output_dict = {}
    
    for ind in indicator_list:

        ind_id = ind.split('.')[0]
        ind_year = ind.split('.')[1]
        ind_object = indicators_atlas.find_one({'id' : {'$eq': ind_id}}, {"_id": 0})

        if '-' in ind_year:
            first_year = ind_year.split('-')[0]
            second_year = ind_year.split('-')[1]
            all_dicts = []
            for year in range(int(first_year), int(second_year)+1):
                all_dicts.append(ind_object['data'][str(year)]['RLS'])
            combined_dict = defaultdict(list)
            for d in all_dicts:
                for key, value in d.items():
                    combined_dict[key].append(value)

            output_dict = dict(combined_dict)


        else:
            output_dict = ind_object['data'][str(ind_year)]['RLS']
        
        
        replace_nan_with_none(output_dict)
        full_output_dict[ind] = output_dict
    
    return full_output_dict


def query_tendencies(ind_id, rls_codes, level):

    full_output_dict = {}
    
    ind_object = indicators_atlas.find_one({'id' : {'$eq': ind_id}}, {"_id": 0})
    ind_object_data = ind_object['data']
    
    for code in rls_codes:
        time_series = []
        
        for year in range(1996, 2023):
            time_series.append(ind_object_data[str(year)][level][code]['avg'])
        
        full_output_dict[code] = time_series
    
    return full_output_dict

def query_provincial_tendency(ind_id):

    ts_array = []

    ind_object = indicators_atlas.find_one({'id': {'$eq': ind_id}},{"_id": 0})
    ind_object_data = ind_object['data']

    for year in range(1996, 2023):
        ts_array.append(
            ind_object_data[str(year)]["Province"]["avg"]
        )

    return ts_array


def query_tendencies_coh(ind_id, coh_codes):

    full_output_dict = {}
    
    ind_object = indicators_atlas_cohorte.find_one({'id' : {'$eq': ind_id}}, {"_id": 0})
    ind_object_data = ind_object['data']
    
    for code in coh_codes:
        time_series = []
        
        for year in range(1996, 2017):
            time_series.append(ind_object_data[str(year)].get(code, None))
        
        full_output_dict[code] = time_series
    
    return full_output_dict


def query_dispersion(ind_id):

    full_output_dict = {}
    
    ind_object = dispersion.find_one({'id' : {'$eq': ind_id}}, {"_id": 0})
    ind_object_data = ind_object['data']
    
    for type in ['decile', 'quartile']:
        time_series = []
        
        for year in range(1996, 2017):
            time_series.append(ind_object_data[type][str(year)])
        
        full_output_dict[type] = time_series
    
    return full_output_dict


# query_atlas(['couttotal.1996-2000'])