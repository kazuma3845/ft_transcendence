import json
import math
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

class GameState:
    def __init__(self):
        self.ball_position = None #position dans l'espace en x, y
        self.ball_speed = None 
        self.ball_angle = None #angle par rapport au mur perpendiculaire pour savoir ou elle va taper
        self.field_height = None 
        self.field_length = None 
        self.paddle_position = None
        self.paddle_size = None #largeur de la raquette (thickness, size, hauteur)
        self.paddle_move_speed = None #vitesse de deplacement de la raquette
        self.bot_side = None #
        self.score = None #to adjust bot level
        
    def updateData(self, data):
        self.ball_position = data.get('ball_position')
        self.ball_speed = data.get('ball_speed')
        self.ball_angle = data.get('ball_angle')
        self.field_height = data.get('field_height')
        self.field_length = data.get('field_length')
        self.paddle_position = data.get('paddle_position')
        self.paddle_size = data.get('paddle_size')
        self.paddle_move_speed = data.get('paddle_move_speed')
        self.bot_side = data.get('side')
        self.score = data.get('score')

state = GameState()

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
    return new_x, new_y
    
def getNextLateralHit(state):
    x_0, y_0 = state.ball_position
    
    distance_x = (state.field_width / 2) - x_0
    new_x = state.field_width / 2
    new_angle = 90 - state.ball_angle #Calculer le nouvel angle complémentaire
    rad_new_angle = math.radians(new_angle)
    distance_y = distance_x * math.tan(rad_new_angle)
    if 0 <= state.ball_angle < 90:
        new_y = y_0 + distance_y
    else: 
        new_y = y_0 - distance_y
    return new_x, new_y
    
def predictFinalBallPosition(state):
    if state.angle > 180:
        return -1 #si la balle va du cote adverse on ne calcule rien
    else:
        while state.ball_position[0] != state.field_length/2:
            nextLateralHit = getNextLateralHit(state)
            if nextLateralHit[1] > state.field_height/2 or nextLateralHit[1] < -state.field_height / 2: #Si je depasse les limites horizontales du terrain c'est que j'ai un rebond horizontal avant
                nextHorizontalHit = getNextHorizontalHit(state)
                #! J'update les valeurs avec mes prochaines coordonnees puis je boucle, attention a inverser l'angle
        return nextLateralHit #normalement je retourne les data quand j'ai l'intersect a 0 en x et entre les boundaries y et -y max
    

def receiveData(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            state.updateData(data)
            return JsonResponse({"status": "success", "message": "Data received"}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)