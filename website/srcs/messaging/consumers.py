from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.apps import apps
from django.contrib.auth import get_user_model


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]  # Récupérer l'utilisateur connecté

        # Récupérer le UserProfile associé à cet utilisateur dans un contexte async
        UserProfile = apps.get_model('users', 'UserProfile')
        try:
            self.user_profile = await database_sync_to_async(UserProfile.objects.get)(user=self.user)
        except UserProfile.DoesNotExist:
            print(f"UserProfile for user {self.user.username} does not exist")
            await self.close()  # Fermer la connexion si le UserProfile n'existe pas
            return

        print("User profile username: ", self.user.username)  # Assurer que l'utilisateur existe bien

        # Récupérer toutes les conversations où l'utilisateur participe dans un contexte async
        conversations = await self.get_user_conversations(self.user_profile)

        # Vérifier que `conversations` est bien une liste
        if not conversations:
            print(f"No conversations found for user {self.user.username}")
            await self.accept()
            return

        # Ajouter l'utilisateur à chaque groupe de ses conversations
        for conversation in conversations:
            room_group_name = f"chat_{conversation.id}"
            await self.channel_layer.group_add(
                room_group_name,
                self.channel_name
            )

        await self.accept()
        print(f"WebSocket connection accepted for {self.user.username}")

    async def disconnect(self, close_code):
        conversations = await self.get_user_conversations(self.user_profile)

        # Vérifier si des conversations existent
        if not conversations:
            return

        # Retirer l'utilisateur de chaque groupe de ses conversations
        for conversation in conversations:
            room_group_name = f"chat_{conversation.id}"
            await self.channel_layer.group_discard(
                room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data['type']
        content = data['content']
        print(f"WS Message from : {data}")

        if message_type == 'newMessage':
            await self.handle_new_message(content)
        if message_type == 'newInvitation':
            await self.handle_new_invitation(content)
        if message_type == 'newTourMessage':
            await self.handle_new_tour_message(content)


    async def handle_new_tour_message(self, content):
        conversation_id = content['conversation_id']
        message = content['message']

        Conversation = apps.get_model('messaging', 'Conversation')
        Message = apps.get_model('messaging', 'Message')

        # Récupérer la conversation
        try:
            conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
        except Conversation.DoesNotExist:
            print(f"Conversation {conversation_id} does not exist")
            return

        # Créer et sauvegarder le nouveau message
        new_message = await database_sync_to_async(Message.objects.create)(
            conversation=conversation,
            content=message
        )

        # try:
        #     conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
        # except Conversation.DoesNotExist:
        #     print(f"Conversation {conversation_id} does not exist")
        #     return
        try:
            conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
            tour = await database_sync_to_async(lambda: conversation.tour.id)()
        except apps.get_model('messaging', 'Conversation').DoesNotExist:
            print(f"Conversation {conversation_id} does not exist")
            return

        await self.channel_layer.group_send(
            f"chat_{conversation_id}",
            {
                'type': 'chat_message',
                'conversation_id': conversation_id,
                'message': message,
                'sender': '',
                'tour': tour
            }
        )

    async def handle_new_message(self, content):
        conversation_id = content['conversation_id']
        message_content = content['message']
        sender_username = content['sender']

        UserProfile = apps.get_model('users', 'UserProfile')
        Conversation = apps.get_model('messaging', 'Conversation')
        Message = apps.get_model('messaging', 'Message')
        User = get_user_model()  # Assurer la compatibilité avec les User personnalisés

        # Récupérer l'utilisateur User à partir de son nom d'utilisateur
        try:
            sender_user = await database_sync_to_async(User.objects.get)(username=sender_username)
        except User.DoesNotExist:
            print(f"User {sender_username} does not exist")
            return  # Si l'utilisateur n'existe pas, on arrête

        # Récupérer le profil UserProfile à partir de l'utilisateur
        try:
            sender_profile = await database_sync_to_async(UserProfile.objects.get)(user=sender_user)
        except UserProfile.DoesNotExist:
            print(f"UserProfile for user {sender_username} does not exist")
            return

        # Récupérer la conversation
        try:
            conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
        except Conversation.DoesNotExist:
            print(f"Conversation {conversation_id} does not exist")
            return

        # Créer et sauvegarder le nouveau message
        new_message = await database_sync_to_async(Message.objects.create)(
            conversation=conversation,
            sender=sender_profile,
            content=message_content
        )

        # Vérifier si la conversation existe et si l'utilisateur fait partie de cette conversation dans un contexte async
        try:
            conversation = await database_sync_to_async(self.get_conversation)(conversation_id)
        except apps.get_model('messaging', 'Conversation').DoesNotExist:
            print(f"Conversation {conversation_id} does not exist")
            return

        # Envoyer le message à tous les utilisateurs du groupe correspondant à cette conversation
        await self.channel_layer.group_send(
            f"chat_{conversation_id}",
            {
                'type': 'chat_message',
                'conversation_id': conversation_id,
                'message': message_content,
                'sender': await database_sync_to_async(lambda: sender_profile.user.username)(),
                'tour': ''
            }
        )


    async def handle_new_invitation(self, content):
        conversation_id = content['conversation_id']
        sender_username = content['sender']
        game_id = content['invitation']

        UserProfile = apps.get_model('users', 'UserProfile')
        Conversation = apps.get_model('messaging', 'Conversation')
        Message = apps.get_model('messaging', 'Message')
        GameSession = apps.get_model('game', 'GameSession')
        User = get_user_model()  # Assurer la compatibilité avec les User personnalisés

        # Récupérer l'utilisateur User à partir de son nom d'utilisateur
        try:
            sender_user = await database_sync_to_async(User.objects.get)(username=sender_username)
        except User.DoesNotExist:
            print(f"User {sender_username} does not exist")
            return  # Si l'utilisateur n'existe pas, on arrête

        # Récupérer le profil UserProfile à partir de l'utilisateur
        try:
            sender_profile = await database_sync_to_async(UserProfile.objects.get)(user=sender_user)
        except UserProfile.DoesNotExist:
            print(f"UserProfile for user {sender_username} does not exist")
            return

        # Récupérer la conversation
        try:
            conversation = await database_sync_to_async(Conversation.objects.get)(id=conversation_id)
        except Conversation.DoesNotExist:
            print(f"Conversation {conversation_id} does not exist")
            return

        # Récupérer la convgameersation
        try:
            game = await database_sync_to_async(GameSession.objects.get)(id=game_id)
        except GameSession.DoesNotExist:
            print(f"Game {game_id} does not exist")
            return

        # Créer et sauvegarder le nouveau message
        new_message = await database_sync_to_async(Message.objects.create)(
            conversation=conversation,
            sender=sender_profile,
            invitation=game
        )

        # Vérifier si la conversation existe et si l'utilisateur fait partie de cette conversation dans un contexte async
        try:
            conversation = await database_sync_to_async(self.get_conversation)(conversation_id)
        except apps.get_model('messaging', 'Conversation').DoesNotExist:
            print(f"Conversation {conversation_id} does not exist")
            return

        # Vérifier si la conversation existe et si l'utilisateur fait partie de cette conversation dans un contexte async
        # try:
        #     game = await database_sync_to_async(self.get_conversation)(game_id)
        # except apps.get_model('game', 'GameSession').DoesNotExist:
        #     print(f"GameSession {game_id} does not exist")
        #     return

        # Envoyer le message à tous les utilisateurs du groupe correspondant à cette conversation
        await self.channel_layer.group_send(
            f"chat_{conversation_id}",
            {
                'type': 'chat_invitation',
                'conversation_id': conversation_id,
                'invitation': game_id,
                'sender': await database_sync_to_async(lambda: sender_profile.user.username)()  # Utiliser le nom d'utilisateur
            }
        )

    async def chat_message(self, event):
        conversation_id = event['conversation_id']
        message_content = event['message']
        sender_username = event['sender']
        tour_id = event['tour']

        await self.send(text_data=json.dumps({
            'type': 'upload_message',
            'content': {
                'conversation_id': conversation_id,
                'message': message_content,
                'sender': sender_username,
                'tour': tour_id
            }
        }))

    async def chat_invitation(self, event):
        conversation_id = event['conversation_id']
        invitation_content = event['invitation']
        sender_username = event['sender']

        await self.send(text_data=json.dumps({
            'type': 'upload_invitation',
            'content': {
                'conversation_id': conversation_id,
                'invitation': invitation_content,
                'sender': sender_username
            }
        }))

    async def update_tree(self, event):
        tour = event['tour']

        await self.send(text_data=json.dumps({
            'type': 'updateTree',
            'content': {
                'tour': tour
            }
        }))

    # # Méthodes auxiliaires pour gérer les requêtes synchrone en mode async
    # @database_sync_to_async
    # def get_user_conversations(self, user_profile):
    #     Conversation = apps.get_model('messaging', 'Conversation')
    #     return list(Conversation.objects.filter(participants=user_profile))

    @database_sync_to_async
    def get_user_conversations(self, user_profile):
        # Récupérer les conversations en mode synchrone dans une fonction asynchrone
        Conversation = apps.get_model('messaging', 'Conversation')
        # On retourne explicitement une liste pour éviter les erreurs de coroutine non iterable
        return list(Conversation.objects.filter(participants=user_profile))

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        # Récupérer une conversation par son ID
        Conversation = apps.get_model('messaging', 'Conversation')
        return Conversation.objects.get(id=conversation_id)

    @database_sync_to_async
    def create_message(self, conversation, sender_profile, content):
        # Créer un nouveau message dans la base de données
        Message = apps.get_model('messaging', 'Message')
        return Message.objects.create(conversation=conversation, sender=sender_profile, content=content)
