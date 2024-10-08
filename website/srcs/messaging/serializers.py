from rest_framework import serializers
from .models import Conversation, Message, BlockedUser

class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.StringRelatedField(many=True)  # Utiliser le nom d'utilisateur dans la réponse
    class Meta:
        model = Conversation
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.user.username')  # Renvoyer le username du sender

    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'is_read', 'conversation', 'sender']  # Inclure les champs souhaités

class BlockedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedUser
        fields = '__all__'
