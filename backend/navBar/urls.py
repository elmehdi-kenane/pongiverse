# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('search_view/', views.search_view, name='search_view'),
    path('add_notification/', views.add_notification, name='add_notification'),
    path('clear_all_notifications/', views.clear_all_notifications, name='clear_all_notifications'),
    path('get_notifications/<str:username>', views.get_notifications, name='get_notifications'),
    path('mark_notifications_as_read/<str:username>', views.mark_notifications_as_read, name='mark_notifications_as_read'),
]