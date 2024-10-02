from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from users.forms import SignUpForm
from users.models import UserProfile
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from game.models import GameSession
from game.serializers import GameSessionSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def create(self, request, *args, **kwargs):
            username = request.data.get('username')
            email = request.data.get('email')
            password = request.data.get('password')

            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create_user(username=username, email=email, password=password)
            user_profile = UserProfile(user=user, bio=request.data.get('bio'))
            user_profile.save()
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='check-auth')
    def check_authentication(self, request):
        if request.user.is_authenticated:
            return Response({'authenticated': True, 'email': request.user.email})
        else:
            return Response({'authenticated': False})

    @action(detail=False, methods=['post'], url_path='login')
    def login_user(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({'success': 'Connexion réussie'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Nom d\'utilisateur ou mot de passe incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['GET'], url_path='info-user')
    def info_user(self, request):
        # Récupérer l'utilisateur courant
        user = request.user

        # Récupérer le profil utilisateur associé
        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profil utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Sérialiser le profil utilisateur
        serializer = UserProfileSerializer(user_profile)

        # Retourner les données sérialisées
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], url_path='info-user')
    def info_user(self, request):
        user = request.user

        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Profil utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)

        # Sérialiser le profil utilisateur
        serializer = UserProfileSerializer(user_profile)

        # Retourner les données sérialisées
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], url_path='game-sessions')
    def user_game_sessions(self, request):
        user = request.user
        game_sessions = GameSession.objects.filter(Q(player1=user) | Q(player2=user))

        if not game_sessions.exists():
            return Response({'message': 'Aucune session trouvée pour cet utilisateur.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = GameSessionSerializer(game_sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('query', None)
        if query is not None:
            users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        return Response([])
