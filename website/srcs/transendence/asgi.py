import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from game.routing import websocket_urlpatterns


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transendence.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Gérer les requêtes HTTP normales
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})

	# 1.	Client (Navigateur) : Tente d’établir une connexion WebSocket via une URL.
	# 2.	ASGI Application (asgi.py) : Gère la demande de connexion WebSocket et la route vers le bon consumer.
	# 3.	Routing (routing.py) : Route les demandes WebSocket vers le bon consumer en fonction de l’URL.
	# 4.	Consumer (consumers.py) : Gère les messages WebSocket spécifiques. Il peut écouter les messages, répondre, et envoyer des messages à d’autres clients connectés.

	# 	1.	ASGI et Channels sont correctement configurés dans ton projet pour gérer les WebSockets.
	# 2.	La route WebSocket (routing.py) est correcte et pointe vers le bon consumer.
	# 3.	Le consumer (consumers.py) est correctement écrit pour gérer les événements WebSocket.
	# 4.	Le client JavaScript est bien configuré pour se connecter à la bonne URL WebSocket et gérer les événements comme onopen, onmessage, et onclose.
