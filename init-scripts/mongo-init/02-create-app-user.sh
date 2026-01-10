#!/bin/sh
set -e

APP_USER="$(cat /run/secrets/mongo_app_username)"
APP_PASS="$(cat /run/secrets/mongo_app_password)"

echo "Creating MongoDB application user..."

mongosh --quiet -u "$(cat /run/secrets/mongo_root_username)" -p "$(cat /run/secrets/mongo_root_password)" --authenticationDatabase admin <<EOF
use atlas
db.createUser({
  user: "$APP_USER",
  pwd: "$APP_PASS",
  roles: [{ role: "readWrite", db: "atlas" }]
})
EOF

echo "Application user created."