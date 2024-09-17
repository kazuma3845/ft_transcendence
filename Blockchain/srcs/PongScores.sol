// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongScores {
    struct GameSession {
        string[] usernames;
        uint256[] scores;    
    }
    mapping(uint256 => GameSession) private gameSessions;  // Mapping des game sessions par ID
    event GameSessionRecorded(uint256 gameSessionId, uint256 timestamp); 
    
    function setGameSessionScores(uint256 _gameSessionId, string[] memory _usernames, uint256[] memory _scores) public {
        require(_gameSessionId != 0, "ID de GameSession invalide");
        require(_usernames.length == _scores.length, "Le nombre de joueurs doit correspondre au nombre de scores");

        gameSessions[_gameSessionId] = GameSession({
            usernames: _usernames,
            scores: _scores
        });

        emit GameSessionRecorded(_gameSessionId, block.timestamp);  
    }

    function getGameSesSsion(uint256 _gameSessionId) public view returns (string[] memory, uint256[] memory) {
        return (gameSessions[_gameSessionId].usernames, gameSessions[_gameSessionId].scores);
    }
}
