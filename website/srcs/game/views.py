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
        # Récupérer l'utilisateur connecté
        player1 = request.user

        # Créer une nouvelle session de jeu
        session = GameSession.objects.create(
            player1=player1,
        )

        # Option 1 : Retourner une réponse vide avec un statut 201
        serializer = GameSessionSerializer(session)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{session.id}',
            {
                'type': 'display_player1',
                'player1': session.player1.username,
            }
        )

        # Retourner l'objet sérialisé avec un statut 201
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post', 'get'], url_path='start_single')
    def start_single_game(self, request):
        # Récupérer l'utilisateur connecté
        player1 = request.user

        # Chercher la session de jeu la plus récente où l'utilisateur est player1
        session = GameSession.objects.filter(player1=player1).order_by('-id').first()

        if not session:
            # Si aucune session n'est trouvée, retourner une réponse vide ou un message d'erreur
            return Response({"detail": "No active game session found."}, status=status.HTTP_404_NOT_FOUND)

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
