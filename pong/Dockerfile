# Utiliser une image Node.js comme base
FROM node:18

# Définir le répertoire de travail
WORKDIR /threeJS

# Copier les fichiers de configuration dans le conteneur
COPY /threeJS/package.json /threeJS/package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers de l'application dans le conteneur
COPY . .

# Installer un serveur simple pour servir des fichiers statiques (comme http-server)
RUN npm install -g http-server

# Exposer le port 8080
EXPOSE 8080

# Lancer le serveur
CMD ["http-server", ".", "-p", "8080"]
