from django.db import models
from django.conf import settings
User = settings.AUTH_USER_MODEL


class Room(models.Model):
	name = models.CharField(max_length=100)
	members = models.ManyToManyField(User, related_name='rooms', through='Membership')
	topic = models.TextField(blank=True)


class Message(models.Model):
	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
	room = models.ForeignKey(Room, on_delete=models.CASCADE)
	content = models.TextField(blank=True)
	timestamp = models.DateTimeField(auto_now_add=True)

class Membership(models.Model):
	user = models.ForeignKey(User,on_delete=models.CASCADE)
	room = models.ForeignKey(Room,on_delete=models.CASCADE)
	joined_at = models.DateTimeField(auto_now_add=True)

class Friends(models.Model):
<<<<<<< HEAD
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friends_user')
=======
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_friends')
>>>>>>> d9244a1f3aad9aa9c9c1376e7371c70df57218cc
	friend = models.ForeignKey(User, on_delete=models.CASCADE)
	isBlocked = models.BooleanField(default=False)