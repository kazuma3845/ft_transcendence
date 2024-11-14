from rest_framework import serializers
from .models import Tournament
from game.models import GameSession

class GameSessionSerializer(serializers.ModelSerializer):
	winner = serializers.CharField(source='winner.username', allow_null=True)  # Affiche le username du gagnant

	class Meta:
		model = GameSession
		fields = '__all__'  # Inclure tous les champs nécessaires pour la session de jeu

class TournamentSerializer(serializers.ModelSerializer):
	# Champ extra, non lié au modèle
	participants = serializers.ListField(child=serializers.CharField(), required=False)  # Liste de usernames
	player1 = serializers.CharField(write_only=True)
	game_1_1 = GameSessionSerializer(read_only=True)  # Champ en lecture seule
	game_1_2 = GameSessionSerializer(read_only=True)  # Champ en lecture seule
	game_2 = GameSessionSerializer(read_only=True)

	class Meta:
		model = Tournament
		fields = [
			'id',  # L'identifiant unique du tournoi
			'player1',
			'game_1_1',  # Session de jeu 1_1
			'game_1_2',  # Session de jeu 1_2
			'game_2',    # Session de jeu 2
			'power',  # Paramètre power
			'win_number',  # Nombre de victoires nécessaires
			'move_speed_ball',  # Vitesse de la balle
			'move_speed_paddle',  # Vitesse de la raquette
			'participantNum',  # Nombre de participants
			'participants',  # Dictionnaire des participants (username -> alias)
		]
