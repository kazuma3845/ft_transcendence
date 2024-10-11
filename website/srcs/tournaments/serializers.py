from rest_framework import serializers
from .models import Tournament
from game.models import GameSession

class TournamentSerializer(serializers.ModelSerializer):
    # On peut inclure les GameSession si on veut les sérialiser en profondeur
    game_1_1 = serializers.PrimaryKeyRelatedField(queryset=GameSession.objects.all())
    game_1_2 = serializers.PrimaryKeyRelatedField(queryset=GameSession.objects.all())
    game_2 = serializers.PrimaryKeyRelatedField(queryset=GameSession.objects.all())

    class Meta:
        model = Tournament
        fields = [
            'id',  # L'identifiant unique du tournoi
            'game_1_1',  # Session de jeu 1_1
            'game_1_2',  # Session de jeu 1_2
            'game_2',    # Session de jeu 2
            'power',  # Paramètre power
            'win_number',  # Nombre de victoires nécessaires
            'move_speed_ball',  # Vitesse de la balle
            'move_speed_paddle',  # Vitesse de la raquette
            'participantNum',  # Nombre de participants
            'participantDico',  # Dictionnaire des participants (username -> alias)
        ]
