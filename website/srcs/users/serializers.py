from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Friendship, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    friends = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["user", "avatar", "bio", "friends"]

    def get_friends(self, obj):
        friends_initiated = obj.friends_initiated.filter(accepted=True)
        friends_received = obj.friends_received.filter(accepted=True)
        friends = set(f.to_user for f in friends_initiated).union(
            f.from_user for f in friends_received
        )
        return UserFriendSerializer(friends, many=True).data


class UserFriendSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    avatar_url = serializers.ImageField(source="avatar")

    class Meta:
        model = UserProfile
        fields = ["username", "avatar_url"]


class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField()
    to_user = serializers.StringRelatedField()

    class Meta:
        model = Friendship
        fields = ["id", "from_user", "to_user", "created", "accepted"]
