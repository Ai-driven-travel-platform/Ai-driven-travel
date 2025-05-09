# Generated by Django 3.2.25 on 2025-05-01 07:47

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('destinations', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='destination',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='destinations', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='destinationreview',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='destination_reviews', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='saveddestination',
            name='destination',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='destinations.destination'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='saveddestination',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='saved_destinations', to=settings.AUTH_USER_MODEL),
        ),
    ]
