from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings
from users.models import UserProfile

User = get_user_model()

class Command(BaseCommand):
    help = "Creates a bot profile and associated profile."

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username="Bot").exists():
            # Création du bot
            user = User.objects.create_user(
                username="Bot", email="transcendence@bot.42.ch", password=None
            )
            UserProfile.objects.create(
                user=user,
                bio="Ici pour soulever des daronnes.",
                avatar="/avatars/bot.gif",
                banner="/banners/terminator.gif",
            )
            self.stdout.write(self.style.SUCCESS("Bot profile created successfully!"))
        else:
            self.stdout.write(self.style.WARNING("Bot profile already exists."))
