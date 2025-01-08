from django.db import models
from myapp.models import customuser

# Create your models here.

class Notification(models.Model):
    user = models.ForeignKey(customuser, related_name="user_notifications", on_delete=models.CASCADE)
    avatar = models.TextField()
    notification_text = models.TextField()
    url_redirection = models.TextField()
    is_read = models.BooleanField()
    send_at = models.DateTimeField(auto_now_add=True)
