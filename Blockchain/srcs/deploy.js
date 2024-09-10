const Web3 = require('web3').default;
const web3 = new Web3('http://127.0.0.1:8545');
require('react-native-get-random-values');
console.log("\x1b[32m%s\x1b[0m", "\nConnecté à Ganache.\n");


const fs = require('fs')
const abi = JSON.parse(fs.readFileSync('app/sources/output/PongScores.abi','utf-8'))
const bytecode = fs.readFileSync('app/sources/output/PongScores.bin','utf-8')
console.log("ABI et bytecode chargés");

const deployContract = async (deployerAccount) => {
    try {
        const contractInstance = new web3.eth.Contract(abi);
        const receipt = await contractInstance.deploy({
            data: bytecode, // Bytecode du contrat
        })
        .send({
            from: deployerAccount, 
            gas: 1500000, // Limite de gas
            gasPrice: '30000000000' // Prix du gas
        });
        console.log("\x1b[32m%s\x1b[0m", "Contrat déployé à l'adresse:", receipt.contractAddress);
    } catch (error) {
        console.error("Erreur lors du déploiement:", error);
    }
};

web3.eth.getAccounts().then(accounts => {
	const deployerAccount = accounts[0];
	console.log("Compte utilisé pour déployer le contrat:", deployerAccount);
	deployContract(deployerAccount);
});
