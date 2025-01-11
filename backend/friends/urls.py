# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('add_friend_request/', views.add_friend_request, name='add_friend_request'), #hadi to9ba 
    path('cancel_friend_request/', views.cancel_friend_request, name='cancel_friend_request'),
    path('remove_friendship/', views.remove_friendship, name='remove_friendship'),
    path('block_friend/', views.block_friend, name='block_friend'),
    path('unblock_friend/', views.unblock_friend, name='unblock_friend'),
    path('confirm_friend_request/', views.confirm_friend_request, name='confirm_friend_request'),
    path('get_friend_list', views.get_friend_list, name='get_friend_list'),
    path('get_blocked_list', views.get_blocked_list, name='get_blocked_list'),
    path('get_sent_requests', views.get_sent_requests, name='get_sent_requests'),
    path('get_received_requests', views.get_received_requests, name='get_received_requests'),
    path('get_friend_suggestions', views.get_friend_suggestions, name='get_friend_suggestions'),
]