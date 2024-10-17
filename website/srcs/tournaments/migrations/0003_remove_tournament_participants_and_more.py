# Generated by Django 4.2 on 2024-10-15 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0002_remove_tournament_participantdico_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='participants',
        ),
        migrations.AddField(
            model_name='tournament',
            name='participants',
            field=models.JSONField(default=list),
        ),
    ]
