# Generated by Django 4.2.11 on 2024-07-05 15:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ActiveMatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode', models.CharField(max_length=255)),
                ('room_type', models.CharField(max_length=255)),
                ('room_id', models.PositiveBigIntegerField(unique=True)),
                ('status', models.CharField(max_length=255)),
                ('winner', models.PositiveIntegerField(default=0)),
                ('ballX', models.IntegerField(default=0)),
                ('ballY', models.IntegerField(default=0)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tournament_id', models.IntegerField(unique=True)),
                ('is_started', models.BooleanField(default=False)),
                ('is_finished', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentMembers',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_owner', models.BooleanField(default=False)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_members', to='mainApp.tournament')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_member', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receiver', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to=settings.AUTH_USER_MODEL)),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Invitation_tournament', to='mainApp.tournament')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerState',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('state', models.CharField(max_length=255)),
                ('playerNo', models.PositiveIntegerField(default=0)),
                ('paddleX', models.IntegerField(default=0)),
                ('paddleY', models.IntegerField(default=0)),
                ('score', models.PositiveIntegerField(default=0)),
                ('active_match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_state', to='mainApp.activematch')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='NotifPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active_match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notify_player', to='mainApp.activematch')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mode', models.CharField(max_length=255)),
                ('room_id', models.PositiveBigIntegerField(unique=True)),
                ('team1_score', models.PositiveIntegerField(default=0)),
                ('team2_score', models.PositiveIntegerField(default=0)),
                ('team1_status', models.CharField(max_length=255)),
                ('team2_status', models.CharField(max_length=255)),
                ('date_started', models.DateTimeField(default=django.utils.timezone.now)),
                ('date_ended', models.DateTimeField(default=django.utils.timezone.now)),
                ('match_status', models.CharField(max_length=255)),
                ('team1_player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='team1_player1', to=settings.AUTH_USER_MODEL)),
                ('team1_player2', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='team1_player2', to=settings.AUTH_USER_MODEL)),
                ('team2_player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='team2_player1', to=settings.AUTH_USER_MODEL)),
                ('team2_player2', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='team2_player2', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='GameNotifications',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('active_match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_notify_active_match', to='mainApp.activematch')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notify_target', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notify_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
