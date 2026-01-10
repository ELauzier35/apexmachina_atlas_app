/**
 * global.js
 * -------------------------
 * Global variable and constants
 * 
 *
**/

export const STROKE_COLOR = [50, 50, 50, 0.8];
export const STROKE_WIDTH = 0.3;
export const BASE_OPACITY = 0.6;
export const DIM_OPACITY  = 0.2;
export const THICK_WIDTH  = 3;
export const RLS_PATH = 'https://localhost:5050/static/data/atlas/RLS_rmv_nd_join.geojson';
export const RTS_PATH = 'https://localhost:5050/static/data/atlas/RTS_join.geojson';
export const RSS_PATH = 'https://localhost:5050/static/data/atlas/RSS.geojson';
export const MAIN_URL = 'https://localhost:5050/'
export const CATEGORY_DICT = {
    "Indicateurs de coûts et de performance": ["performance", "Performance"],
    "Caractéristiques de la patientèle": ["patientele", "Patientèle"],
    "Indicateurs d'accès aux services de santé": ["access", "Accès aux services de santé"],
    "Indicateurs socio-économiques": ["socio", "Socio-économique"],
    "Indicateurs géospatiaux": ["geospatial", "Géospatiale"]
}
export const SOURCE_DICT = {
    "RAMQ/Med-Echo": ["ramq"],
    "Données Québec": ["dq"],
    "Statistiques Canada": ["sc"],
    "CANUE": ["canue"],
    "Environnement Canada": ["ec"],
    "Recensement" : ["census"]
}
export const UNIT_DICT = {
    'Pourcentage': '%',
    '$ CAN moyen': '$',
    'Nombre moyen': 'None',
    'Nombre': 'None',
    NaN: 'None',
    'Jours moyens': 'j.',
    'Taux': 'None',
    "Indice moyen (pas d'unité)": 'None',
    'Années': 'an.',
    'Ans': 'ans',
    'km': 'km',
    '$': '$',
    'Personnes' : 'pers.',
    'Degrés Celsius': '°C',
    'Unités de NIRRU': 'Unités de NIRRU'
}
export const COH_CODE_TO_NAME_DICT = {
    '0': 'Ensemble',
    '1': '1897-1901',
    '2': '1902-1906',
    '3': '1907-1911',
    '4': '1912-1916',
    '5': '1917-1921',
    '6': '1922-1926',
    '7': '1927-1931',
    '8': '1932-1936',
    '9': '1937-1941',
    '10': '1942-1946',
    '11': '1947-1951',
    '12': '1952-1956',
    '13': '1957-1961',
    '14': '1962-1966',
    '15': '1967-1971',
    '16': '1972-1976',
    '17': '1977-1981',
    '18': '1982-1986',
    '19': '1987-1991',
    '20': '1992-1996',
    '21': '1997-2001',
    '22': '2002-2006',
    '23': '2007-2011'
};
export const DISPERSION_INDICATORS = [
    "tauxmort",
    "taux_hosp",
    "readm30jour",
    "nbacte_visite",
    "visiteomni",
    "couttotal",
    "montant_pharma",
    "charlson_annuel",
    "age",
    "sexe",
    "revenu_moyen",
    "scolarite_moy",
    "pourc_immigrants",
    "pourc_identite_autochtone",
    "pourc_minorite_vis",
    "vegetation_basse",
    "urbain",
    "surface_nue",
    "forestier",
    "eau",
    "agricole",
    "dist_clsc",
    "dist_chsld",
    "dist_hopital",
    "densite_route",
    "tempmax",
    "tempmin",
    "temperature",
    "SO2",
    "PM25",
    "O3",
    "NO2",
    "NO",
    "CO"
]


export const IRS_DEFAULTS = {
    skin: 'material',
    min: 0,
    max: 100,
    step: 1,
    postfix: '',
    max_postfix: '',
    extra_classes: 'flex-fill',
    prettify_enabled: false   
};