from django.db import models
from django.conf import settings
User = settings.AUTH_USER_MODEL


class Room(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name='rooms', through='Membership')
    # icon = models.ImageField(upload_to ='uploads/') 
    topic = models.TextField(blank=True)


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Membership(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    room = models.ForeignKey(Room,on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)