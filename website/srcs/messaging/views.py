# Create your views here.
from django.db.models import Max
from rest_framework import viewsets
from .models import Conversation, Message, BlockedUser
from .serializers import ConversationSerializer, MessageSerializer, BlockedUserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


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

# ViewSet pour les messages
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

# ViewSet pour les utilisateurs bloqués
class BlockedUserViewSet(viewsets.ModelViewSet):
    queryset = BlockedUser.objects.all()
    serializer_class = BlockedUserSerializer
