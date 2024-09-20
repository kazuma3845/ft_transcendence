import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger(__name__)

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.session_id = self.scope['url_route']['kwargs']['session_id']
            self.room_group_name = f'game_{self.session_id}'

            # Rejoindre la salle de jeu
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()  # Accepter la connexion WebSocket
            print(f"WebSocket connection accepted for session {self.session_id}")

            # Diffuser un message aux membres du groupe pour indiquer qu'un nouveau joueur a rejoint
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': f"player_joined",
                    'message': f"New player has joined the gameaha",
                }
            )
        except Exception as e:
            # Log l'erreur pour déboguer
            logger.error(f"Error during WebSocket connection for session {self.session_id}: {e}")
            await self.close()  # Fermer la connexion WebSocket en cas d'erreur

    async def disconnect(self, close_code):
        # Quitter la salle de jeu
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']

        if message_type == 'game_score':
            player1_points = text_data_json['content']['player1_points']
            player2_points = text_data_json['content']['player2_points']
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

        if message_type == 'update_position':
            content = text_data_json['content']
            print(f"Received data: {text_data_json}")
            # Envoyer les données du score à la salle
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'update_position',
                    'content': content,
                }
            )

        if message_type == 'start_game':
            message = text_data_json['message']
            print(f"Received data: {text_data_json}")
            # Envoyer les données du score à la salle
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_game',
                    'message': message,
                }
            )

    async def start_game(self, event):
        message = event['message']

        # Envoyer les scores aux clients WebSocket
        await self.send(text_data=json.dumps({
            'type': 'start_game',
            'message': message,
        }))

    async def update_position(self, event):
        content = event['content']

        # Envoyer les scores aux clients WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update_position',
            'content': content,
        }))

    async def player_joined(self, event):
        message = event['message']

        # Envoyer le message à WebSocket
        await self.send(text_data=json.dumps({
            'type': f"player_joined",
            'message': message
        }))

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

    async def display_player(self, event):
        player1 = event['player1']
        player2 = event['player2']

        # Envoyer les scores aux clients WebSocket
        await self.send(text_data=json.dumps({
            'type': 'display_player',
            'player1': player1,
            'player2': player2
        }))
