from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
	path('onlineFriends', views.online_friends, name='friends'),
	path('getImage', views.serve_image, name='image'),
	path('get_user', views.get_user, name='get_user'),
	path('create_tournament', views.create_tournament, name='create_tournament'),
    path('notifsFriends', views.notifs_friends, name='notifs_friends'),
    path('getUserImage', views.user_image, name='image'),
	path('tournament-members', views.tournament_members, name='tournament_members'),
	path('get-notifications', views.get_notifications, name='get_notifications'),
	path('get-tournament-member', views.get_tournament_member, name='get_tournament_member'),
	path('get-tournament-data', views.get_tournament_data, name='get_tournament_member'),
	path('get-tournament-suggestions', views.get_tournament_suggestions, name='get_tournament_suggestions'),
]