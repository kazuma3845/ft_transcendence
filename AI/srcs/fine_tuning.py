import random
from config import *
import time

#? Modifie la position finale de la balle en fonction de plusieurs facteurs du jeu tels que la difficulté, l'écart de score, la vitesse de la balle et les rebonds.

def moderateFinalPosition(state, final_position):
    adjusted_difficulty = max(0.1, state.bot_difficulty)
    score_pond = 1 + 10 * ((state.score[1] - state.score[0]) / adjusted_difficulty)
    speed_pond = score_pond * (state.ball_speed / state.field_length)
    bounces_pond = speed_pond * (max(state.bounces, 1) * random.uniform(-1, 1))
    ponderated_position = final_position[1] + bounces_pond
    
    max_latency = max(0.1, 0.9 - 0.8 * adjusted_difficulty)  # Réduit le max de latence à mesure que la difficulté augmente
    min_latency = max(0.1, max_latency - 0.1)  # Garde une petite fenêtre de temps
    latency = random.uniform(min_latency, max_latency)
    time.sleep(latency)
    if DEBUG: # Si le debug est set a True on print tout d'un coup
        log("\n------- DEBUG PONDERATIONS -------", "title",category="PONDERATORS")
        log(f"Niveau de difficulté ajusté: {adjusted_difficulty}",category="PONDERATORS")
        log(f"Pondération basée sur le score: {score_pond}",category="PONDERATORS")
        log(f"Pondération basée sur la vitesse: {speed_pond}",category="PONDERATORS")
        log(f"Pondération basée sur le nbre de rebonds: {bounces_pond}",category="PONDERATORS")
        log(f"Y recalculé: {ponderated_position}",category="PONDERATORS")
        log(f"Écart entre la position originale et pondérée: {final_position[1] - ponderated_position}",category="PONDERATORS")
        log("----------------------------------\n", "title",category="PONDERATORS")
    return ponderated_position  # Retourne la position finale modifiée.