from web3 import Web3
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Connexion à Ganache et initialisation du contrat
web3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545")) #FIXME: A ADAPTER
web3.eth.defaultAccount = web3.eth.accounts[0]  # Utilise le premier compte

contract_abi = [ ... ]  #FIXME: A ADAPTER
contract_address = '0x1234567890abcdef1234567890abcdef12345678'  #FIXME: A ADAPTER
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# --------------------------------------------------------- Interaction WEB3


def set_game_session_scores(game_session_id, players, scores):
    try:
        tx_hash = contract.functions.setGameSessionScores(game_session_id, players, scores).transact({'from': web3.eth.defaultAccount})
        receipt = web3.eth.waitForTransactionReceipt(tx_hash)
        return receipt
    except Exception as e:
        return str(e)
    
def get_scores_by_game_session(game_session_id):
    try:
        player_scores = contract.functions.getScoresByGameSession(game_session_id).call()
        return player_scores
    except Exception as e:
        return str(e)

# --------------------------------------------------------- DJANGO API 

def register_game_session_scores(request):
    if request.method == 'POST':
        try:
            # Charger les données JSON du corps de la requête
            data = json.loads(request.body)
            game_session_id = data.get("game_session_id")
            players = data.get("players")  # Tableau des adresses des joueurs
            scores = data.get("scores")    # Tableau des scores correspondants

            if not game_session_id or not players or not scores:
                return JsonResponse({"error": "Données manquantes"}, status=400)

            if len(players) != len(scores):
                return JsonResponse({"error": "Le nombre de joueurs doit correspondre au nombre de scores"}, status=400)

            # Appel à la blockchain pour enregistrer tous les scores
            receipt = set_game_session_scores(game_session_id, players, scores)

            # Vérifie si une erreur a été retournée
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

        # Récupérer les scores de tous les joueurs dans la GameSession
        player_scores = get_scores_by_game_session(game_session_id)

        # Vérifie si une erreur a été retournée
        if isinstance(player_scores, str):
            return JsonResponse({"status": "error", "message": player_scores}, status=500)

        # Convertir les résultats en un format JSON pour l'API
        scores_data = [{"player": score['player'], "score": score['score']} for score in player_scores]

        return JsonResponse({"game_session_id": game_session_id, "scores": scores_data})
    return JsonResponse({"error": "Invalid request method"}, status=405)
