// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongScores {
    struct GameSession {
        string[] usernames;
        uint256[] scores; 
        string winner;
        bool forfeit; 
        string date;  
    }
    mapping(uint256 => GameSession) private gameSessions;  // Mapping des game sessions par ID
    event GameSessionRecorded(uint256 gameSessionId, uint256 timestamp); 
    
    function setGameSessionScores(uint256 _gameSessionId, string[] memory _usernames, uint256[] memory _scores, string memory _winner, bool _forfeit, string memory _date) public {
        require(_gameSessionId != 0, "ID de GameSession invalide");
        require(_usernames.length == _scores.length, "Le nombre de joueurs doit correspondre au nombre de scores");

        gameSessions[_gameSessionId] = GameSession({
            usernames: _usernames,
            scores: _scores,
            winner: _winner,
            forfeit: _forfeit,
            date: _date
        });

        emit GameSessionRecorded(_gameSessionId, block.timestamp);  
    }

    function getScoresByGameSession(uint256 _gameSessionId) public view returns (string[] memory, uint256[] memory, string memory, bool, string memory) {
        return (gameSessions[_gameSessionId].usernames, gameSessions[_gameSessionId].scores, gameSessions[_gameSessionId].winner, gameSessions[_gameSessionId].forfeit,gameSessions[_gameSessionId].date);
    }
}
