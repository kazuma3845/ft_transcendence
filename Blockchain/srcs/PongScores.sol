// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongScores {

    struct PlayerScore {
        address player; 
        uint256 score;   
    }

    mapping(uint256 => PlayerScore[]) public gameSessionScores;
    event GameSessionRecorded(uint256 gameSessionId, uint256 timestamp);   
    function setGameSessionScores(uint256 _gameSessionId, address[] memory _players, uint256[] memory _scores) public {
        require(_gameSessionId != 0, "ID de GameSession invalide");
        require(_players.length == _scores.length, "Le nombre de joueurs doit correspondre au nombre de scores");

        for (uint256 i = 0; i < _players.length; i++) {
            gameSessionScores[_gameSessionId].push(PlayerScore({
                player: _players[i],
                score: _scores[i]
            }));
        }
        emit GameSessionRecorded(_gameSessionId, block.timestamp);
    }
    function getScoresByGameSession(uint256 _gameSessionId) public view returns (PlayerScore[] memory) {
        return gameSessionScores[_gameSessionId];
    }
}