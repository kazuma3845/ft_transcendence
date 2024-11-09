from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = self.scope['url_route']['kwargs']['username']
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
            'game_group',
            {
                'type': 'player_disconnected',
                'username': self.username
            }
        )

    async def player_disconnected(self, event):
        username = event['username']
        await self.send(text_data=json.dumps({
            'event': 'player_disconnected',
            'username': username
        }))