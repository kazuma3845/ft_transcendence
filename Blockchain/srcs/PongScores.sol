// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongScores {

    // Structure pour enregistrer un score d'un joueur dans une GameSession
    struct PlayerScore {
        address player; 
        uint256 score;   
    }

   // Mapping pour lier chaque GameSession à une liste de PlayerScore
    mapping(uint256 => PlayerScore[]) public gameSessionScores;

    // Evénement pour notifier lorsqu'une GameSession est enregistrée
    event GameSessionRecorded(uint256 gameSessionId, uint256 timestamp);

    // Fonction pour enregistrer les scores de tous les joueurs d'une GameSession
    function setGameSessionScores(uint256 _gameSessionId, address[] memory _players, uint256[] memory _scores) public {
        require(_gameSessionId != 0, "ID de GameSession invalide");
        require(_players.length == _scores.length, "Le nombre de joueurs doit correspondre au nombre de scores");

        // Ajouter les scores de tous les joueurs à la session
        for (uint256 i = 0; i < _players.length; i++) {
            gameSessionScores[_gameSessionId].push(PlayerScore({
                player: _players[i],
                score: _scores[i]
            }));
        }

        // Émettre un événement pour signaler que les scores ont été enregistrés
        emit GameSessionRecorded(_gameSessionId, block.timestamp);
    }

    // Fonction pour récupérer tous les scores d'une GameSession
    function getScoresByGameSession(uint256 _gameSessionId) public view returns (PlayerScore[] memory) {
        return gameSessionScores[_gameSessionId];
    }
}