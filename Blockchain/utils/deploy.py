from web3 import Web3
from solcx import compile_standard, install_solc
import json


install_solc('0.8.0')  
# Connexion à Ganache
web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
web3.eth.defaultAccount = web3.eth.accounts[0]  # Utiliser le premier compte de Ganache

# Charger le fichier PongScores.sol
with open('/app/contracts/PongScores.sol', 'r') as file:
    contract_source_code = file.read()

# Compiler le contrat Solidity
compiled_sol = compile_standard({
    "language": "Solidity",
    "sources": {"PongScores.sol": {"content": contract_source_code}},
    "settings": {
        "outputSelection": {
            "*": {
                "*": ["abi", "evm.bytecode"]
            }
        }
    }
})

# Sauvegarder la sortie compilée dans un fichier JSON (facultatif)
with open("/app/contracts/compiled_PongScores.json", "w") as file:
    json.dump(compiled_sol, file)

abi = compiled_sol['contracts']['PongScores.sol']['PongScores']['abi']
bytecode = compiled_sol['contracts']['PongScores.sol']['PongScores']['evm']['bytecode']['object']

# Déployer le contrat
PongScores = web3.eth.contract(abi=abi, bytecode=bytecode)
tx_hash = PongScores.constructor().transact()
tx_receipt = web3.eth.waitForTransactionReceipt(tx_hash)

# Adresse du contrat déployé
contract_address = tx_receipt.contractAddress

print(f'Contrat déployé à l\'adresse: {contract_address}')
