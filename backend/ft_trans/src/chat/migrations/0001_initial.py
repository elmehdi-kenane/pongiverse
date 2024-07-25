# Generated by Django 4.2.11 on 2024-07-25 14:23

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('roles', models.TextField(default='member')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('topic', models.TextField(blank=True)),
                ('icon', models.ImageField(upload_to='uploads/')),
                ('members_count', models.IntegerField(default=0)),
                ('visiblity', models.TextField(default='public')),
                ('password', models.CharField(max_length=128)),
                ('members', models.ManyToManyField(related_name='rooms', through='chat.Membership', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='RoomInvitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('PEN', 'pending'), ('ACC', 'accepted')], default='pending', max_length=20)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitation_room', to='chat.room')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitation_reciver', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(blank=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chat.room')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='membership',
            name='room',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chat.room'),
        ),
        migrations.AddField(
            model_name='membership',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Friends',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('isBlocked', models.BooleanField(default=False)),
                ('friend', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_friends', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Directs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('is_read', models.BooleanField(default=False)),
                ('reciver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='direct_reciver', to=settings.AUTH_USER_MODEL)),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='direct_sender', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
