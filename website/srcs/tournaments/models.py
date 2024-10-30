from django.db import models
from game.models import GameSession  # Importer le modèle GameSession depuis l'app 'game'
from django.core.validators import MaxValueValidator
from django.contrib.postgres.fields import JSONField  # Utilisation de JSONField

class Tournament(models.Model):
    # Références aux instances de GameSession provenant de l'app 'game'
    game_1_1 = models.ForeignKey(GameSession, related_name='game_1_1', on_delete=models.CASCADE)
    game_1_2 = models.ForeignKey(GameSession, related_name='game_1_2', on_delete=models.CASCADE)
    game_2 = models.ForeignKey(GameSession, related_name='game_2', on_delete=models.CASCADE)

    # Autres champs du tournoi
    power = models.BooleanField(null=True, blank=True)
    win_number = models.IntegerField(default=3)
    move_speed_ball = models.IntegerField(default=6, validators=[MaxValueValidator(10)])
    move_speed_paddle = models.IntegerField(default=4, validators=[MaxValueValidator(10)])

    # Champ pour le nombre de participants
    participantNum = models.IntegerField(default=0)  # Nombre de participants, par défaut 0

    # Champ pour stocker le dictionnaire username -> alias
    participants = models.JSONField(default=list)

    def __str__(self):
        return f"Tournament {self.id} with games: {self.game_1_1.id}, {self.game_1_2.id}, {self.game_2.id}"
