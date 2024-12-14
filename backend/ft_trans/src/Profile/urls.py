from django.urls import path
from . import views

urlpatterns = [

    #------ Settings ------
    path('getUserData/<str:username>', views.getUserData), #SettingsContext
    
    path('updateUserPic', views.update_user_pic),
    path('updateUserBg', views.update_user_bg),
    path('updateUserName', views.update_username),
    path('updateUserBio', views.update_user_bio),
    path('updateUserCountry', views.update_user_country),
    path('updatePassword', views.update_user_password),

    path('EnableTFQ', views.enable_user_tfq), #TFQ
    path('ValidateTFQ', views.validate_user_tfq),
    path('DisableTFQ', views.disable_user_tfq),
    path('CheckUserTFQ', views.check_user_tfq),

    #------ Profile ------
    path('getUserFriends/<str:username>', views.get_user_friends),
    path('CheckFriendship/<str:username>/<str:username2>', views.check_friendship),
    path('getUserDiagram/<str:username>', views.get_user_diagram),
    path('getUserMatches1vs1/<str:username>/<int:page>', views.get_user_games),
    
    #------ Dashboard ------
    path('getUsersRank/<str:username>', views.get_users_rank),
    path('getUserGames/<str:username>', views.get_user_games_wl),
    path('getUserStcs/<str:username>/<int:date_range>', views.get_user_statistics),

    path('getSingleMatches/<str:username>/<int:page>', views.get_single_matches),
    path('getSingleMatchDtl/<int:match_id>', views.get_single_match_dtl),
    path('getMultiplayerMatches/<str:username>/<int:page>', views.get_multiplayer_matches),
    path('getMultyMatchDtl/<int:match_id>', views.get_multy_match_dtl),

    path('getTournMatches/<str:username>/<int:page>/<int:items>', views.get_tourn_matches),
]