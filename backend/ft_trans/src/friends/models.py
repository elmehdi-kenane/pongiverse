from django.db import models
from myapp.models import customuser
# Create your models here.

class FriendRequest(models.Model):
    SENT = 'sent'
    RECIEVED = 'recieved'
    
    STATUS_CHOICES = [
        (SENT, 'sent'),
        (RECIEVED, 'recieved'),
    ]
    from_user = models.ForeignKey(customuser, related_name="from_users", on_delete=models.CASCADE)
    to_user = models.ForeignKey(customuser, related_name="to_users", on_delete=models.CASCADE)
    send_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=20)

class Friendship(models.Model):
	user = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='user_friends')
	friend = models.ForeignKey(customuser, on_delete=models.CASCADE)
	isBlocked = models.BooleanField(default=False)