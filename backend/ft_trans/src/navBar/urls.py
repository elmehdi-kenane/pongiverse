# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('search_view/', views.search_view, name='search_view'),
]