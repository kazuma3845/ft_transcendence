import math
from config import *

def getNextHorizontalHit(state):
    x_0, y_0 = state.ball_position
    if 0 <= state.ball_angle < 90:
        distance_y = (state.field_height/2) - y_0
        new_y = state.field_height/2
    elif 90 <= state.ball_angle < 180:
        distance_y = (-state.field_height/2) - y_0
        new_y = -state.field_height/2
    
    rad_angle = math.radians(state.ball_angle)
    distance_x = distance_y * math.tan(rad_angle)
    new_x = distance_x + x_0

    if DEBUG:
        log("\n------- DEBUG HORIZONTAL HIT -------", "title", category="HIT")
        log(f"Position actuelle de la balle: ({x_0}, {y_0})", category="HIT")
        log(f"Distance en Y calculée: {distance_y}", category="HIT")
        log(f"Nouvelle position en Y: {new_y}", category="HIT")
        log(f"Nouvelle position en X: {new_x}", category="HIT")
        log(f"Angle en radians: {rad_angle}", category="HIT")
        log(f"Distance en X calculée: {distance_x}", category="HIT")
        log("-------------------------------------\n", "title", category="HIT")
    
    return new_x, new_y
    
def getNextLateralHit(state):
    x_0, y_0 = state.ball_position
    
    distance_x = (state.field_length / 2) - x_0
    new_x = state.field_length / 2
    new_angle = 90 - state.ball_angle if state.ball_angle < 90 else state.ball_angle - 90
    rad_new_angle = math.radians(new_angle)
    distance_y = distance_x * math.tan(rad_new_angle)
    if 0 <= state.ball_angle < 90:
        new_y = y_0 + distance_y
    else: 
        new_y = y_0 - distance_y

    if DEBUG:
        log("\n------- DEBUG LATERAL HIT -------", "title", category="HIT")
        log(f"Position actuelle de la balle: ({x_0}, {y_0})", category="HIT")
        log(f"Distance en X calculée: {distance_x}", category="HIT")
        log(f"Nouvelle position en X: {new_x}", category="HIT")
        log(f"Nouvel angle calculé: {new_angle}", category="HIT")
        log(f"Nouvel angle en radians: {rad_new_angle}", category="HIT")
        log(f"Distance en Y calculée: {distance_y}", category="HIT")
        log(f"Nouvelle position en Y: {new_y}", category="HIT")
        log("----------------------------------\n", "title", category="HIT")
    
    return new_x, new_y
    
def predictFinalBallPosition(state):
    if state.ball_angle > 180:
        log("La balle se dirige vers l'autre côté du terrain. Aucun calcul supplémentaire n'est effectué.", "info", category="FINAL_POS")
        return -1
    else:
        while True:
            nextLateralHit = getNextLateralHit(state)
            if nextLateralHit[1] > state.field_height/2 or nextLateralHit[1] < -state.field_height / 2:
                nextHorizontalHit = getNextHorizontalHit(state)
                state.updateBallPositionAndAngle(nextHorizontalHit)
                state.bounces += 1

                if DEBUG:
                    log(f"\n------- DEBUG REBOUND {state.bounces} -------", "title", category="REBOUND")
                    log(f"Rebond détecté. Nouvelle position de la balle: {state.ball_position}", category="REBOUND")
                    log(f"Nouvel angle de la balle: {state.ball_angle}", category="REBOUND")
                    log(f"Nombre de rebonds: {state.bounces}", category="REBOUND")
                    log("--------------------------------\n", "title", category="REBOUND")
            else:
                log(f"Position finale de la balle après calcul : {nextLateralHit}", "info", category="FINAL_POS")
                return nextLateralHit


#? Fonction pour corriger une position en fonction des limites du champ et de la taille de la raquette
def correctPosition(state, position):
    
    if DEBUG:
        log(f"\n------- DEBUG CORRECTION -------", "title\n", category="CORRECTION") # Journalise le début de la correction en mode débogage.
        log(f"Position initiale: {position}", category="CORRECTION") # Journalise la position initiale.

    # Correction si la position dépasse les limites du champ
    if abs(position) > (state.field_height / 2): 
        original_position = position # Sauvegarde de la position originale pour la journalisation.
        position = (state.field_height / 2) if position > 0 else -(state.field_height / 2) # Correction de la position pour qu'elle soit dans les limites du champ.
        if DEBUG:
            log(f"Position hors limites ajustée de {original_position} à {position}", category="CORRECTION") # Journalise l'ajustement si la position dépasse les limites.

    # Ajustement basé sur la taille de la raquette
    diff_from_limit = (state.field_height / 2) - abs(position) # Calcule la différence entre la limite du champ et la position actuelle.
    if diff_from_limit < (state.paddle_size / 2): 
        adjust = state.paddle_size / 2 - diff_from_limit # Calcule l'ajustement nécessaire pour que la raquette soit prise en compte.
        if DEBUG:
            log(f"Différence avec la limite avant ajustement de la raquette: {diff_from_limit}, Ajustement: {adjust}", category="CORRECTION") # Journalise la différence et l'ajustement nécessaire.
        position = position - adjust if position > 0 else position + adjust # Ajuste la position pour compenser la taille de la raquette.
        if DEBUG:
            log(f"Position ajustée avec la raquette à {position}", category="CORRECTION") # Journalise la nouvelle position après ajustement.

    # Arrondissement de la position
    final_position = round(position) # Arrondit la position finale pour éviter les valeurs flottantes.
    if DEBUG:
        log(f"Position arrondie de {position} à {final_position}", category="CORRECTION") # Journalise l'arrondissement de la position.
        log(f"\n------------------------------", "title", category="CORRECTION") # Journalise la fin de la correction.

    return final_position # Retourne la position corrigée et arrondie.


def calculateInputNeeded(state, position):
    distance = position - state.paddle_position[1] #distance entre la position actuelle et souhaitée
    raw_input = distance / state.paddle_move_speed
    rounded_input = round(raw_input)
    if DEBUG:
        log(f"\n------- DEBUG INPUT NEED -------", "title", category="INPUT")
        log(f"Distance calculée de: {distance}", category="INPUT")
        log(f"Input brut calculé: {raw_input}", category="INPUT")
        log(f"Input arrondi: {rounded_input}", category="INPUT")
        log("----------------------------------\n", "title", category="INPUT")
    return rounded_input
    