from django.urls import path
from . import views

urlpatterns = [
    path('set_score/', views.register_game_session_scores, name='set_score'),
    path('get_score/', views.retrieve_game_session_scores, name='get_score'),
]
