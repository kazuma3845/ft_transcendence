# Generated by Django 4.2 on 2024-10-18 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_alter_userprofile_avatar_alter_userprofile_banner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='media/avatars/'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='banner',
            field=models.ImageField(blank=True, null=True, upload_to='media/banners/'),
        ),
    ]
