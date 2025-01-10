from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
	path('onlineFriends', views.online_friends, name='friends'),
	path('get_user', views.get_user, name='get_user'),
	path('notifsFriends', views.notifs_friends, name='notifs_friends'),
	path('getUserImage', views.user_image, name='image'),
	path('tournament-members', views.tournament_members, name='tournament_members'),
	path('started-tournament-members', views.started_tournament_members, name='started_tournament_members'),
	path('get-tournament-member', views.get_tournament_member, name='get_tournament_member'),
	path('get-tournament-data', views.get_tournament_data, name='get_tournament_member'),
	path('get-tournament-suggestions', views.get_tournament_suggestions, name='get_tournament_suggestions'),
	path('is-joining-tournament', views.is_joining_tournament, name='is_joining_tournament'),
	path('get-tournament-size', views.get_tournament_size, name='get_tournament_size'),
	path('is-started-and-not-finshed', views.is_started_and_not_finshed, name='is_started_and_not_finshed'),
	path('customizeGame', views.customize_game, name='image'),
	path('getCustomizeGame', views.get_customize_game, name='image'),
	path('set-is-inside', views.set_is_inside, name='set_is_inside'),
	path('get-game-members-round', views.get_game_members_round, name='get_game_members_round'),
	path('get-opponent', views.get_opponent, name='get_opponent'),
	path('get-tournament-warning', views.get_tournament_warning, name='get_tournament_warning'),
	path('player-situation', views.player_situation, name='player_situation'),
	path('get-tournament-members-rounds', views.get_tournament_members_rounds, name='get_tournament_members_rounds'),
	path('check_is_in_game', views.check_is_in_game, name='check_is_in_game'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


