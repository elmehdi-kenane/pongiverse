from django.db import models
from myapp.models import customuser
# Create your models here.

class FriendRequest(models.Model):
    SENT = 'sent'
    RECEIVED = 'received'
    
    STATUS_CHOICES = [
        (SENT, 'sent'),
        (RECEIVED, 'received'),
    ]

    from_user = models.ForeignKey(customuser, related_name="from_users", on_delete=models.CASCADE)
    to_user = models.ForeignKey(customuser, related_name="to_users", on_delete=models.CASCADE)
    send_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=20)

class Friendship(models.Model):
    BLOCK_NONE = 'none'
    BLOCKER = 'blocker'
    BLOCKED = 'blocked'

    BLOCK_CHOICES = [
        (BLOCK_NONE, 'No Block'),
        (BLOCKER, 'blocker'),
        (BLOCKED, 'blocked')
    ]

    user = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='user_friends')
    friend = models.ForeignKey(customuser, on_delete=models.CASCADE)
    block_status = models.CharField(
        max_length=15,
        choices=BLOCK_CHOICES,
        default=BLOCK_NONE
    )
