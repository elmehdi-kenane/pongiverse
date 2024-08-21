from django.urls import path
from . import views

urlpatterns = [
    path('profile/<str:username>', views.list_users),
    path('add/<str:username>', views.add_users),
    path('friends/<str:username>', views.show_friends),
    path('firendwithdirects/<str:username>', views.friends_with_directs),

    path('getUserData/<str:username>', views.getUserData),
    path('updateUserPic', views.update_user_pic),
    path('updateUserBg', views.update_user_bg),
    path('updateUserName', views.update_username),
    path('updateUserBio', views.update_user_bio),
    path('updateUserCountry', views.update_user_country),
    path('updatePassword', views.update_user_password),
    path('getUserFriends/<str:userId>', views.get_user_friends),
    # path('getUserImage/<str:username>', views.get_user_image),
    path('getUsersData/<str:username>', views.get_users_data),
    path('getUserGames/<str:username>', views.get_user_games_wl),
    path('getUserStcs/<str:username>/<int:date_range>', views.get_user_statistics),
    path('getSingleMatches/<str:username>', views.get_single_matches),
]