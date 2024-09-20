from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('createChatRoom', views.create_chat_room, name='create-chat-room'),
    path('chatRoomUpdateName/<int:id>', views.chat_room_update_name, name='chat-room-update-name'),
    path('changeChatRoomIcon', views.chat_room_update_icon, name='chat-room-update-icon'),
    path('leaveChatRoom', views.leave_chat_room, name='leave-chat-room'),
    path('deleteChatRoom/<int:id>', views.delete_chat_room, name='delete-chat-room'),
    path('chatRooms/<str:username>', views.chat_rooms_list, name='chat-rooms-list'),
    path('chatRoom/messages/<str:room_id>', views.chat_room_messages, name='chat-room-messages'),
    path('allRoomMembers/<str:chat_room_name>', views.all_chat_room_memebers, name='all-chat-room-memebers'),
    path('listAllFriends', views.list_all_friends, name='list-all-friends'),
    path('Directs/messages', views.direct_messages, name='direct-messages'),
    path('chatRoomInvitations/<str:username>', views.rooms_invitations, name='room-invitations'),
    path('suggestedChatRooms/<str:username>', views.suggested_chat_rooms, name='suggested-chat-rooms'),
    path('changeChatRoomCover', views.chat_room_update_cover, name='chat-room-update-cover'),
    path('chatRoomMembersList', views.chat_room_members_list, name='chat-room-members-list'),
    path('accpetChatRoomInvite', views.accept_chat_room_invite, name='accept-chat-room-invite'),     
    path('joinChatRoom', views.join_chat_room, name='join-chat-room'),     
    path('cancelChatRoomInvite', views.cancel_chat_room_invite, name='cancel-chat-room-invite'),
    path('resetUndreadMessages', views.reset_unread_messages, name='reset-unread-messages'),
    path('resetChatRoomUndreadMessages', views.reset_chat_room_unread_messages),
    path('firendwithdirects/<str:username>', views.friends_with_directs),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
