from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser


def default_image():
	return '../avatar.png'

class customuser(AbstractUser):
	username = models.CharField(unique=True, max_length=100)
	email = models.EmailField(unique=True)
	password = models.CharField(max_length=100)
	avatar = models.ImageField(upload_to='uploads/', default=default_image)
	is_active = models.BooleanField(default=True)
	is_online = models.BooleanField(default=False)
	is_playing = models.BooleanField(default=False)
	level = models.PositiveIntegerField(default=0)
	total_xp = models.PositiveIntegerField(default=0)

	def save(self, *args, **kwargs):
		self.password = make_password(self.password)
		super().save(*args, **kwargs)
