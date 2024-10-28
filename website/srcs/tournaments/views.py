from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework import viewsets
from .models import Tournament, GameSession
from .serializers import TournamentSerializer
from messaging.models import Conversation
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.decorators import action
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()  # Tous les tournois
    serializer_class = TournamentSerializer  # Le serializer à utiliser pour le modèle
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        print(f"Ca rentre: ");
        # Initialiser le serializer avec les données de la requête
        serializer = self.get_serializer(data=request.data)

        # Valider les données
        serializer.is_valid(raise_exception=True)

        # Récupérer le username de player1 depuis les données validées
        player1_username = serializer.validated_data.get('player1', None)
        print(f"player1_username : ", player1_username)

        # Récupérer l'objet User correspondant au username de player1
        player1 = None
        if player1_username:
            try:
                player1 = User.objects.get(username=player1_username)
            except User.DoesNotExist:
                raise ValidationError(f"L'utilisateur {player1_username} n'existe pas.")

        # Créer une nouvelle session de jeu avec les données validées
        game_1_1 = GameSession.objects.create(
            player1=player1,  # player1 peut être None si non fourni
            move_speed_ball=serializer.validated_data.get('move_speed_ball', 6),
            move_speed_paddle=serializer.validated_data.get('move_speed_paddle', 4),
            power=serializer.validated_data.get('power', False),
            bot=serializer.validated_data.get('bot', False),
            bot_difficulty=serializer.validated_data.get('bot_difficulty', 5),
            win_number=serializer.validated_data.get('win_number', 5),
        )

        game_1_2 = GameSession.objects.create(
            move_speed_ball=serializer.validated_data.get('move_speed_ball', 6),
            move_speed_paddle=serializer.validated_data.get('move_speed_paddle', 4),
            power=serializer.validated_data.get('power', False),
            bot=serializer.validated_data.get('bot', False),
            bot_difficulty=serializer.validated_data.get('bot_difficulty', 5),
            win_number=serializer.validated_data.get('win_number', 5),
        )

        game_2 = GameSession.objects.create(
            move_speed_ball=serializer.validated_data.get('move_speed_ball', 6),
            move_speed_paddle=serializer.validated_data.get('move_speed_paddle', 4),
            power=serializer.validated_data.get('power', False),
            bot=serializer.validated_data.get('bot', False),
            bot_difficulty=serializer.validated_data.get('bot_difficulty', 5),
            win_number=serializer.validated_data.get('win_number', 5),
        )

        # Récupérer les participants validés et ajouter player1 s'il n'est pas déjà dans la liste
        print(f"player1_username : ", player1_username)
        participants = serializer.validated_data.get('participants', [])
        if player1_username and player1_username not in participants:
            participants.append(player1_username)

        # Créer le tournoi avec les participants
        tournament = Tournament.objects.create(
            game_1_1=game_1_1,
            game_1_2=game_1_2,
            game_2=game_2,
            move_speed_ball=serializer.validated_data.get('move_speed_ball', 6),
            move_speed_paddle=serializer.validated_data.get('move_speed_paddle', 4),
            win_number=serializer.validated_data.get('win_number', 5),
            power=serializer.validated_data.get('power', False),
            participantNum=len(participants),
            participants=participants  # Stocke directement la liste des usernames
        )

        game_1_1.tour = tournament
        game_1_2.tour = tournament
        game_2.tour = tournament
        game_1_1.save()
        game_1_2.save()
        game_2.save()
        # Retourner le tournoi sérialisé
        return Response(TournamentSerializer(tournament).data, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['post'], url_path='join_tour')
    def join_tour(self, request, pk=None):
        tour = self.get_object()  # Récupère l'instance du tournoi
        message = None;
        # Vérifier si l'utilisateur est déjà dans les participants
        if request.user.username in tour.participants:
            return Response({"detail": "Vous êtes déjà inscrit dans ce tournoi."}, status=status.HTTP_400_BAD_REQUEST)

        # Cas 1 : participantNum = 1 -> game_1_1.player2 = request.user
        if tour.participantNum == 1:
            if tour.game_1_1.player2 is not None:
                return Response({"detail": "Le joueur 2 de la première partie est déjà défini."}, status=status.HTTP_400_BAD_REQUEST)
            tour.game_1_1.player2 = request.user
            message = f"{tour.game_1_1.player1} affronte {tour.game_1_1.player2}"

        # Cas 2 : participantNum = 2 -> game_1_2.player1 = request.user
        elif tour.participantNum == 2:
            if tour.game_1_2.player1 is not None:
                return Response({"detail": "Le joueur 1 de la deuxième partie est déjà défini."}, status=status.HTTP_400_BAD_REQUEST)
            tour.game_1_2.player1 = request.user

        # Cas 3 : participantNum = 3 -> game_1_2.player2 = request.user
        elif tour.participantNum == 3:
            if tour.game_1_2.player2 is not None:
                return Response({"detail": "Le joueur 2 de la deuxième partie est déjà défini."}, status=status.HTTP_400_BAD_REQUEST)
            tour.game_1_2.player2 = request.user
            message = f"{tour.game_1_2.player1} affronte {tour.game_1_2.player2}"

        # Mettre à jour le nombre de participants
        tour.participantNum += 1

        # Ajouter le nouvel utilisateur dans la liste des participants
        tour.participants.append(request.user.username)

        # Sauvegarder les changements
        tour.game_1_1.save()
        tour.game_1_2.save()
        tour.save()

        try:
            conversation = Conversation.objects.get(tour=tour)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation pour ce tournoi non trouvée."}, status=status.HTTP_404_NOT_FOUND)
        conversation.participants.add(request.user.userprofile)
        # conversation_id = conversation.id

        # print(f'Essayer de print le message')
        # print(f'sadfmessage :', message)
        # if message:  # Si le message est bien généré
        #     try:
        #         print(f"Envoi du message au groupe chat_{conversation_id} : {message}")
        #         channel_layer = get_channel_layer()
        #         async_to_sync(channel_layer.group_send)(
        #             f"chat_{conversation_id}",
        #             {
        #                 'type': 'newTourMessage',
        #                 'content': {
        #                     'conversation_id': conversation_id,
        #                     'message': message,
        #                 }
        #                 # 'type': 'chat_message',
        #                 # 'conversation_id': conversation_id,
        #                 # 'message': message,
        #                 # 'sender': request.user.username
        #             }
        #         )
        #     except Exception as e:
        #         print(f"Erreur lors de l'envoi du message à la WebSocket : {e}")
        return Response({"detail": "Vous avez rejoint le tournoi avec succès."}, status=status.HTTP_200_OK)



    # @database_sync_to_async
    # def get_conversation(self, conversation_id):
    #     # Récupérer une conversation par son ID
    #     Conversation = apps.get_model('messaging', 'Conversation')
    #     return Conversation.objects.get(id=conversation_id)
