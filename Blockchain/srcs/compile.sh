docker run -v $(pwd):/sources ethereum/solc:0.8.0 --bin --abi --optimize -o /sources/output /sources/PongScores.sol