# Generated by Django 4.1.7 on 2023-04-20 05:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0005_cart_cartitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='merchandise',
            name='stock',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
