from django.urls import path, include
from . import views
from rest_framework import routers
from .views import UserProfileViewSet
from django.contrib.auth.views import LogoutView

app_name = 'users'
# Définir le routeur pour les routes API
router = routers.DefaultRouter()
router.register(r'profiles', UserProfileViewSet)

urlpatterns = [
    # path('', views.index, name='index'),
    # Routes API pour les profiles d'utilisateurs
    path('', include(router.urls)),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
	# path('check-auth/', views.check_authentication, name='check_authentication'),
]
