from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser


def default_image():
	return 'uploads/avatar.png'

class customuser(AbstractUser):
	username = models.CharField(unique=True, max_length=100)
	email = models.EmailField(unique=True)
	password = models.CharField(max_length=100)
	avatar = models.ImageField(upload_to='uploads/', default=default_image)
	is_active = models.BooleanField(default=True)
	is_online = models.BooleanField(default=False)
	is_playing = models.BooleanField(default=False)