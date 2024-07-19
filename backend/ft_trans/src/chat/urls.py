from django.urls import path
from . import views

urlpatterns = [
    path('chatRooms/<str:username>', views.channel_list, name='channel-list'),
    path('channels/messages/<str:room_id>', views.channel_messages, name='channel-messages'),
    path('allRoomMembers/<str:chat_room_name>', views.all_chat_room_memebers, name='all-chat-room-memebers'),
    path('listAllFriends', views.list_all_friends, name='list-all-friends'),
    path('Directs/messages', views.direct_messages, name='channel-messages'),
    path('roomInviations/<str:username>', views.rooms_invitations, name='room-invitations'),
]
