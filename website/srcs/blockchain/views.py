from web3 import Web3
from django.http import JsonResponse
import json

web3 = Web3(Web3.HTTPProvider("http://ganache:8545")) #FIXME: A ADAPTER

api_path = './app/blockchain_v/output/PongScores.abi' 
with open(api_path, 'r') as abi_file:
    contract_json = json.load(abi_file)
    contract_abi = contract_json['abi']

contract_address = '0x346D8BF0ABC36FEeeC341Ed99Df5BC895e1bb01A'  #FIXME: A ADAPTER
contract = web3.eth.contract(address=contract_address, abi=contract_abi)
account = web3.eth.accounts[0]
print(account);
private_key = '0x03baa2a168dceaf3a32f5f0397e7c3d4ebfd04ffdc3ab2bb73a1707c2faa727f' #!FIXME a enlever

# --------------------------------------------------------- Interaction WEB3

def set_game_session_scores(game_session_id, players, scores):
    try:
            # Construire la transaction 
        transaction = contract.functions.setGameSessionScores(game_session_id, players, scores).buildTransaction({
        'from': account,
        'nonce': web3.eth.getTransactionCount(account), # Sorte d'ID de la transaction pour ce compte (compteur)
        'gas': 3000000,  #Prix max que je suis pret a payer pour la transaction
        'gasPrice': web3.eth.gasPrice  # calcule le prix actuel du gaz (selon la congestion du réseau)
        })
            # Signe la transaction avec la clé privée
        signed_txn = web3.eth.account.sign_transaction(transaction, private_key=private_key)
            # Envoyer la transaction
        tx_hash = web3.eth.sendRawTransaction(signed_txn.rawTransaction)
            # Attendre la confirmation de la transaction
        tx_receipt = web3.eth.waitForTransactionReceipt(tx_hash)
            # Afficher le hash de la transaction pour suivi
        print(f"Transaction hash: {web3.toHex(tx_hash)}")  
        return tx_receipt
    except Exception as e:
        return str(e)
    
def get_scores_by_game_session(game_session_id):
    try:
        usernames, scores = contract.functions.getScoresByGameSession(game_session_id).call()
        player_scores = dict(zip(usernames, scores))
        return player_scores
    except Exception as e:
        return str(e)

# --------------------------------------------------------- DJANGO API 

def register_game_session_scores(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            game_session_id = data.get("game_session_id")
            players = data.get("players")  # Tableau des adresses des joueurs
            scores = data.get("scores")    # Tableau des scores correspondants

            if not game_session_id or not players or not scores:
                return JsonResponse({"error": "Données manquantes"}, status=400)
            
            receipt = set_game_session_scores(game_session_id, players, scores)
            if isinstance(receipt, str):
                return JsonResponse({"status": "error", "message": receipt}, status=500)

            return JsonResponse({"status": "success", "tx_hash": receipt.transactionHash.hex()})
        except json.JSONDecodeError:
            return JsonResponse({"error": "Données JSON invalides"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


def retrieve_game_session_scores(request):
    if request.method == 'GET':
        game_session_id = request.GET.get("game_session_id")
        
        if not game_session_id:
            return JsonResponse({"error": "ID de session manquant"}, status=400)
        player_scores = get_scores_by_game_session(game_session_id)
        if isinstance(player_scores, str):
            return JsonResponse({"status": "error", "message": player_scores}, status=500)

        # Convertir les résultats en un format JSON pour l'API
        scores_data = [{"player": score['player'], "score": score['score']} for score in player_scores]

        return JsonResponse({"game_session_id": game_session_id, "scores": scores_data})
    return JsonResponse({"error": "Invalid request method"}, status=405)
