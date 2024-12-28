from rest_framework import serializers
from myapp.models import customuser
from .models import Notification

class customUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    is_friend = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = customuser
        fields = ['username', 'is_friend','avatar']
    
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
                return f"http://localhost:8000/auth{avatar_url}"
        return None

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['notification_text', 'url_redirection', 'send_at', 'avatar']
        # Optionally, exclude 'user' if you don't want to expose it:
        # exclude = ['user']