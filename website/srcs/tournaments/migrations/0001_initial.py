# Generated by Django 4.2 on 2024-10-11 13:35

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('power', models.BooleanField(blank=True, null=True)),
                ('win_number', models.IntegerField(default=3)),
                ('move_speed_ball', models.IntegerField(default=6, validators=[django.core.validators.MaxValueValidator(10)])),
                ('move_speed_paddle', models.IntegerField(default=4, validators=[django.core.validators.MaxValueValidator(10)])),
                ('participantNum', models.IntegerField(default=0)),
                ('participantDico', models.JSONField(default=dict)),
                ('game_1_1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_1_1', to='game.gamesession')),
                ('game_1_2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_1_2', to='game.gamesession')),
                ('game_2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_2', to='game.gamesession')),
            ],
        ),
    ]
