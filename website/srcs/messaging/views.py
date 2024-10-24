# Create your views here.
from django.db.models import Max
from rest_framework import viewsets
from .models import Conversation, Message, BlockedUser, UserProfile, Tournament
from .serializers import ConversationSerializer, MessageSerializer, BlockedUserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


# ViewSet pour les conversations
class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Renvoyer les conversations où le currentUser est un participant
        user_profile = self.request.user.userprofile  # Assuming you have a OneToOne relationship between User and UserProfile
        return Conversation.objects.filter(participants=user_profile) \
            .annotate(last_message=Max('messages__timestamp')) \
            .order_by('-last_message')  # Trier par le message le plus récent (le plus récent d'abord)

    # Ajouter une action personnalisée pour récupérer les messages d'une conversation
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    # Action personnalisée pour créer une conversation
    @action(detail=False, methods=['post'], url_path='create_tour_conv')
    def create_tour_conv(self, request):
        tour_id = request.data.get('tour', None)
        if not tour_id:
            return Response({'error': 'L\'ID du tournoi est requis'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Récupérer le tournoi
            tour = Tournament.objects.get(id=tour_id)
        except Tournament.DoesNotExist:
            return Response({'error': 'Le tournoi n\'existe pas'}, status=status.HTTP_404_NOT_FOUND)

        # Récupérer les IDs des participants envoyés dans le corps de la requête
        try:
            user_profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)

        conversation = Conversation.objects.create(tour=tour)
        conversation.participants.add(user_profile)        # Sérialiser la nouvelle conversation et la renvoyer

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Action personnalisée pour créer une conversation
    @action(detail=False, methods=['post'], url_path='create_conversation')
    def create_conversation(self, request):
        # Récupérer les IDs des participants envoyés dans le corps de la requête
        participant_ids = request.data.get('participants', [])
        if not participant_ids:
            return Response({'error': 'La liste des participants est requise'}, status=status.HTTP_400_BAD_REQUEST)
        # Récupérer les profils des participants
        participants = []
        for participant_id in participant_ids:
            try:
                # Cherche le UserProfile en fonction du username du user
                participant_profile = UserProfile.objects.get(user__username=participant_id)
                participants.append(participant_profile)
            except UserProfile.DoesNotExist:
                return Response({'error': f'Participant avec le username {participant_id} non trouvé'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                print(f"Erreur inattendue lors de la récupération du participant {participant_id}: {e}")
                return Response({'error': f'Erreur lors de la récupération du participant {participant_id}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Récupérer toutes les conversations qui contiennent au moins un des participants
        conversations = Conversation.objects.filter(participants__in=participants).distinct()
        # conversations = await database_sync_to_async(Conversation.objects.filter)(participants__in=participants).distinct()

        # Filtrer pour vérifier que la conversation contient exactement les mêmes participants
        for conversation in conversations:
            conversation_participants = set(conversation.participants.all())
            if conversation_participants == set(participants):  # Vérifier si les deux ensembles sont identiques
                return Response({'message': 'Conversation déjà existante', 'id': conversation.id}, status=status.HTTP_200_OK)
        # Créer une nouvelle conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(*participants)  # Ajouter les participants à la conversation
        conversation.save()
        # Sérialiser la nouvelle conversation et la renvoyer
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='toggle-block')
    def toggle_block(self, request, pk=None):
        print(f"Test du BLOCKAGE");
        try:
            # Utiliser self.get_object() pour récupérer la conversation liée au pk de l'URL
            conversation = self.get_object()  # Récupérer la conversation avec l'ID donné
            blocker_profile = request.user.userprofile  # Profil de l'utilisateur qui bloque

            # Récupérer tous les participants de la conversation, sauf l'utilisateur courant
            participants = conversation.participants.exclude(id=blocker_profile.id)

            # Parcourir chaque participant pour bloquer ou débloquer
            for participant_profile in participants:
                blocked = BlockedUser.objects.filter(blocker=blocker_profile, blocked=participant_profile)

                if blocked.exists():
                    # Si l'utilisateur est déjà bloqué, le débloquer
                    blocked.delete()
                    blockedStatus = False;
                    message = f"{participant_profile.user.username} a été débloqué."
                else:
                    # Si l'utilisateur n'est pas encore bloqué, le bloquer
                    BlockedUser.objects.create(blocker=blocker_profile, blocked=participant_profile)
                    blockedStatus = True;
                    message = f"{participant_profile.user.username} a été bloqué."
            return Response({'blocked': blockedStatus, 'message': message})

        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation non trouvée'}, status=404)

        except UserProfile.DoesNotExist:
            return Response({'error': 'Utilisateur non trouvé'}, status=404)

    @action(detail=True, methods=['get'], url_path='check-block-status')
    def check_block_status(self, request, pk=None):
        conversation = self.get_object()
        blocker_profile = request.user.userprofile
        participants = conversation.participants.exclude(id=blocker_profile.id)

        # Vérifier si un des participants est bloqué
        for participant_profile in participants:
            blocked = BlockedUser.objects.filter(blocker=blocker_profile, blocked=participant_profile).exists()
            if blocked:
                return Response({'blocked': True})

        return Response({'blocked': False})

    @action(detail=False, methods=['get'], url_path='blocked-users')
    def get_blocked_users(self, request):
        # Récupérer le profil utilisateur de l'utilisateur connecté
        blocker_profile = request.user.userprofile

        # Récupérer tous les utilisateurs que l'utilisateur connecté a bloqués
        blocked_users = BlockedUser.objects.filter(blocker=blocker_profile).values_list('blocked__user__username', flat=True)

        # Retourner la liste des noms d'utilisateur bloqués
        return Response({'blocked_users': list(blocked_users)})

    @action(detail=False, methods=['get'], url_path='tour/(?P<tour_id>[^/.]+)')
    def get_conversation_by_tour(self, request, tour_id=None):
        try:
            conversation = Conversation.objects.get(tour__id=tour_id)
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)
        except Conversation.DoesNotExist:
            return Response({'detail': 'Conversation non trouvée.'}, status=status.HTTP_404_NOT_FOUND)

# ViewSet pour les messages
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]


# ViewSet pour les utilisateurs bloqués
class BlockedUserViewSet(viewsets.ModelViewSet):
    queryset = BlockedUser.objects.all()
    serializer_class = BlockedUserSerializer
    permission_classes = [IsAuthenticated]
