from rest_framework import serializers
from .models import GameSession, GameMove
from django.contrib.auth.models import User

class GameSessionSerializer(serializers.ModelSerializer):
    player1 = serializers.CharField(required=False, allow_null=True)  # Accepter un username pour player1
    player2 = serializers.CharField(required=False, allow_null=True)  # Accepter un username pour player2
    winner = serializers.StringRelatedField()

    move_speed_ball = serializers.IntegerField(
        default=6,
        min_value=1,
        max_value=10,
        style={'input_type': 'range'}
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
    Multiplayer = serializers.BooleanField(
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
        if obj.Multiplayer:
            return "LocalPlayer"
        return "Bot"  # Si player2 est vide, retourne 'Bot'
    def validate(self, data):
        """
        Valider les noms d'utilisateurs pour player1 et player2.
        Convertir les noms en objets User si existants.
        """
        player1_username = data.get('player1')
        player2_username = data.get('player2')

        if player1_username:
            try:
                data['player1'] = User.objects.get(username=player1_username)
            except User.DoesNotExist:
                raise serializers.ValidationError(f"L'utilisateur {player1_username} n'existe pas.")
        else:
            data['player1'] = None  # Si pas de player1, on le met à None

        if player2_username:
            try:
                data['player2'] = User.objects.get(username=player2_username)
            except User.DoesNotExist:
                raise serializers.ValidationError(f"L'utilisateur {player2_username} n'existe pas.")
        else:
            data['player2'] = None  # Si pas de player2, on le met à None

        return data

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
            'Multiplayer',
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
