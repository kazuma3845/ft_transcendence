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
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from rest_framework import viewsets
from messaging.models import Conversation
from transendence.permissions import IsAdminOrReadAndCreate

@login_required
def index(request):
    return render(request, 'game/index.html')

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadAndCreate]
    def create(self, request, *args, **kwargs):
        # Initialiser le serializer avec les données de la requête
        serializer = self.get_serializer(data=request.data)

        # Valider les données
        serializer.is_valid(raise_exception=True)

        print(f"serializer data", serializer)
        # Récupérer le username de player1 depuis les données validées
        player1_username = serializer.validated_data.get('player1', None)
        player2_username = serializer.validated_data.get('player2', None)

        # Récupérer l'objet User correspondant au username de player1
        player1 = None
        if player1_username:
            try:
                player1 = User.objects.get(username=player1_username)
            except User.DoesNotExist:
                raise ValidationError(f"L'utilisateur {player1_username} n'existe pas.")

        # Récupérer l'objet User correspondant au username de player2
        player2 = None
        if player2_username:
            try:
                player2 = User.objects.get(username=player2_username)
            except User.DoesNotExist:
                raise ValidationError(f"L'utilisateur {player2_username} n'existe pas.")

        # Créer une nouvelle session de jeu avec les données validées
        session = GameSession.objects.create(
            player1=player1,  # player1 peut être None si non fourni
            player2=player2,  # player2 peut être None si non fourni
            move_speed_ball=serializer.validated_data.get('move_speed_ball', 3),
            move_speed_paddle=serializer.validated_data.get('move_speed_paddle', 4),
            power=serializer.validated_data.get('power', False),
            Multiplayer=serializer.validated_data.get('Multiplayer', False),
            bot=serializer.validated_data.get('bot', False),
            bot_difficulty=serializer.validated_data.get('bot_difficulty', 5),
            win_number=serializer.validated_data.get('win_number', 5),
        )

        # Retourner la session sérialisée
        return Response(GameSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post', 'get'], url_path='start_single')
    def start_single_game(self, request, pk=None):
        # Récupérer la session de jeu par l'ID dans l'URL
        try:
            session = GameSession.objects.get(id=pk)
        except GameSession.DoesNotExist:
            return Response({"detail": "Game session not found."}, status=status.HTTP_404_NOT_FOUND)

        # Récupérer l'utilisateur connecté
        current_user = request.user

        # Vérifier si l'utilisateur est player1 ou player2
        if current_user == session.player1:
            session.player1_started = True
        elif current_user == session.player2:
            session.player2_started = True
        else:
            return Response({"detail": "You are not a player in this game."}, status=status.HTTP_403_FORBIDDEN)

        if session.Multiplayer:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{session.id}',
                {
                    'type': 'display_player',
                    'player1': session.player1.username,
                    'player2': 'LocalPlayer',
                }
            )
        # Si bot est activé, configurer le jeu contre le bot
        elif session.bot:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{session.id}',
                {
                    'type': 'display_player',
                    'player1': session.player1.username,
                    'player2': 'Bot',
                }
            )

        # Vérifier si les deux joueurs ont démarré
        elif session.player1_started and session.player2_started:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{session.id}',
                {
                    'type': 'display_player',
                    'player1': session.player1.username,
                    'player2': session.player2.username,
                }
            )
            # Envoyer un message WebSocket pour indiquer que le jeu peut commencer
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{session.id}',
                {
                    'type': 'start_game',
                    'message': 'The game has started!',
                    'player': session.player2.username,
                }
            )

        # Sauvegarder les informations de démarrage dans la base de données
        session.start_time = timezone.now()
        session.save()

        # Sérialiser la session et renvoyer les informations au frontend
        serializer = GameSessionSerializer(session)
        data = serializer.data
        data['currentPlayer'] = current_user.username
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='join_game')
    def join_game(self, request, pk=None):
        session = self.get_object()

        # Vérifier si player2 est déjà rempli
        if session.player2 is not None:
            return Response({"detail": "Cette session a déjà un deuxième joueur."}, status=status.HTTP_400_BAD_REQUEST)

        # Assigner player2 à l'utilisateur courant
        session.player2 = request.user

        session.save()

        return Response({"detail": "Vous avez rejoint la session avec succès."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='update_score')
    def update_score(self, request, pk=None):
        session = self.get_object()
        player1_points = request.data.get('player1_points')
        player2_points = request.data.get('player2_points')
        winner = request.data.get('winner')

        if player1_points is not None:
            try:
                session.player1_points = int(player1_points)
            except ValueError:
                logger.error(f"Invalid value for player1_points: {player1_points}")

        if player2_points is not None:
            try:
                session.player2_points = int(player2_points)
            except ValueError:
                logger.error(f"Invalid value for player2_points: {player2_points}")

        # Vérifier si un joueur a atteint le nombre de points pour gagner
        # Sauvegarder la session mise à jour
        session.save()

        if winner is not None:
            # Appeler set_winner avec player1 comme gagnant
            request.data['winner'] = winner  # Mettre l'ID de player1 dans request.data
            self.set_winner(request, pk)

        # Envoyer les nouvelles informations via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{session.id}',
            {
                'type': 'game_score',
                'id': session.id,
                'player1': session.player1.username,
                'player1_points': session.player1_points,
                'player2_points': session.player2_points,
            }
        )

        if session.tour:  # Si le tour du model session existe
            try:
                    conversation = Conversation.objects.get(tour=session.tour)
            except Conversation.DoesNotExist:
                    return Response({"detail": "Conversation pour ce tournoi non trouvée."}, status=status.HTTP_404_NOT_FOUND)
            conversation_id = conversation.id
            try:
                print(f"Impression de  update_tree : ", session.tour.id)
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"chat_{conversation_id}",
                    {
                        'type': 'update_tree',
                        'tour': session.tour.id,
                    }
                )
            except Exception as e:
                print(f"Erreur lors de l'envoi du message à la WebSocket : {e}")

        # Sérialiser la session mise à jour
        serializer = GameSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def available_sessions(self, request):
        # Obtenir l'utilisateur courant
        current_user = request.user

    # Filtrer les sessions selon les critères demandés
        sessions = GameSession.objects.filter(
            player2__isnull=True,
            bot=False,
            tour__isnull=True,
            Multiplayer=False,
            start_time__isnull=False,  # start_time n'est pas null
            end_time__isnull=True      # end_time est null
        ).exclude(player1=current_user)

        # Sérialiser les données
        serializer = self.get_serializer(sessions, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='set_winner')
    def set_winner(self, request, pk=None):
        session = self.get_object()

        # Récupérer le gagnant à partir du username passé dans la requête
        winner_username = request.data.get('winner')

        if not winner_username:
            return Response({'error': 'Le nom d\'utilisateur du gagnant est requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Obtenir l'instance de l'utilisateur
            winner = User.objects.get(username=winner_username)
        except User.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Définir le gagnant et l'heure de fin de la session
        session.winner = winner
        session.end_time = timezone.now()  # Utilise l'heure actuelle
        session.save()

        # Vérifier si la session fait partie d'un tournoi
        if session.tour:
            tournament = session.tour
            # Si game_1_1 est la session actuelle, mettre à jour player1 de game_2
            if tournament.game_1_1 == session:
                tournament.game_2.player1 = winner
                tournament.game_2.save()
            # Si game_1_2 est la session actuelle, mettre à jour player2 de game_2
            elif tournament.game_1_2 == session:
                tournament.game_2.player2 = winner
                tournament.game_2.save()

        # Sérialiser la session mise à jour
        serializer = GameSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GameMoveViewSet(viewsets.ModelViewSet):
    queryset = GameMove.objects.all()
    serializer_class = GameMoveSerializer
