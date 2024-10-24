from django.contrib import admin
from .models import UserProfile, Friendship


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "bio", "avatar")
    search_fields = ("user__username", "bio")


admin.site.register(UserProfile, UserProfileAdmin)
