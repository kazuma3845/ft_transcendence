#!/bin/sh

echo "Script entryscript.sh démarré"

# Appliquer les migrations
python manage.py migrate

echo "Migrations terminées"

# Démarrer le serveur
exec "$@"
