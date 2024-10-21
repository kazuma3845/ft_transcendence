from rest_framework import serializers
from .models import GameSession, GameMove

class GameSessionSerializer(serializers.ModelSerializer):
    player1 = serializers.StringRelatedField()
    player2 = serializers.SerializerMethodField()
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

    def get_player2(self, obj):
        # Si player2 est None ou vide, on retourne 'Bot'
        if obj.player2:
            return str(obj.player2)  # Retourne le nom d'utilisateur du joueur 2
        return "Bot"  # Si player2 est vide, retourne 'Bot'

    class Meta:
        model = GameSession
        fields = [
            'id',
            'player1',
            'player2',
            # 'created_time',
            'start_time',
            'end_time',
            'player1_points',
            'player2_points',
            'winner',
            'win_number',
            'move_speed_ball',
            'move_speed_paddle',
            'power',
            'bot',
            'bot_difficulty',
            'player1_started',
            'player2_started'
        ]

class GameMoveSerializer(serializers.ModelSerializer):
    player = serializers.StringRelatedField()

    class Meta:
        model = GameMove
        fields = ['id', 'session', 'player', 'move', 'timestamp']
