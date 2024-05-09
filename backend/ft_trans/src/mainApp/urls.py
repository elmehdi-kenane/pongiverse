from django.urls import path
from . import views

urlpatterns = [
    path('allFriends', views.friends, name='friends'),
]