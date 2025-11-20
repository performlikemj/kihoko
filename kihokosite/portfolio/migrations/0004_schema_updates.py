from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0003_refactor_image_paths'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='image',
            new_name='featured_image_blob',
        ),
        migrations.AlterField(
            model_name='project',
            name='featured_image_blob',
            field=models.CharField(blank=True, help_text='Azure blob name for featured image', max_length=500, null=True),
        ),
        migrations.RenameField(
            model_name='projectimage',
            old_name='image',
            new_name='image_blob',
        ),
        migrations.AlterField(
            model_name='projectimage',
            name='image_blob',
            field=models.CharField(help_text='Azure blob name for image', max_length=500),
        ),
        migrations.AlterField(
            model_name='projectimage',
            name='title',
            field=models.CharField(default='Untitled', max_length=200),
        ),
        migrations.AddField(
            model_name='projectimage',
            name='description',
            field=models.TextField(blank=True, help_text='Optional image description'),
        ),
        migrations.AddField(
            model_name='projectimage',
            name='order',
            field=models.PositiveIntegerField(default=0, help_text='Display order'),
        ),
        migrations.AddField(
            model_name='projectimage',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
