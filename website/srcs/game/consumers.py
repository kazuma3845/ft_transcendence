import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            'message': 'WebSocket connection established'
        }))

# class GameConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.session_id = self.scope['url_route']['kwargs']['session_id']
#         self.room_group_name = f'game_{self.session_id}'

#         # Rejoindre la salle de jeu
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Quitter la salle de jeu
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         player1_points = text_data_json['player1_points']
#         player2_points = text_data_json['player2_points']

#         # Envoyer les données du score à la salle
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_score',
#                 'player1_points': player1_points,
#                 'player2_points': player2_points
#             }
#         )

#     async def game_score(self, event):
#         player1_points = event['player1_points']
#         player2_points = event['player2_points']

#         # Envoyer les scores aux clients WebSocket
#         await self.send(text_data=json.dumps({
#             'player1_points': player1_points,
#             'player2_points': player2_points
#         }))
