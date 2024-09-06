from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import GameSession, GameMove
from .serializers import GameSessionSerializer, GameMoveSerializer
from rest_framework import status
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@login_required
def index(request):
    return render(request, 'game/index.html')

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [IsAuthenticated]


    def create(self, request, *args, **kwargs):
        # Initialiser le serializer avec les données de la requête
        serializer = self.get_serializer(data=request.data)

        # Valider les données
        serializer.is_valid(raise_exception=True)

        # Récupérer l'utilisateur connecté
        player1 = request.user

        # Créer une nouvelle session de jeu avec les données validées
        session = GameSession.objects.create(
            player1=player1,
            move_speed_ball=serializer.validated_data.get('move_speed_ball', 6),
            move_speed_paddle=serializer.validated_data.get('move_speed_paddle', 4),
            power=serializer.validated_data.get('power', False),
            bot=serializer.validated_data.get('bot', False),
            bot_difficulty=serializer.validated_data.get('bot_difficulty', 5),
        )

        # Retourner la session sérialisée
        return Response(GameSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post', 'get'], url_path='start_single')
    def start_single_game(self, request):
        # Récupérer l'utilisateur connecté
        player1 = request.user

        # Chercher la session de jeu la plus récente où l'utilisateur est player1
        session = GameSession.objects.filter(player1=player1).order_by('-id').first()

        session.start_time = timezone.now();

        if not session:
            # Si aucune session n'est trouvée, retourner une réponse vide ou un message d'erreur
            return Response({"detail": "No active game session found."}, status=status.HTTP_404_NOT_FOUND)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{session.id}',
            {
                'type': 'display_player1',
                'player1': session.player1.username,
            }
        )

        # Sérialiser la session pour renvoyer les informations au frontend
        serializer = GameSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='update_score')
    def update_score(self, request, pk=None):
        session = self.get_object()
        player1_points = request.data.get('player1_points')
        player2_points = request.data.get('player2_points')
        end_time = request.data.get('end_time')

        if player1_points is not None:
            session.player1_points = int(player1_points)

        if player2_points is not None:
            session.player2_points = int(player2_points)

        if end_time is not None:
            parsed_end_time = parse_datetime(end_time)
            if parsed_end_time:
                session.end_time = parsed_end_time
            else:
                return Response({
                    'error': 'Invalid date format for end_time.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Sauvegarder la session mise à jour
        session.save()

        # Envoyer les nouvelles informations via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{session.id}',
            {
                'type': 'game_score',
                'player1': session.player1.username,
                'player1_points': session.player1_points,
                'player2_points': session.player2_points
            }
        )

        # Sérialiser la session mise à jour
        serializer = GameSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GameMoveViewSet(viewsets.ModelViewSet):
    queryset = GameMove.objects.all()
    serializer_class = GameMoveSerializer
