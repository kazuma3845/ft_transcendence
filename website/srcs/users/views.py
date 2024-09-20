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

@login_required
def index(request):
    return HttpResponse("Bienvenue dans l'application Users")

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            bio = form.cleaned_data.get('bio')  # Récupère la bio du formulaire
            UserProfile.objects.create(user=user, bio=bio)  # Créer le profil associé

            # Authentifie l'utilisateur nouvellement créé
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=raw_password)

            # Connecte l'utilisateur
            login(request, user)
            return redirect('users:index')  # Rediriger vers la page d'accueil après inscription
    else:
        form = SignUpForm()

    return render(request, 'users/signup.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authentifie l'utilisateur
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)  # Connecte l'utilisateur
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('users:index')  # Redirige vers la page d'accueil après connexion
        else:
            # Si l'authentification échoue, renvoyer une erreur
            return render(request, 'users/login.html', {'error': 'Nom d\'utilisateur ou mot de passe incorrect'})
    next_url = request.GET.get('next', '')
    return render(request, 'users/login.html', {'next': next_url})
