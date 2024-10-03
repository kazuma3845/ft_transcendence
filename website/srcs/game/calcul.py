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

        self.i = 0

        # power
        self.powerSpeedBall = False
        self.powerPaddleSize = False
        self.powerReverse = False
        self.sizebase = 40
        self.speedBall = 0
        self.bonusposx = 0
        self.bonusposy = 0
        self.bonusPadleR = 40
        self.bonusPadleL = 40
        self.coordBefore = 0
        self.randomPos()

    def perform_calculation(self, content):
        initialSpeed = content['moveSpeed']
        ballPaused = content['ballPaused']
        botActivated = content['bot']
        ball_angle = 90

        if self.i != 1:
            self.ballSpeedX = initialSpeed
            self.speedBall = initialSpeed
            self.i = 1

        handleBallHit = False
        replaceBot = False
        botStartGame = False

        ballRayon = 6
        paddle_pos = 140

        moveSpeed = content['paddleSpeed']

        halfArenaHeight = self.arenaHeight / 2
        halfRaquetteHeight = self.paddle_left_size[1] / 2
        halfRaquetteHeight2 = self.paddle_right_size[1] / 2

        if content['left_back']:
            if (self.player_left_pos - halfRaquetteHeight - moveSpeed) > -halfArenaHeight:
                self.player_left_pos -= moveSpeed
            else:
                self.player_left_pos = -(halfArenaHeight - halfRaquetteHeight)

        if content['right_back']:
            if (self.player_right_pos - halfRaquetteHeight2 - moveSpeed) > -halfArenaHeight:
                self.player_right_pos -= moveSpeed
            else:
                self.player_right_pos = -(halfArenaHeight - halfRaquetteHeight2)

        if content['left_up']:
            if (self.player_left_pos + halfRaquetteHeight + moveSpeed) < halfArenaHeight:
                self.player_left_pos += moveSpeed
            else:
                self.player_left_pos = halfArenaHeight - halfRaquetteHeight

        if content['right_up']:
            if (self.player_right_pos + halfRaquetteHeight2 + moveSpeed) < halfArenaHeight:
                self.player_right_pos += moveSpeed
            else:
                self.player_right_pos = halfArenaHeight - halfRaquetteHeight2

        if ballPaused:
            if self.posx < 0:
                self.posy = self.player_left_pos
                self.speedDir = 1
            if self.posx > 0:
                self.posy = self.player_right_pos
                self.speedDir = -1
                if botActivated:
                    botStartGame = True
        else:
            halfArenaWidth = self.arenaWidth / 2

            if (self.posx + ballRayon) >= halfArenaWidth:
                self.posx = paddle_pos - self.paddle_right_size[0] / 2 - ballRayon
                self.posy = self.player_right_pos
                self.ballSpeedX = -initialSpeed
                ballPaused = True
                self.score[0] += 1
                self.rebond = 0

            if (self.posx - ballRayon) <= -halfArenaWidth:
                self.posx = -(paddle_pos - self.paddle_left_size[0] / 2 - ballRayon)
                self.posy = self.player_left_pos
                self.ballSpeedX = initialSpeed
                ballPaused = True
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
                if botActivated:
                    angleRadians = math.atan2(self.ballSpeedY, self.ballSpeedX)
                    angleDegrees = angleRadians * (180 / 3.14)
                    ball_angle = 90 - angleDegrees
                    if not ballPaused:
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
                if botActivated:
                    if not ballPaused:
                        replaceBot = True
                self.rebond = 0

            speed = math.sqrt(self.ballSpeedX * self.ballSpeedX + self.ballSpeedY * self.ballSpeedY)
            self.ballSpeedX = (self.ballSpeedX / speed) * initialSpeed
            self.ballSpeedY = (self.ballSpeedY / speed) * initialSpeed

            self.coordBefore = self.posx
            self.posx += self.ballSpeedX
            self.posy += self.ballSpeedY
        
        if content['power']:
            self.activePower()

        # BONUS
        result = {
            'rotatex': self.ballSpeedX,
            'rotatey': self.ballSpeedY,
            'posx': self.posx,
            'posy': self.posy,
            'player_right_pos': self.player_right_pos,
            'player_left_pos': self.player_left_pos,
            'ballPaused': ballPaused,
            'score': self.score,
        }

        if botActivated:
            result.update({
                'ball_angle': ball_angle,
                'replaceBot': replaceBot,
                'botStartGame': botStartGame,
                'handleBallHit': handleBallHit,
            })

        if content['power']:
            result.update({
                'bonusPosx': self.bonusposx,
                'bonusPosy': self.bonusposy,
                'bonuspadleLsize': self.bonusPadleL,
                'bonuspadleRsize': self.bonusPadleR,
            })
        return result

    def augmentSpeedBall(self):
        if self.powerSpeedBall:
            self.initialSpeed = 1.3 * self.initialSpeed
            self.powerSpeedBall = False
            Timer(2.0, self.reset_speed_ball).start()
    
    def reset_speed_ball(self):
        self.initialSpeed = self.speedBall

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
        self.augmentSpeedBall()
        self.reverseBall()
    
    def randomPos(self):
        self.bonusposx = random.uniform(-128, 128)
        self.bonusposy = random.uniform(-105, 105)

    def randomPower(self):
        power = random.randint(0, 1)
        if power == 0:
            self.powerReverse = True
        elif power == 1:
            self.powerPaddleSize = True
        # elif power == 2:
        #     self.powerSpeedBall = True