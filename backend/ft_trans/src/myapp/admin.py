from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import customuser

class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'password']

admin.site.register(customuser, CustomUserAdmin)