from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # Champs du modèle User que tu veux exposer

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Utilise le serializer User ici

    class Meta:
        model = UserProfile
        fields = ['user', 'avatar', 'bio']  # Champs du modèle UserProfile
