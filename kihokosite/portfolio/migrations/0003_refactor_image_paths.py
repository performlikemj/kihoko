from django.db import migrations

def update_paths(apps, schema_editor):
    Project = apps.get_model('portfolio', 'Project')
    ProjectImage = apps.get_model('portfolio', 'ProjectImage')
    
    # Update Project image paths
    for project in Project.objects.all():
        if project.image and 'project_images' in project.image.name:
            new_name = project.image.name.replace('project_images', 'projects')
            project.image.name = new_name
            project.save()
    
    # Update ProjectImage paths
    for image in ProjectImage.objects.all():
        if image.image and 'project_images' in image.image.name:
            new_name = image.image.name.replace('project_images', 'projects')
            image.image.name = new_name
            image.save()

class Migration(migrations.Migration):
    dependencies = [
        ('portfolio', '0002_update_image_paths'),  # Update this
    ]

    operations = [
        migrations.RunPython(update_paths),
    ]