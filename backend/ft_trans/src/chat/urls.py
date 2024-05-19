from django.urls import path
from . import views

urlpatterns = [
    path('channels/<str:username>', views.channel_list, name='channel-list'),
    path('channels/messages/<str:room_id>', views.channel_messages, name='channel-messages'),
    path('directsWithMessage/<str:username>', views.channel_messages, name='channel-messages')
]
