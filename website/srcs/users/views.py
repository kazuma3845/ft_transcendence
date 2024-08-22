from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("Bienvenue dans l'application Users")

def signup(request):
    return render(request, 'users/signup.html')

def login(request):
    return render(request, 'users/login.html')
