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
        fields = ["user", "avatar", "banner", "bio", "friends"]

    def get_friends(self, obj):
        friends = []

        friends_initiated = obj.friends_initiated.filter(accepted=True).select_related(
            "to_user"
        )
        for friendship in friends_initiated:
            friend_data = {
                "user": friendship.to_user,  
                "friendship_id": friendship.id,
            }
            friends.append(friend_data)

        friends_received = obj.friends_received.filter(accepted=True).select_related(
            "from_user"
        )
        for friendship in friends_received:
            friend_data = {
                "user": friendship.from_user,
                "friendship_id": friendship.id,
            }
            friends.append(friend_data)
        return UserFriendSerializer(friends, many=True).data


class UserFriendSerializer(serializers.Serializer):
    username = serializers.CharField(source="user.user.username")
    avatar_url = serializers.ImageField(source="user.avatar", read_only=True)
    friendship_id = serializers.IntegerField(read_only=True)

    class Meta:
        fields = ["username", "avatar_url", "friendship_id"]



class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField()
    to_user = serializers.StringRelatedField()

    class Meta:
        model = Friendship
        fields = ["id", "from_user", "to_user", "created", "accepted"]
