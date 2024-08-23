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
        self.ball_paused = None 
        self.bounces = 0
        self.bot_difficulty = 1 # Echelle de 0-1 qui va venir influer sur les calculs de ponderation 
        
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
        self.ball_paused = data.get('ballPaused')
        self.bot_difficulty = data.get('bot_lvl')
    
    def updateBallPositionAndAngle(self, position):
        self.ball_position = position
        self.ball_angle = 180 - self.ball_angle #en partant du principe que le bot est a droite
