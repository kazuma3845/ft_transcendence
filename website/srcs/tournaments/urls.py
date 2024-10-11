from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TournamentViewSet

app_name = 'tournaments'
router = DefaultRouter()

router.register(r'tournament', TournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
