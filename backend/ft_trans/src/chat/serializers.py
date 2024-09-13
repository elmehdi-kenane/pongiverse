from rest_framework import serializers
from friends.models import Friendship
from .models import Room, Membership, Message, Directs, RoomInvitation
from myapp.models import customuser
from django.db.models import Q
import os


def get_direct_last_message(username, friend):
    try:
        user = customuser.objects.get(username=username)
        friend_user = customuser.objects.get(username=friend)
        last_message = (
            Directs.objects.filter(
                Q(sender=user, receiver=friend_user) | Q(sender=friend_user, receiver=user)
            )
            .order_by("-timestamp")
            .first()
        )
        if last_message is None:
            return ""
        return last_message.message
    except customuser.DoesNotExist:
        return ""

class friends_with_directs_serializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='friend.id')
    name = serializers.CharField(source='friend.username')
    avatar = serializers.SerializerMethodField()
    is_online = serializers.BooleanField(source='friend.is_online')
    is_playing = serializers.BooleanField(source='friend.is_playing')
    lastMessage = serializers.SerializerMethodField()
    unreadCount = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['id', 'name', 'avatar', 'is_online', 'is_playing', 'lastMessage', 'unreadCount']

    def get_avatar(self, obj):
        protocol = os.getenv("PROTOCOL")
        ip_address = os.getenv("IP_ADDRESS")
        return f"{protocol}://{ip_address}:8000/chatAPI{obj.friend.avatar.url}"

    def get_lastMessage(self, obj):
        username = self.context.get('username')
        if not username:
            return ""
        return get_direct_last_message(username, obj.friend.username)

    def get_unreadCount(self, obj):
        user = self.context.get('user')
        if not user or user.is_anonymous:
            return 0
        return Directs.objects.filter(receiver=user, sender=obj.friend, is_read=False).count()

class direct_message_serializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username')
    receiver = serializers.CharField(source='receiver.username')
    date = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    
    class Meta:
        model = Directs
        fields = ['id', 'sender', 'receiver' , 'content', 'date']
        
    def get_date(self, obj):
        return obj.timestamp.strftime("%Y/%m/%d AT %I:%M %p")
    def get_content(self, obj):
        return obj.message