# Create your views here.
from rest_framework import viewsets
from .models import Conversation, Message, BlockedUser
from .serializers import ConversationSerializer, MessageSerializer, BlockedUserSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


# ViewSet pour les conversations
class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
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
