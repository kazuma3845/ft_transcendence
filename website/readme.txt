# Crée un environnement virtuel Python dans le dossier .env
python3 -m venv .env

# Active l'environnement virtuel que nous venons de créer
source .env/bin/activate

# Désactive l'environnement virtuel Python en cours
deactivate

# Vérifie le chemin de l'interpréteur Python actuellement actif (cela permet de s'assurer que l'environnement virtuel est bien activé)
which python

# Met à jour le gestionnaire de paquets pip vers la dernière version
pip install --upgrade pip

# Installe le framework Django dans l'environnement virtuel
pip install django

# Exporte la liste des dépendances Python installées dans l'environnement virtuel vers un fichier requirements.txt
pip freeze > requirements.txt

# Installe les dépendances listées dans le fichier requirements.txt (pour des futurs cas de builds)
pip install -r requirements.txt

# Crée un nouveau projet Django nommé "transendence" en utilisant l'outil django-admin
django-admin startproject transendence

# Applique les migrations de la base de données pour synchroniser le schéma avec les modèles Django
python manage.py migrate

# Lance le serveur de développement Django pour visualiser le projet localement
python manage.py runserver

# Crée une nouvelle application Django nommée "leaderboards" au sein du projet
python3 manage.py startapp leaderboards

# Crée des fichiers de migration pour les changements apportés aux modèles de l'application "users"
python3 manage.py makemigrations users

# Collecte tous les fichiers statiques des applications Django dans un seul répertoire, généralement pour la mise en production
python3 manage.py collectstatic
