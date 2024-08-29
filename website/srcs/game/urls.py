from django.urls import path, include
from . import views
from rest_framework import routers
from .views import GameSessionViewSet, GameMoveViewSet

app_name = 'game'

router = routers.DefaultRouter()
router.register(r'sessions', GameSessionViewSet)
router.register(r'moves', GameMoveViewSet)


urlpatterns = [
    path('', views.index, name='index'),
    path('', include(router.urls)),
]
