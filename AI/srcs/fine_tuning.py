import random
from config import *
import time

#? Modifie la position finale de la balle en fonction de plusieurs facteurs du jeu tels que la difficulté, l'écart de score, la vitesse de la balle et les rebonds.
def moderateFinalPosition(state, final_position):
    # 1. Difficulté ajustée
    adjusted_difficulty = max(0.1, state.bot_difficulty)

    # 2. Pondération du score : modérer l'impact du score
    score_pond = 1 + 3 * ((state.score[1] - state.score[0]) / (adjusted_difficulty + 0.5))

    # 3. Pondération de la vitesse : inclure la vitesse de la balle mais réduire son influence
    speed_pond = score_pond * ((state.ball_speed / state.field_length) + 0.05)

    # 4. Impact des rebonds : donner plus de poids aux rebonds mais avec une marge aléatoire modérée
    bounces_pond = speed_pond * (1 + state.bounces * 2) * random.uniform(-0.3, 0.3)

    # 5. Calcul de la position pondérée initiale
    ponderated_position = final_position[1] + bounces_pond

    # 6. Latence du bot : légère augmentation pour rendre le bot encore plus battable
    max_latency = 0.75 - 0.5 * adjusted_difficulty
    min_latency = max(0.2, max_latency - 0.2)
    latency = random.uniform(min_latency, max_latency)

    # 7. Ajustement aléatoire basé sur la difficulté, la différence de scores, et les rebonds
    base_randomness_factor = 0.3  # Base de 30% comme point de départ
    score_diff = state.score[1] - state.score[0]  # Différence de score : bot - joueur

    if score_diff > 0:
        # Plus le bot est en avance, plus il devient imprécis
        score_factor = 0.1 * score_diff  # Chaque point d'avance du bot augmente l'aléatoire
    else:
        # Si le bot est en retard ou à égalité, moins d'aléatoire
        score_factor = 0.05 * score_diff  # Réduction d'aléatoire plus modérée si en retard

    bounce_factor = 0.15 * state.bounces  # Chaque rebond ajoute à l'aléatoire

    # Le facteur aléatoire est ajusté en fonction de tous les paramètres
    randomness_factor = base_randomness_factor + score_factor + bounce_factor

    random_adjustment = ponderated_position * random.uniform(-randomness_factor, randomness_factor)

    # Calcul de la position finale ajustée
    final_adjusted_position = ponderated_position + random_adjustment

    # 8. Application de la latence
    time.sleep(latency)

    # 9. Debugging
    if DEBUG:  # Si le debug est activé, on affiche les valeurs calculées
        log("\n------- DEBUG PONDERATIONS -------", "title", category="PONDERATORS")
        log(f"Niveau de difficulté ajusté: {adjusted_difficulty}", category="PONDERATORS")
        log(f"Pondération basée sur le score: {score_pond}", category="PONDERATORS")
        log(f"Pondération basée sur la vitesse: {speed_pond}", category="PONDERATORS")
        log(f"Pondération basée sur le nombre de rebonds: {bounces_pond}", category="PONDERATORS")
        log(f"Position pondérée initiale: {ponderated_position}", category="PONDERATORS")
        log(f"Ajustement aléatoire: {random_adjustment}", category="PONDERATORS")
        log(f"Position finale ajustée: {final_adjusted_position}", category="PONDERATORS")
        log(f"Latence appliquée: {latency} secondes", category="PONDERATORS")
        log("----------------------------------\n", "title", category="PONDERATORS")
    
    return final_adjusted_position  # Retourne la position finale modifiée