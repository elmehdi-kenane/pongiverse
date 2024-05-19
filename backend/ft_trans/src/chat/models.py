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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_friends')
    friend = models.ForeignKey(User, on_delete=models.CASCADE)
    isBlocked = models.BooleanField(default=False)

class Directs(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direct_sender')
    reciver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direct_reciver')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
