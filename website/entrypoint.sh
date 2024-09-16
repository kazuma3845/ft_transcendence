#!/bin/sh

cd /app/srcs

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

# Démarrer le serveur
exec "$@"
