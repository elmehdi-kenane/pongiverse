from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser

def default_image():
	return 'uploads_default/avatar.png'

def default_bg():
	return 'uploads_default/bg.jpg'

class customuser(AbstractUser):
	username = models.CharField(unique=True, max_length=8)
	email = models.EmailField(unique=True, max_length=320)
	password = models.CharField(max_length=100)
	avatar = models.ImageField(upload_to='uploads/', default=default_image)
	is_active = models.BooleanField(default=True)
	is_online = models.BooleanField(default=False)
	is_playing = models.BooleanField(default=False)
	is_tfq = models.BooleanField(default=False)

	background_pic = models.ImageField(upload_to='uploads/', default=default_bg)
	bio = models.CharField(max_length=150, default='')
	country = models.CharField(max_length=10, default='MA')
