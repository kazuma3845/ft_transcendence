from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    banner = models.ImageField(upload_to="banners/", null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return self.user.username

class Friendship(models.Model):
    from_user = models.ForeignKey(
        UserProfile, related_name="friends_initiated", on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        UserProfile, related_name="friends_received", on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.from_user.user.username} -> {self.to_user.user.username}"

    class Meta:
        unique_together = ("from_user", "to_user")
        constraints = [
            models.CheckConstraint(
                check=~models.Q(from_user=models.F("to_user")),
                name="prevent_self_friendship",
            )
        ]
