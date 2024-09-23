const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const mnemonic = process.env.MNEMO;
const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
const wallet = new ethers.Wallet(hdNode.derivePath("m/44'/60'/0'/0/0").privateKey, provider);

// Chargement de l'ABI et du bytecode
const abi = JSON.parse(fs.readFileSync('app/sources/output/PongScores.abi', 'utf-8'));
const bytecode = fs.readFileSync('app/sources/output/PongScores.bin', 'utf-8');

const deployContract = async () => {
    try {
        console.log("Compte utilisé pour déployer le contrat:", wallet.address);

        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const contract = await factory.deploy({
            gasLimit: 6000000
        });

        await contract.deployTransaction.wait();
        console.log("Contrat déployé à l'adresse:", contract.address);
        const contractData = {
            address: contract.address,
            transactionHash: contract.deployTransaction.hash
        };
        fs.writeFileSync('./app/volumes/contract-address.json', JSON.stringify(contractData, null, 2));

        console.log("Contract address saved to contract-address.json");
    } catch (error) {
        console.error("Erreur lors du déploiement:", error);
    }
};

deployContract();

