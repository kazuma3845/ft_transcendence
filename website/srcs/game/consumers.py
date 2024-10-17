import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
from .calcul import GameCalculator
import asyncio


logger = logging.getLogger(__name__)
calculators = {}

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self):
        super().__init__()
        self.actualurl = {}
        self.Url = None

    async def game_loop(self):
        try:
            while True:
                current_time = asyncio.get_event_loop().time()

                for user, url in self.actualurl.items():
                    print("User: ", user, " Acctual: ", url, " URL: ", self.Url)
                    if url != self.Url:
                        print("PLAYER DISCONNECTED")
                        await self.channel_layer.group_send(
                            self.room_group_name,
                            {
                                'type': 'player_disconnected',
                                'player_id': user
                            }
                        )
                print("PLAYER CONNECTED ID: ", self.session_id)

                updated_content = self.calculator.Calcul_loop()

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'update_position',
                        'content': updated_content,
                    }
                )

                await asyncio.sleep(0.01667)
        except asyncio.CancelledError:
            return
        except Exception as e:
            await self.close()   

    async def connect(self):
        try:
            self.session_id = self.scope['url_route']['kwargs']['session_id']
            self.Url = "#game?sessionid=" + self.session_id
            self.actualurl['url'] = self.Url
            self.room_group_name = f'game_{self.session_id}'

            self.calculator = calculators.get(self.session_id, GameCalculator())
            calculators[self.session_id] = self.calculator

            # Rejoindre la salle de jeu
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()

            # Ne lancer la game_loop que si elle n'est pas déjà en cours
            if not hasattr(self.calculator, 'game_task') or self.calculator.game_task.done():
                print(f"Starting game loop for session {self.session_id}")
                self.calculator.game_task = asyncio.create_task(self.game_loop())

            print(f"WebSocket connection accepted for session {self.session_id}")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': f"player_joined",
                    'message': f"New player has joined the gameaha",
                }
            )
        except Exception as e:
            logger.error(f"Error during WebSocket connection for session {self.session_id}: {e}")
            await self.close()  # Fermer la connexion WebSocket en cas d'erreur

    async def disconnect(self, close_code):
        if hasattr(self.calculator, 'game_task'):
            self.calculator.game_task.cancel()
            try:
                await self.calculator.game_task
            except asyncio.CancelledError:
                logger.info(f"Game task for session {self.session_id} was cancelled.")
        
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

        if message_type == 'url':
            content = text_data_json['content']
            user = content['user']
            url = content['url']
            self.actualurl[user] = url
            print("SEND URL: ", text_data_json['content'])
        
        if message_type == 'disconnect':
                await self.disconnect(close_code=1000)

        if message_type == 'update_pos':
            content = text_data_json['content']
            self.calculator.perform_calculation(content)

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

    async def update_position(self, event):
        content = event['content']
        
        # Envoyer les positions mises à jour aux clients WebSocket
        await self.send(text_data=json.dumps({
            'type': 'update_position',
            'content': content,
        }))

    async def player_disconnected(self, event):
        player_id = event['player_id']
        
        # Envoyer aux autres clients quel joueur spécifique a été déconnecté
        await self.send(text_data=json.dumps({
            'type': 'player_disconnected',
            'player': player_id
        }))