from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import datetime
from django.utils import timezone
from myapp.models import customuser
import random

# class RoomIDManager(models.Manager):
#     def generate_unique_room_id(self):
#         while True:
#             room_id = random.randint(1000, 9999)  # Adjust the range as needed
#             if not ActiveMatch.objects.filter(room_id=room_id).exists() and not Match.objects.filter(room_id=room_id).exists():
#                 return room_id

class Match(models.Model):
    mode = models.CharField(max_length=255)
    team1_player1 = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='team1_player1')
    team1_player2 = models.ForeignKey(customuser, on_delete=models.CASCADE, null=True, related_name='team1_player2')
    team2_player1 = models.ForeignKey(customuser, on_delete=models.CASCADE, related_name='team2_player1')
    team2_player2 = models.ForeignKey(customuser, on_delete=models.CASCADE, null=True, related_name='team2_player2')
    team1_score = models.PositiveIntegerField(default=0)
    team2_score = models.PositiveIntegerField(default=0)
    date_started = models.DateTimeField(default=timezone.now)
    date_ended = models.DateTimeField(default=timezone.now)
    match_status = models.CharField(max_length=255)

class ActiveMatch(models.Model):
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

# room_id_manager = RoomIDManager()
