from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone

class GameSession(models.Model):
    player1 = models.ForeignKey(User, related_name='player1_sessions', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='player2_sessions', null=True, blank=True, on_delete=models.CASCADE)
    # created_time = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    player1_points = models.IntegerField(default=0)
    player2_points = models.IntegerField(default=0)
    winner = models.ForeignKey(User, related_name='won_sessions', null=True, blank=True, on_delete=models.SET_NULL)
    win_number = models.IntegerField(default=3)
    move_speed_ball = models.IntegerField(default=6, validators=[MaxValueValidator(10)])
    move_speed_paddle = models.IntegerField(default=4, validators=[MaxValueValidator(10)])
    power = models.BooleanField(null=True, blank=True)
    bot = models.BooleanField(null=True, blank=True)
    bot_difficulty = models.IntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(10)])
    player1_started = models.BooleanField(default=False)  # Initialisé à False
    player2_started = models.BooleanField(default=False)

class GameMove(models.Model):
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    move = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    22
