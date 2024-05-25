from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime
from django.utils import timezone
from myapp.models import customuser
import random

class Match(models.Model):
    mode = models.CharField(max_length=255)
    room_id = models.PositiveBigIntegerField(unique=True)
    team1_player1 = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='team1_player1')
    team1_player2 = models.ForeignKey(customuser, on_delete=models.CASCADE, null=True, related_name='team1_player2')
    team2_player1 = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='team2_player1')
    team2_player2 = models.ForeignKey(customuser, on_delete=models.CASCADE, null=True, related_name='team2_player2')
    team1_score = models.PositiveIntegerField(default=0)
    team2_score = models.PositiveIntegerField(default=0)
    team1_status = models.CharField(max_length=255)
    team2_status = models.CharField(max_length=255)
    date_started = models.DateTimeField(default=timezone.now)
    date_ended = models.DateTimeField(default=timezone.now)
    match_status = models.CharField(max_length=255)

class ActiveMatch(models.Model):
    mode = models.CharField(max_length=255)
    room_type = models.CharField(max_length=255)
    room_id = models.PositiveBigIntegerField(unique=True)
    status = models.CharField(max_length=255)
    winner = models.PositiveIntegerField(default=0)
    ballX = models.IntegerField(default=0)
    ballY = models.IntegerField(default=0)

class PlayerState(models.Model):
    active_match = models.ForeignKey(ActiveMatch, on_delete=models.CASCADE, related_name='player_state')
    player = models.ForeignKey(customuser, on_delete=models.CASCADE)
    state = models.CharField(max_length=255)
    playerNo = models.PositiveIntegerField(default=0)
    paddleX = models.IntegerField(default=0)
    paddleY = models.IntegerField(default=0)
    score = models.PositiveIntegerField(default=0)

class NotifPlayer(models.Model):
    active_match = models.ForeignKey(ActiveMatch, on_delete=models.CASCADE, related_name='notify_player')
    player = models.ForeignKey(customuser, on_delete=models.CASCADE)

# class GameNotifications(models.Model):


# room_id_manager = RoomIDManager()
