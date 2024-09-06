from rest_framework import serializers
from .models import GameSession, GameMove

class GameSessionSerializer(serializers.ModelSerializer):
    player1 = serializers.StringRelatedField()  # Affiche le nom d'utilisateur au lieu de l'ID
    player2 = serializers.StringRelatedField()
    winner = serializers.StringRelatedField()
    move_speed_ball = serializers.IntegerField(
        default=6,
        min_value=1,
        max_value=10,
        style={'input_type': 'range'}  # Ce style génère un slider dans le frontend
    )
    move_speed_paddle = serializers.IntegerField(
        default=4,
        min_value=1,
        max_value=10,
        style={'input_type': 'range'}
    )
    power = serializers.BooleanField(
        required=False,
        style={'input_type': 'checkbox'}
    )
    bot = serializers.BooleanField(
        required=False,
        style={'input_type': 'checkbox'}
    )
    bot_difficulty = serializers.IntegerField(
        default=5,
        min_value=1,
        max_value=10,
        style={'input_type': 'range'}
    )

    class Meta:
        model = GameSession
        fields = [
            'id',
            'player1',
            'player2',
            # 'created_time',  # Nouveau champ ajouté
            'start_time',
            'end_time',
            'player1_points',
            'player2_points',
            'winner',
            'win_number',        # Nouveau champ ajouté
            'move_speed_ball',   # Nouveau champ ajouté
            'move_speed_paddle', # Nouveau champ ajouté
            'power',             # Nouveau champ ajouté
            'bot',               # Nouveau champ ajouté
            'bot_difficulty'     # Nouveau champ ajouté
        ]

class GameMoveSerializer(serializers.ModelSerializer):
    player = serializers.StringRelatedField()

    class Meta:
        model = GameMove
        fields = ['id', 'session', 'player', 'move', 'timestamp']
