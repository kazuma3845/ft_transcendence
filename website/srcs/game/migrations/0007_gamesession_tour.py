# Generated by Django 4.2 on 2024-10-11 13:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '__first__'),
        ('game', '0006_alter_gamesession_player1'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamesession',
            name='tour',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='tournaments.tournament'),
        ),
    ]
