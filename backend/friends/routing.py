from django.urls import re_path

from . import friendsConsumers

websocket_urlpatterns = [
    re_path(r'ws/friends/$', friendsConsumers.FriendConsumer.as_asgi()),
]