from django.db import models
from users.models import UserProfile
from game.models import GameSession

# Modèle Conversation
class Conversation(models.Model):
    participants = models.ManyToManyField(UserProfile)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation entre {', '.join([user.user.username for user in self.participants.all()])}"

# Modèle Message
class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    invitation = models.ForeignKey(GameSession, on_delete=models.SET_NULL, null=True, blank=True)  # Ajouter l'attribut invitation


    def __str__(self):
        return f"Message de {self.sender.user.username} dans la conversation {self.conversation.id}"

# Modèle BlockedUser
class BlockedUser(models.Model):
    blocker = models.ForeignKey(UserProfile, related_name='blocker', on_delete=models.CASCADE)
    blocked = models.ForeignKey(UserProfile, related_name='blocked', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.user.username} a bloqué {self.blocked.user.username}"
