from django.db import models
from django.conf import settings
User = settings.AUTH_USER_MODEL

def default_cover():
	return 'uploads_default/roomCover.png'

def default_icon():
	return 'uploads_default/roomIcon.png'

class Room(models.Model):
  name = models.CharField(max_length=100)
  members = models.ManyToManyField(User, related_name='rooms', through='Membership')
  topic = models.TextField(blank=True)
  icon = models.ImageField(upload_to='uploads/', default=default_icon)
  cover = models.ImageField(upload_to='uploads/',default=default_cover)
  members_count = models.IntegerField(default=0)
  visiblity = models.TextField(default='public')
  password = models.CharField(max_length=128)

class Membership(models.Model):
	user = models.ForeignKey(User,on_delete=models.CASCADE)
	room = models.ForeignKey(Room,on_delete=models.CASCADE)
	role = models.TextField(default='member')
	joined_at = models.DateTimeField(auto_now_add=True)
	unreadCount = models.BigIntegerField(default=0)

class Message(models.Model):
	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
	room = models.ForeignKey(Room, on_delete=models.CASCADE)
	content = models.TextField(blank=True)
	timestamp = models.DateTimeField(auto_now_add=True)


class Directs(models.Model):
  sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direct_sender')
  receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direct_receiver')
  message = models.TextField()
  timestamp = models.DateTimeField(auto_now_add=True)
  is_read = models.BooleanField(default=False)

class RoomInvitation(models.Model):
    INVITATION_STATUS = {
        ("PEN", "pending"),
        ("ACC" , 'accepted')
    }
    user=models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitation_receiver')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='invitation_room')
    status = models.CharField(max_length=20,choices=INVITATION_STATUS, default='pending' )
