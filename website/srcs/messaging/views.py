# Create your views here.
from django.db.models import Max
from rest_framework import viewsets
from .models import Conversation, Message, BlockedUser, UserProfile
from .serializers import ConversationSerializer, MessageSerializer, BlockedUserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

# ViewSet pour les conversations
class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

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
    @action(detail=False, methods=['post'], url_path='create_conversation')
    def create_conversation(self, request):
        print("Log error Step to debug")
        # Récupérer les IDs des participants envoyés dans le corps de la requête
        participant_ids = request.data.get('participants', [])
        if not participant_ids:
            return Response({'error': 'La liste des participants est requise'}, status=status.HTTP_400_BAD_REQUEST)
        print("2 Log error Step to debug")
        # Récupérer les profils des participants
        participants = []
        for participant_id in participant_ids:
            try:
                print(f"Tentative de récupération du participant avec le username: {participant_id}")
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

        # Filtrer pour vérifier que la conversation contient exactement les mêmes participants
        for conversation in conversations:
            conversation_participants = set(conversation.participants.all())
            if conversation_participants == set(participants):  # Vérifier si les deux ensembles sont identiques
                return Response({'message': 'Conversation déjà existante', 'conversation_id': conversation.id}, status=status.HTTP_200_OK)
        # Créer une nouvelle conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(*participants)  # Ajouter les participants à la conversation
        conversation.save()
        print("5 Log error Step to debug")
        # Sérialiser la nouvelle conversation et la renvoyer
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# ViewSet pour les messages
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

# ViewSet pour les utilisateurs bloqués
class BlockedUserViewSet(viewsets.ModelViewSet):
    queryset = BlockedUser.objects.all()
    serializer_class = BlockedUserSerializer
