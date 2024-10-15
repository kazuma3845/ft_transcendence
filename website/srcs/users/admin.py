from django.contrib import admin
from .models import UserProfile, Friendship


class FriendshipInline(admin.TabularInline):
    model = Friendship
    fk_name = "from_user"
    extra = 1
    show_change_link = True
    fields = ("to_user", "accepted", "created")


class UserProfileAdmin(admin.ModelAdmin):
    inlines = [
        FriendshipInline,
    ]
    list_display = ("user", "bio", "avatar")
    search_fields = ("user__username", "bio")


admin.site.register(UserProfile, UserProfileAdmin)
