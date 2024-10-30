"""
URL configuration for transendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
# from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
	path('', views.index, name='home'),
    path('api/users/', include('users.urls')),
    path('api/game/', include('game.urls')),
    path('api/leaderboards/', include('leaderboards.urls')),
    path('api/blockchain/', include('blockchain.urls')),
	path('api/messaging/', include('messaging.urls')),
	path('api/tournaments/', include('tournaments.urls')),

    # path('api/tournaments/', include('tournaments.urls')),
    # path('users/', include('users.urls')),
    # path('game/', include('game.urls')),
    # path('leaderboards/', include('leaderboards.urls')),
    # path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)