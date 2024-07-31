from django.urls import path
from . import views

urlpatterns = [
    path('profile/<str:username>', views.list_users),
    path('add/<str:username>', views.add_users),
    path('friends/<str:username>', views.show_friends),
    path('firendwithdirects/<str:username>', views.friends_with_directs),

    path('getUserData', views.getUserData),
    path('updateUserPic', views.update_user_pic),
    path('updateUserBg', views.update_user_bg),
    path('updateUserName', views.update_username),
]