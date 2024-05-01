# from django.db import models
# from django.contrib.auth.models import AbstractUser
# from datetime import datetime
# from django.utils import timezone

# class User(AbstractUser):
#     name = models.CharField(max_length=255)
#     email = models.CharField(max_length=255, unique=True)
#     password = models.CharField(max_length=255)
#     username = None

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = []

# class Match(models.Model):
#     mode = models.CharField(max_length=255)
#     team1_player1 = models.ForeignKey(User, on_delete=models.CASCADE)
#     team1_player2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
#     team2_player1 = models.ForeignKey(User, on_delete=models.CASCADE)
#     team2_player2 = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
#     team1_score = models.PositiveIntegerField(default=0)
#     team2_score = models.PositiveIntegerField(default=0)
#     date_started = models.DateTimeField(default=timezone.now)
#     date_ended = models.DateTimeField(default=timezone.now)

# class ActiveMatch(models.Model):
#     room_id = models.PositiveBigIntegerField(unique=True)
#     status = models.CharField(max_length=255)
#     winner = models.PositiveIntegerField(default=0)
#     ballX = models.IntegerField(default=0)
#     ballY = models.IntegerField(default=0)
#     date_started = models.DateTimeField(default=timezone.now)
#     date_ended = models.DateTimeField(null=True)

# class PlayerState(models.Model):
#     active_match = models.ForeignKey(ActiveMatch, on_delete=models.CASCADE, related_name='player_state')
#     player = models.ForeignKey(User, on_delete=models.CASCADE)
#     state = models.CharField(max_length=255)
#     playerNo = models.PositiveIntegerField(default=0)
#     paddleX = models.IntegerField(default=0)
#     paddleY = models.IntegerField(default=0)
#     score = models.PositiveIntegerField(default=0)