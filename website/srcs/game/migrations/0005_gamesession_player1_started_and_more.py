# Generated by Django 4.2 on 2024-09-17 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_gamesession_bot_gamesession_bot_difficulty_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamesession',
            name='player1_started',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='gamesession',
            name='player2_started',
            field=models.BooleanField(default=False),
        ),
    ]