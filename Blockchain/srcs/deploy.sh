docker run -v $(pwd):/sources ethereum/solc:stable --bin --abi --optimize -o /sources/output /sources/PongScores.sol
