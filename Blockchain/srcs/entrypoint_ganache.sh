#!/bin/sh

GANACHE_CMD="ganache-cli -m \"$MNEMO\" --host 0.0.0.0 --port 8545 --db /app/volumes/ganache_db"
CONTRACT_FILE="/app/volumes/contract-address.json"

kill_existing_ganache() {
    # Vérifie si quelque chose écoute déjà sur le port 8545
    if lsof -i :8545 > /dev/null; then
        echo "Un processus utilise déjà le port 8545. Tentative d'arrêt de Ganache..."
        fuser -k 8545/tcp
        echo "Ganache arrêté avec succès."
    fi
}

launch_ganache() {
    echo "Lancement de Ganache sur le port 8545 avec le mnemonic : $MNEMO"
    eval $GANACHE_CMD
}

trap 'kill_existing_ganache' EXIT

if [ -f "$CONTRACT_FILE" ]; then
    echo "Le fichier de contrat $CONTRACT_FILE existe déjà."
    echo "Lancement direct de Ganache..."
    kill_existing_ganache 
    launch_ganache
else
    echo "Le fichier de contrat $CONTRACT_FILE n'existe pas. Déploiement en cours..."
    
    eval $GANACHE_CMD &
    GANACHE_PID=$!
    echo "Ganache lancé en arrière-plan avec le PID $GANACHE_PID."
    sleep 5

    echo "Lancement du script de déploiement..."
    node /app/sources/deploy.js

    if [ $? -eq 0 ]; then
        echo "Contrat déployé avec succès. Sauvegarde de l'adresse."
    else
        echo "Erreur lors du déploiement du contrat."
        kill $GANACHE_PID
        exit 1
    fi

    echo "Arrêt de Ganache après le déploiement."
    kill $GANACHE_PID
    sleep 5

    echo "Relance de Ganache..."
    kill_existing_ganache
    launch_ganache
fi
