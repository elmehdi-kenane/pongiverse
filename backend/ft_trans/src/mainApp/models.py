from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime

class User(AbstractUser):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

class Match(models.Model):
    mode = models.CharField(max_length=255)
    team1_player1 = models.ForeignKey(User, on_delete=models.CASCADE)
    team1_player2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    team2_player1 = models.ForeignKey(User, on_delete=models.CASCADE)
    team2_player2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    team1_score = models.PositiveIntegerField(default=0)
    team2_score = models.PositiveIntegerField(default=0)
    date_started = models.DateTimeField(default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    date_ended = models.DateTimeField(default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))