from flask import Flask, request, jsonify
from game_state import GameState
from prediction import predictFinalBallPosition
from fine_tuning import moderateFinalPosition
from config import *

if DEBUG: # Afficher les catégories de debug activées.
    log("Debug mode is enabled.", "warning")
    for category, active in DEBUG_CATEGORIES.items():
        status = "active" if active else "inactive"
        log(f"Debug category '{category}': {status}", "info")
else:
    log("Debug mode is disabled.","warning")
        
app = Flask(__name__)

# state_data = {
#     "ball_position": [0, 0],
#     "ball_speed": 20,
#     "ball_angle": 90,
#     "field_height": 100,
#     "field_length": 200,
#     "paddle_position": 0,
#     "paddle_size": 10,
#     "paddle_move_speed": 5,
#     "side": "left",
#     "score": [10, 0],
#     "bot_lvl": 0.3,
# }

@app.route('/api/receive-data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        state = GameState()
        state.updateData(data)
        final_position = predictFinalBallPosition(state)
        adjusted_position = moderateFinalPosition(state, final_position)
        return jsonify({
            "status": "success",
            "message": "Data received",
            "position": adjusted_position
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
