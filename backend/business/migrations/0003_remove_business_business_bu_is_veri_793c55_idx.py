# Generated by Django 3.2.25 on 2025-05-24 13:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('business', '0002_business_business_bu_is_veri_793c55_idx'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='business',
            name='business_bu_is_veri_793c55_idx',
        ),
    ]
