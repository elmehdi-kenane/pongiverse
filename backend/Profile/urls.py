from django.urls import path
from . import views

urlpatterns = [

    #------ Settings ------
    path('getUserData', views.getUserData),
    
    
    path('updateUserPic', views.update_user_pic),
    path('updateUserBg', views.update_user_bg),
    path('updateUserBio', views.update_user_bio),
    path('updateUserCountry', views.update_user_country),
    path('updatePassword', views.update_user_password),

    path('EnableTFQ', views.enable_user_tfq), #TFQ
    path('ValidateTFQ', views.validate_user_tfq),
    path('DisableTFQ', views.disable_user_tfq),
    path('CheckUserTFQ', views.check_user_tfq),

    #------ Profile ------
    path('getUserDataProfile/<str:user_profile>', views.getUserDataProfile),
    path('getUserFriends/<str:user_profile>', views.get_user_friends),
    path('CheckFriendship/<str:user_profile>', views.check_friendship),
    path('getUserDiagram/<str:user_profile>', views.get_user_diagram),
    path('getUserMatches1vs1/<str:user_profile>/<int:page>', views.get_user_games),
    path('reportUser', views.report_user),
    path('getUserStcsProfile/<str:user_profile>', views.get_user_statistics_profile),
    
    #------ Dashboard ------
    path('getUsersRank', views.get_users_rank),
    path('getUserGames', views.get_user_games_wl),
    path('getUserStcsDash', views.get_user_statistics_dashboard),

    path('getSingleMatches/<int:page>', views.get_single_matches),
    path('getSingleMatchDtl/<int:match_id>', views.get_single_match_dtl),
    path('getMultiplayerMatches/<int:page>', views.get_multiplayer_matches),
    path('getMultyMatchDtl/<int:match_id>', views.get_multy_match_dtl),

    path('getTournMatches/<int:page>/<int:items>', views.get_tourn_matches),
]