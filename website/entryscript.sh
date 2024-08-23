#!/bin/sh

# Appliquer les migrations
python manage.py migrate

# Démarrer le serveur
exec "$@"
