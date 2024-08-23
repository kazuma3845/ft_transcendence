from django.db import models
from django.contrib.auth.models import User

class Leaderboard(models.Model):
    player = models.OneToOneField(User, on_delete=models.CASCADE)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    points = models.IntegerField(default=0)  # You can define a points system if needed

    def __str__(self):
        return f"{self.player.username} - {self.points} points"
