from rest_framework import serializers
from myapp.models import customuser
from .models import Notification
from chat.models import Room, Membership, Message, Directs, RoomInvitation
import os

class customUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    is_friend = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = customuser
        fields = ['id', 'username', 'is_friend','avatar']
    
    def get_is_friend(self, obj):
        # Ensure that `is_friend` exists on the object
        return getattr(obj, 'is_friend', False)
    
    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            avatar_url = obj.avatar.url
            if request:
                return request.build_absolute_uri(avatar_url)
            else:
                protocol = os.getenv("PROTOCOL")
                ip_address = os.getenv("IP_ADDRESS")
                return f"{protocol}://{ip_address}:{os.getenv('PORT')}/auth{avatar_url}"
        return None

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['notification_text', 'url_redirection', 'send_at', 'avatar', 'is_read']
        # Optionally, exclude 'user' if you don't want to expose it:
        # exclude = ['user']

class room_serializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    icon = serializers.SerializerMethodField()
    members_count = serializers.IntegerField()

    class Meta:
        model = Room
        fields = ['id', 'name', 'icon', 'members_count']

    def get_icon(self, obj):
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        return f"{protocol}://{ip_address}:{os.getenv('PORT')}/chatAPI{obj.icon.url}"
