# GeoSanté — Docker

## Prérequis
- Docker + Docker Compose

## Secrets (local seulement)
Créer les fichiers suivants :

- `secrets/mongo/mongo_root_username.txt`
- `secrets/mongo/mongo_root_password.txt`
- `secrets/mongo/mongo_app_username.txt`
- `secrets/mongo/mongo_app_password.txt`

> Le dossier `secrets/` doit être dans `.gitignore`.

## Démarrer l’application
```bash
docker compose up --build