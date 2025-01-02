from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('mainApp.urls')),
    path('auth/', include('myapp.urls')),
    path('chatAPI/',include('chat.urls')),
    path('profile/', include('Profile.urls')),
    path('navBar/', include('navBar.urls')),
    path('friends/',include('friends.urls')),
    path('', include('django_prometheus.urls')),
]
