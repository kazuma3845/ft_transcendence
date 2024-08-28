const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Servir les fichiers statiques de votre répertoire de projet
app.use(express.static(path.join(__dirname, '/')));

// Démarrer le serveur sur le port 8080
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
