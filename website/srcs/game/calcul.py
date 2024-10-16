import math
import requests
import random
import time
from threading import Timer

class GameCalculator:
    def __init__(self):
        self.player_left_pos = 0
        self.player_right_pos = 0
        self.posx = -131.5
        self.posy = 0
        self.ballSpeedX = 0
        self.ballSpeedY = 0
        self.score = [0, 0]
        self.rebond = 0
        self.arenaWidth = 300
        self.arenaHeight = 225
        self.paddle_left_size = [5, 40, 10]
        self.paddle_right_size = [5, 40, 10]
        self.initialSpeed = 0
        self.botActivated = True
        self.moveSpeed = 0

        self.right_back = False
        self.left_back = False
        self.left_up = False
        self.right_up = False

        self.i = 0

        # power
        self.power = False
        self.powerChageCamLeft = False
        self.powerChageCamRight = False
        self.ChangeCam = False
        self.powerPaddleSize = False
        self.powerReverse = False
        self.sizebase = 40
        self.speedBall = 0
        self.bonusposx = 0
        self.bonusposy = 0
        self.bonusPadleR = 40
        self.bonusPadleL = 40
        self.coordBefore = 0
        self.ballPaused = True
        self.randomPos()

    def perform_calculation(self, content):

        if content['enterright'] and self.posx > 0:
            self.ballPaused = False
        if content['enterleft'] and self.posx < 0:
            self.ballPaused = False

        if self.i != 1:
            self.power = content['power']
            self.initialSpeed = content['moveSpeed']
            self.botActivated = content['bot']
            self.moveSpeed = content['paddleSpeed']
            self.ballSpeedX = self.initialSpeed
            self.speedBall = self.initialSpeed
            self.i = 1

        #move
        self.right_back = content['right_back']
        self.left_back = content['left_back']
        self.left_up = content['left_up']
        self.right_up = content['right_up']


    def Calcul_loop(self):

        ball_angle = 90
        handleBallHit = False
        replaceBot = False
        botStartGame = False

        ballRayon = 6
        paddle_pos = 140


        halfArenaHeight = self.arenaHeight / 2
        halfRaquetteHeight = self.paddle_left_size[1] / 2
        halfRaquetteHeight2 = self.paddle_right_size[1] / 2

        if self.left_back:
            if (self.player_left_pos - halfRaquetteHeight - self.moveSpeed) > -halfArenaHeight:
                self.player_left_pos -= self.moveSpeed
            else:
                self.player_left_pos = -(halfArenaHeight - halfRaquetteHeight)

        if self.right_back:
            if (self.player_right_pos - halfRaquetteHeight2 - self.moveSpeed) > -halfArenaHeight:
                self.player_right_pos -= self.moveSpeed
            else:
                self.player_right_pos = -(halfArenaHeight - halfRaquetteHeight2)

        if self.left_up:
            if (self.player_left_pos + halfRaquetteHeight + self.moveSpeed) < halfArenaHeight:
                self.player_left_pos += self.moveSpeed
            else:
                self.player_left_pos = halfArenaHeight - halfRaquetteHeight

        if self.right_up:
            if (self.player_right_pos + halfRaquetteHeight2 + self.moveSpeed) < halfArenaHeight:
                self.player_right_pos += self.moveSpeed
            else:
                self.player_right_pos = halfArenaHeight - halfRaquetteHeight2

        if self.ballPaused:
            if self.posx < 0:
                self.posy = self.player_left_pos
                self.speedDir = 1
            if self.posx > 0:
                self.posy = self.player_right_pos
                self.speedDir = -1
                if self.botActivated:
                    botStartGame = True
        else:
            halfArenaWidth = self.arenaWidth / 2

            if (self.posx + ballRayon) >= halfArenaWidth:
                self.posx = paddle_pos - ballRayon
                self.posy = self.player_right_pos
                self.ballSpeedX = -self.initialSpeed
                self.ballPaused = True
                self.score[0] += 1
                self.rebond = 0

            if (self.posx - ballRayon) <= -halfArenaWidth:
                self.posx = -(paddle_pos - ballRayon)
                self.posy = self.player_left_pos
                self.ballSpeedX = self.initialSpeed
                self.ballPaused = True
                self.score[1] += 1
                self.rebond = 0

            if (self.posy + ballRayon) >= halfArenaHeight and self.rebond != 1:
                self.ballSpeedY = -self.ballSpeedY
                self.rebond = 1

            if (self.posy - ballRayon) <= -halfArenaHeight and self.rebond != 2:
                self.ballSpeedY = -self.ballSpeedY
                self.rebond = 2

            halfRaquetteWidth = self.paddle_left_size[0] / 2

            if (self.posx - ballRayon <= -(paddle_pos - halfRaquetteWidth) and
                self.posy >= self.player_left_pos - halfRaquetteHeight and
                self.posy <= self.player_left_pos + halfRaquetteHeight):
                impactY = self.posy - self.player_left_pos
                normalizedImpactY = impactY / halfRaquetteHeight
                bounceAngle = normalizedImpactY * (3.14 / 4)
                self.ballSpeedX = abs(self.ballSpeedX) * math.cos(bounceAngle)
                self.ballSpeedY = abs(self.ballSpeedX) * math.sin(bounceAngle)
                if self.botActivated:
                    angleRadians = math.atan2(self.ballSpeedY, self.ballSpeedX)
                    angleDegrees = angleRadians * (180 / 3.14)
                    ball_angle = 90 - angleDegrees
                    if not self.ballPaused:
                        handleBallHit = True
                    else:
                        replaceBot = True
                self.rebond = 0

            if (self.posx + ballRayon >= paddle_pos - halfRaquetteWidth and
                self.posy >= self.player_right_pos - halfRaquetteHeight2 and
                self.posy <= self.player_right_pos + halfRaquetteHeight2):
                impactY = self.posy - self.player_right_pos
                normalizedImpactY = impactY / halfRaquetteHeight2
                bounceAngle = normalizedImpactY * (3.14 / 4)
                self.ballSpeedX = -abs(self.ballSpeedX) * math.cos(bounceAngle)
                self.ballSpeedY = abs(self.ballSpeedX) * math.sin(bounceAngle)
                if self.botActivated:
                    if not self.ballPaused:
                        replaceBot = True
                self.rebond = 0

            speed = math.sqrt(self.ballSpeedX * self.ballSpeedX + self.ballSpeedY * self.ballSpeedY)
            self.ballSpeedX = (self.ballSpeedX / speed) * self.initialSpeed
            self.ballSpeedY = (self.ballSpeedY / speed) * self.initialSpeed

            self.coordBefore = self.posx
            self.posx += self.ballSpeedX
            self.posy += self.ballSpeedY
        
        if self.power:
            self.activePower()

        # BONUS
        result = {
            'rotatex': self.ballSpeedX,
            'rotatey': self.ballSpeedY,
            'posx': self.posx,
            'posy': self.posy,
            'player_right_pos': self.player_right_pos,
            'player_left_pos': self.player_left_pos,
            'ballPaused': self.ballPaused,
            'score': self.score,
        }

        if self.botActivated:
            result.update({
                'ball_angle': ball_angle,
                'replaceBot': replaceBot,
                'botStartGame': botStartGame,
                'handleBallHit': handleBallHit,
            })

        if self.power:
            result.update({
                'bonusPosx': self.bonusposx,
                'bonusPosy': self.bonusposy,
                'bonuspadleLsize': self.bonusPadleL,
                'bonuspadleRsize': self.bonusPadleR,
                'bonusChageCamRight': self.powerChageCamRight,
                'bonusChageCamLeft': self.powerChageCamLeft,

            })
        return result

    def ChangeCame(self):
        if self.ChangeCam:
            if self.coordBefore < self.posx and not self.powerChageCamRight:
                self.powerChageCamRight = True
                self.ChangeCam = False
                Timer(5.0, self.reset_ChangeCamR).start()
            elif not self.powerChageCamLeft :
                self.powerChageCamLeft = True
                self.ChangeCam = False
                Timer(5.0, self.reset_ChangeCamL).start()
    
    def reset_ChangeCamL(self):
        self.powerChageCamLeft = False

    def reset_ChangeCamR(self):
        self.powerChageCamRight = False

    def augment_paddle(self):
        if self.powerPaddleSize:
            if self.coordBefore < self.posx:
                self.bonusPadleL = 225
                self.paddle_left_size[1] = self.bonusPadleL
                self.player_left_pos = 0
                self.powerPaddleSize = False
                Timer(5.0, self.reset_paddle_left_size).start()
            else:
                self.bonusPadleR = 225
                self.paddle_right_size[1] = self.bonusPadleR
                self.player_right_pos = 0
                self.powerPaddleSize = False
                Timer(5.0, self.reset_paddle_right_size).start()

    def reset_paddle_left_size(self):
        self.bonusPadleL = self.sizebase
        self.paddle_left_size[1] = self.sizebase

    def reset_paddle_right_size(self):
        self.bonusPadleR = self.sizebase
        self.paddle_right_size[1] = self.sizebase

    def reverseBall(self):
        if self.powerReverse:
            self.ballSpeedY = -self.ballSpeedY
            self.ballSpeedX = -self.ballSpeedX
            self.powerReverse = False

    def activePower(self):
        if (self.posx > (self.bonusposx - (6 * 2)) and 
            self.posx < (self.bonusposx + (6 * 2)) and
            self.posy > (self.bonusposy - (6 * 2)) and 
            self.posy < (self.bonusposy + (6 * 2))):
            self.randomPos()
            self.randomPower()
            self.rebond = 0
        self.augment_paddle()
        self.ChangeCame()
        self.reverseBall()
    
    def randomPos(self):
        self.bonusposx = random.uniform(-128, 128)
        self.bonusposy = random.uniform(-105, 105)

    def randomPower(self):
        power = random.randint(0, 2)
        if power == 0:
            self.powerReverse = True
        elif power == 1:
            self.powerPaddleSize = True
        elif power == 2:
            self.ChangeCam = True