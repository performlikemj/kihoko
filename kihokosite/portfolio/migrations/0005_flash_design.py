from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0004_schema_updates'),
    ]

    operations = [
        migrations.CreateModel(
            name='FlashDesign',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=150)),
                ('description', models.TextField(blank=True)),
                ('image_blob', models.CharField(help_text='Azure blob name for flash artwork', max_length=500)),
                ('is_available', models.BooleanField(default=True, help_text='Uncheck when this design has been claimed')),
                ('order', models.PositiveIntegerField(default=0, help_text='Lower numbers appear first')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Flash design',
                'verbose_name_plural': 'Flash designs',
                'ordering': ['order', '-created_at'],
            },
        ),
    ]
