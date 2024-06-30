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
	path('started-tournament-members', views.started_tournament_members, name='started_tournament_members'),
	path('get-notifications', views.get_notifications, name='get_notifications'),
	path('get-tournament-member', views.get_tournament_member, name='get_tournament_member'),
	path('get-tournament-data', views.get_tournament_data, name='get_tournament_member'),
	path('get-tournament-suggestions', views.get_tournament_suggestions, name='get_tournament_suggestions'),
	path('is-joining-tournament', views.is_joining_tournament, name='is_joining_tournament'),
	path('get-tournament-size', views.get_tournament_size, name='get_tournament_size'),
	path('is-started-and-not-finshed', views.is_started_and_not_finshed, name='is_started_and_not_finshed'),
]