# Utiliser l'image Node.js officielle comme base
FROM node:18

# Créer un répertoire de travail
WORKDIR /app

# Copier les fichiers de l'application dans le conteneur
COPY . .

# Installer les dépendances
RUN npm install

# Exposer le port que le serveur utilisera
EXPOSE 8080

# Commande pour démarrer le serveur Express
CMD ["node", "server.js"]
