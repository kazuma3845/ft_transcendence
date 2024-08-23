# Utiliser une image Node.js comme base
FROM node:18

# Définir le répertoire de travail
WORKDIR /Users/kazuma3845/Desktop/transcendence/threeJS

# Copier les fichiers de l'application dans le conteneur
COPY . .

# Installer les dépendances (si vous avez un fichier package.json)
RUN npm install

# Installer un serveur simple pour servir des fichiers statiques (comme http-server)
RUN npm install -g http-server

# Exposer le port 8080
EXPOSE 8080

# Lancer le serveur
CMD ["http-server", ".", "-p", "8080"]
