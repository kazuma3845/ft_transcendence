from django.http import HttpResponse
from django.shortcuts import redirect, render
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from users.forms import SignUpForm
from users.models import UserProfile
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required

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
