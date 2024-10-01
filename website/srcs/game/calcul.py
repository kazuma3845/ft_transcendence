import math
import requests

class GameCalculator:
    def __init__(self):
        self.player_left_pos = 0
        self.player_right_pos = 0
        self.posx = -131.5
        self.posy = 0
        self.ballSpeedX = 0
        self.ballSpeedY = 0
        self.i = 0
        self.score = [0, 0]
        self.rebond = 0
        self.arenaWidth = 300
        self.arenaHeight = 225
        pass

    def perform_calculation(self, content):
        initialSpeed = content['moveSpeed']
        ballPaused = content['ballPaused']
        botActivated = content['bot']
        ball_angle = 90

        if (self.i != 1):
            self.ballSpeedX = initialSpeed
            self.i = 1

        handleBallHit = False
        replaceBot = False
        botStartGame = False

        ballRayon = 6
        paddle_left_size = [5, 40, 10]
        paddle_right_size = [5, 40, 10]
        paddle_pos = 140

        moveSpeed = content['paddleSpeed']

        halfArenaHeight = self.arenaHeight / 2
        halfRaquetteHeight = paddle_left_size[1] / 2
        halfRaquetteHeight2 = paddle_right_size[1] / 2

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
                self.posx = paddle_pos - paddle_right_size[0] / 2 - ballRayon
                self.posy = self.player_right_pos
                self.ballSpeedX = -initialSpeed
                ballPaused = True
                self.score[0] += 1
                self.rebond = 0

            if (self.posx - ballRayon) <= -halfArenaWidth:
                self.posx = -(paddle_pos - paddle_left_size[0] / 2 - ballRayon)
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

            halfRaquetteWidth = paddle_left_size[0] / 2

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

            coordBefore = self.posx
            self.posx += self.ballSpeedX
            self.posy += self.ballSpeedY

        # BONUS

        if botActivated:
            return {
                'posx': self.posx,
                'posy': self.posy,
                'ball_angle': ball_angle,
                'replaceBot': replaceBot,
                'botStartGame': botStartGame,
                'handleBallHit': handleBallHit,
                'player_right_pos': self.player_right_pos,
                'player_left_pos': self.player_left_pos,
                'ballPaused': ballPaused,
                'score': self.score
            }
        else:
            return {
                'posx': self.posx,
                'posy': self.posy,
                'player_right_pos': self.player_right_pos,
                'player_left_pos': self.player_left_pos,
                'ballPaused': ballPaused,
                'score': self.score
            }
