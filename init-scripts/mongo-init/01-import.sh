#!/bin/sh
set -e

echo "Bootstrapping static MongoDB collections..."

mongoimport --db atlas --collection indicators --file /bootstrap/mongo/atlas.indicators.json --drop --jsonArray
mongoimport --db atlas --collection indicators_cohorte --file /bootstrap/mongo/atlas.indicators_cohorte.json --drop --jsonArray
mongoimport --db atlas --collection dispersion --file /bootstrap/mongo/atlas.dispersion.json --drop --jsonArray
mongoimport --db atlas --collection project --file /bootstrap/mongo/atlas.project.json --drop --jsonArray

echo "Bootstrap complete."