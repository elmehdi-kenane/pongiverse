# Generated by Django 5.0.3 on 2024-03-29 18:17

import myapp.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(default=myapp.models.default_image, upload_to='uploads/'),
        ),
    ]
