from django.db import models
from django.contrib.auth.models import User

class GameSession(models.Model):
    player1 = models.ForeignKey(User, related_name='player1_sessions', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='player2_sessions', null=True, blank=True, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    player1_points = models.IntegerField(default=0)
    player2_points = models.IntegerField(default=0)
    winner = models.ForeignKey(User, related_name='won_sessions', null=True, blank=True, on_delete=models.SET_NULL)

class GameMove(models.Model):
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    move = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
