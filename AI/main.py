# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt

DEBUG = True

from game_state import GameState
from prediction import predictFinalBallPosition
from fine_tuning import moderateFinalPosition
from config import *

if DEBUG: # Afficher les catégories de debug activées.
    log("Debug mode is enabled.", "warning")
    for category, active in DEBUG_CATEGORIES.items():
        status = "active" if active else "inactive"
        log(f"Debug category '{category}': {status}", "info")
    
state_data = {
    "ball_position": [0, 0],
    "ball_speed": 5,
    "ball_angle": 170,
    "field_height": 100,
    "field_length": 200,
    "paddle_position": 0,
    "paddle_size": 10,
    "paddle_move_speed": 5,
    "side": "left",
    "score": [10, 0],
    "bot_lvl" : 0.5,
}

state = GameState()
state.updateData(state_data)

final_position = predictFinalBallPosition(state)
moderateFinalPosition(state, final_position)

# def receiveData(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             state.updateData(data)
#             return JsonResponse({"status": "success", "message": "Data received"}, status=200)
#         except json.JSONDecodeError:
#             return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
#     else:
#         return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)