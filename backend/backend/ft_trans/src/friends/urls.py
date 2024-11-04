# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('add_friend_request/', views.add_friend_request, name='add_friend_request'),
    path('cancel_friend_request/', views.cancel_friend_request, name='cancel_friend_request'),
    path('remove_friendship/', views.remove_friendship, name='remove_friendship'),
    path('block_friend/', views.block_friend, name='block_friend'),
    path('unblock_friend/', views.unblock_friend, name='unblock_friend'),
    path('confirm_friend_request/', views.confirm_friend_request, name='confirm_friend_request'),
    path('get_friend_list/<str:username>', views.get_friend_list, name='get_friend_list'),
    path('get_blocked_list/<str:username>', views.get_blocked_list, name='get_blocked_list'),
    path('get_sent_requests/<str:username>', views.get_sent_requests, name='get_sent_requests'),
    path('get_recieved_requests/<str:username>', views.get_recieved_requests, name='get_recieved_requests'),
    path('get_friend_suggestions/<str:username>', views.get_friend_suggestions, name='get_friend_suggestions'),
]