from rest_framework import serializers
from .models import GameSession, GameMove

class GameSessionSerializer(serializers.ModelSerializer):
    player1 = serializers.StringRelatedField()  # Affiche le nom d'utilisateur au lieu de l'ID
    player2 = serializers.StringRelatedField()
    winner = serializers.StringRelatedField()

    class Meta:
        model = GameSession
        fields = ['id', 'player1', 'player2', 'start_time', 'end_time', 'winner']

class GameMoveSerializer(serializers.ModelSerializer):
    player = serializers.StringRelatedField()

    class Meta:
        model = GameMove
        fields = ['id', 'session', 'player', 'move', 'timestamp']
