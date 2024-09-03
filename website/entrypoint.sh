#!/bin/sh

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic

# Démarrer le serveur
exec "$@"
