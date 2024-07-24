from rest_framework import serializers
from .models import FriendRequest
from .models import Friendship

class friendRequestSerializer(serializers.ModelSerializer):
    # from_user = serializers.CharField(source='from_user.username')
    # to_user = serializers.CharField(source='to_user.username')

    class Meta:
        model = FriendRequest
        fields = ['from_user', 'to_user', 'send_at', 'status']  
        # I think I will add 'id' field
        # Including the id field in the serializer output can be very useful, especially for frontend applications. It allows you to uniquely identify and reference specific friend request records. For instance, you might need to update or delete a specific friend request, and having the id helps in making those API requests.

class getFriendListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Friendship
        fields = ['friend']
