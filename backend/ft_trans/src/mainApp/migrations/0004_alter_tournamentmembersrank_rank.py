# Generated by Django 4.2.11 on 2024-07-07 14:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainApp', '0003_tournamentmembersrank'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournamentmembersrank',
            name='rank',
            field=models.CharField(max_length=255),
        ),
    ]
