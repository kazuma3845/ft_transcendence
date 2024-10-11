# Generated by Django 4.2 on 2024-10-11 14:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='users/static/avatars/'),
        ),
        migrations.CreateModel(
            name='Friendship',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('accepted', models.BooleanField(default=False)),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friends_initiated', to='users.userprofile')),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='friends_received', to='users.userprofile')),
            ],
        ),
        migrations.AddConstraint(
            model_name='friendship',
            constraint=models.CheckConstraint(check=models.Q(('from_user', models.F('to_user')), _negated=True), name='prevent_self_friendship'),
        ),
        migrations.AlterUniqueTogether(
            name='friendship',
            unique_together={('from_user', 'to_user')},
        ),
    ]
