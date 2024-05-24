from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
	path('onlineFriends', views.online_friends, name='friends'),
	path('getImage', views.serve_image, name='image'),
	path('get_user', views.get_user, name='get_user'),
	path('create_tournament', views.create_tournament, name='create_tournament'),
]