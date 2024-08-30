from rest_framework import serializers
from myapp.models import customuser
from chat.models import Room

class customUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    is_friend = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = customuser
        fields = ['username', 'is_friend','avatar']
    
    def get_is_friend(self, obj):
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

class roomSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    is_joined = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ['name', 'is_joined', 'icon']
    
    def get_is_joined(self, obj):
        return getattr(obj, 'is_joined', False)

    def get_icon(self, obj):
        request = self.context.get('request')
        if obj.icon:
            icon_url = obj.icon.url
            if request:
                print(request.build_absolute_uri(icon_url))
                return request.build_absolute_uri(icon_url)
            else:
                print(f"http://localhost:8000/auth{icon_url}")
                return f"http://localhost:8000/auth{icon_url}"
        return None