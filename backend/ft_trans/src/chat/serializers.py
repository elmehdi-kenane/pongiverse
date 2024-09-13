from rest_framework import serializers
from friends.models import Friendship
from .models import Room, Membership, Message, Directs, RoomInvitation
from myapp.models import customuser
from django.db.models import Q

def get_direct_last_message(username, friend):
    try:
        user = customuser.objects.get(username=username)
        friend_user = customuser.objects.get(username=friend)
        last_message = (
            Directs.objects.filter(
                Q(sender=user, reciver=friend_user) | Q(sender=friend_user, reciver=user)
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
        request = self.context.get('request')
        if request and hasattr(obj.friend, 'avatar'):
            protocol = request.scheme
            ip_address = request.get_host()
            return f"{protocol}://{ip_address}{obj.friend.avatar.url}"
        return None

    def get_lastMessage(self, obj):
        username = self.context.get('username')
        if not username:
            return ""
        return get_direct_last_message(username, obj.friend.username)

    def get_unreadCount(self, obj):
        user = self.context.get('user')
        if not user or user.is_anonymous:
            return 0
        return Directs.objects.filter(reciver=user, sender=obj.friend, is_read=False).count()
