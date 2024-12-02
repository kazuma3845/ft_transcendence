from web3 import Web3
from django.http import JsonResponse
import json
import os
from datetime import date
from decouple import config

web3 = Web3(
    Web3.HTTPProvider(
        f"https://{config('IP_LOCAL')}/ganache/",
        request_kwargs={"verify": False},
    )
)

api_path = "/app/blockchain_v/output/PongScores.abi"
with open(api_path, "r") as abi_file:
    contract_abi = json.load(abi_file)

contract_address = os.environ["CONTRACT_ADRESS"]
contract = web3.eth.contract(address=contract_address, abi=contract_abi)
account = web3.eth.accounts[0]
private_key = os.environ["KEY"]
chain_id = web3.eth.chain_id


# --------------------------------------------------------- Interaction WEB3
def set_game_session_scores(game_session_id, players, scores, winner, forfeit, date):
    try:
        transaction = contract.functions.setGameSessionScores(
            game_session_id, players, scores, winner, forfeit, date
        ).build_transaction(
            {
                "from": account,
                "nonce": web3.eth.get_transaction_count(account),
                "gas": 3000000,
                "gasPrice": web3.eth.gas_price,
                "chainId": chain_id,
            }
        )
        signed_txn = web3.eth.account.sign_transaction(
            transaction, private_key=private_key
        )
        tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        return tx_receipt
    except Exception as e:
        return str(e)


def get_scores_by_game_session(game_session_id):
    try:
        usernames, scores, winner, forfeit, date = (
            contract.functions.getScoresByGameSession(game_session_id).call()
        )
        player_scores = dict(zip(usernames, scores))
        return player_scores, winner, forfeit, date
    except Exception as e:
        return str(e)


# --------------------------------------------------------- DJANGO API
def register_game_session_scores(request):
    print("Headers:", request.headers)
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            game_session_id = int(data.get("game_session_id"))
            players = data.get("players")
            scores = data.get("scores")
            winner = data.get("winner")
            forfeit = data.get("forfeit")

            print(
                f"Received data: game_session_id={game_session_id}, players={players}, scores={scores}"
            )
            today = date.today()  # Recupere la date du jour pour la db
            today = today.strftime("%Y-%m-%d")
            print("Current date is:", today)
            if not game_session_id or not players or not scores:
                return JsonResponse({"error": "Données manquantes"}, status=400)

            receipt = set_game_session_scores(
                game_session_id, players, scores, winner, forfeit, today
            )
            if isinstance(receipt, str):
                return JsonResponse({"status": "error", "message": receipt}, status=500)

            return JsonResponse(
                {"status": "success", "tx_hash": receipt.transactionHash.hex()}
            )
        except json.JSONDecodeError:
            return JsonResponse({"error": "Données JSON invalides"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)


def retrieve_game_session_scores(request):
    if request.method == "GET":
        game_session_id = request.GET.get("game_session_id")

        if not game_session_id or game_session_id.isdigit() == False:
            return JsonResponse({"error": "Invalid session ID"}, status=400)

        game_session_id = int(game_session_id)
        player_scores, winner, forfeit, date = get_scores_by_game_session(
            game_session_id
        )
        if isinstance(player_scores, str):
            return JsonResponse(
                {"status": "error", "message": player_scores}, status=500
            )

        return JsonResponse(
            {
                "game_session_id": game_session_id,
                "scores": player_scores,
                "winner": winner,
                "forfeit": forfeit,
                "date": date,
            }
        )
    return JsonResponse({"error": "Invalid request method"}, status=405)
