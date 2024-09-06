import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'game_{self.session_id}'

        # Rejoindre la salle de jeu
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"WebSocket connection accepted for session {self.session_id}")


    async def disconnect(self, close_code):
        # Quitter la salle de jeu
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        player1_points = text_data_json['player1_points']
        player2_points = text_data_json['player2_points']

        print(f"Received data: {text_data_json}")
        # Envoyer les données du score à la salle
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_score',
                'player1_points': player1_points,
                'player2_points': player2_points
            }
        )

    async def game_score(self, event):
        player1 = event['player1']
        player1_points = event['player1_points']
        player2_points = event['player2_points']

        # Envoyer les scores aux clients WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_score',
            'player1': player1,
            'player1_points': player1_points,
            'player2_points': player2_points
        }))

    async def display_player1(self, event):
        player1 = event['player1']
        player2 = event['player2']

        # Envoyer les scores aux clients WebSocket
        await self.send(text_data=json.dumps({
            'type': 'display_player1',
            'player1': player1,
            'player2': player2
        }))

# class GameConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         # Utilisation d'un groupe général pour ce test simple
#         self.game_group_name = 'simple_test_group'

#         # Rejoindre le groupe
#         await self.channel_layer.group_add(
#             self.game_group_name,
#             self.channel_name
#         )

#         logger.info("Client connected to WebSocket for simple test")

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Quitter le groupe
#         await self.channel_layer.group_discard(
#             self.game_group_name,
#             self.channel_name
#         )

#         logger.info("Client disconnected from WebSocket for simple test")

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']

#         # Envoyer un message au groupe
#         await self.channel_layer.group_send(
#             self.game_group_name,
#             {
#                 'type': 'game_message',
#                 'message': message
#             }
#         )

#     async def game_message(self, event):
#         message = event['message']

#         # Envoyer le message au WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))
