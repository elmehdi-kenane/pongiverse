from rest_framework import serializers
from .models import FriendRequest
from .models import Friendship
from myapp.models import customuser

class friendRequestSerializer(serializers.ModelSerializer):
    # from_user = serializers.CharField(source='from_user.username')
    second_username = serializers.CharField(source='to_user.username')
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['second_username', 'send_at', 'avatar']
        # I think I will add 'id' field
        # Including the id field in the serializer output can be very useful, especially for frontend applications. It allows you to uniquely identify and reference specific friend request records. For instance, you might need to update or delete a specific friend request, and having the id helps in making those API requests.

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.to_user.avatar:
            avatar_url = obj.to_user.avatar.url
            if request:
                return request.build_absolute_uri(avatar_url)
            else:
                return f"http://localhost:8000/auth{avatar_url}"
        return None

class friendSerializer(serializers.ModelSerializer):
    second_username = serializers.CharField(source='friend.username')
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['second_username', 'avatar']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.friend.avatar:
            avatar_url = obj.friend.avatar.url
            if request:
                return request.build_absolute_uri(avatar_url)
            else:
                return f"http://localhost:8000/auth{avatar_url}"
        return None

class customuserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = customuser
        fields = ['username', 'avatar']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            avatar_url = obj.avatar.url
            if request:
                return request.build_absolute_uri(avatar_url)
            else:
                return f"http://localhost:8000/auth{avatar_url}"
        return None