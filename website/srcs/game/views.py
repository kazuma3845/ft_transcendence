from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import GameSession, GameMove
from .serializers import GameSessionSerializer, GameMoveSerializer
from rest_framework import status

@login_required
def index(request):
    return render(request, 'game/index.html')

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post', 'get'], url_path='start_single')
    def start_single_game(self, request):
        # Récupérer l'utilisateur connecté
        player1 = request.user

        # Créer une nouvelle session de jeu contre l'IA
        session = GameSession.objects.create(
            player1=player1,
        )

        # Sérialiser la session pour renvoyer les informations au frontend
        serializer = GameSessionSerializer(session)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GameMoveViewSet(viewsets.ModelViewSet):
    queryset = GameMove.objects.all()
    serializer_class = GameMoveSerializer
