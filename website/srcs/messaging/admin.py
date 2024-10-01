from django.contrib import admin
from messaging.models import Conversation, Message, BlockedUser

admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(BlockedUser)
