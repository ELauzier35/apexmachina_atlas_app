import pymongo

client = pymongo.MongoClient('localhost', 27017)

# Atlas
db_atlas = client['atlas']
indicators_atlas =  db_atlas['indicators']
indicators_atlas_cohorte=  db_atlas['indicators_cohorte']

