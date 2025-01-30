from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
import os
from django.conf import settings

def unique_file_path(instance, filename):
    """Ensures file uniqueness by renaming duplicates with model-specific paths"""
    if isinstance(instance, (Project, ProjectImage)):
        upload_dir = 'projects'
    elif isinstance(instance, MerchandiseImage):
        upload_dir = 'merchandise'
    else:
        upload_dir = 'misc'

    # Create full path
    full_path = os.path.join(settings.MEDIA_ROOT, upload_dir)
    if not os.path.exists(full_path):
        os.makedirs(full_path)

    base, ext = os.path.splitext(filename)
    new_filename = f"{base}{ext}"
    counter = 1
    
    while os.path.exists(os.path.join(full_path, new_filename)):
        new_filename = f"{base}_{counter}{ext}"
        counter += 1
        
    return os.path.join(upload_dir, new_filename)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to=unique_file_path)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        # Delete the image file when the model instance is deleted
        if self.image:
            default_storage.delete(self.image.path)
        super().delete(*args, **kwargs)

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=unique_file_path)
    title = models.CharField(max_length=200, default='test')

    def __str__(self):
        return f"{self.project.title} - Project Image {self.pk}"

    def delete(self, *args, **kwargs):
        if self.image:
            default_storage.delete(self.image.path)
        super().delete(*args, **kwargs)

class Merchandise(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)  # Add this line


class MerchandiseImage(models.Model):
    merchandise = models.ForeignKey(Merchandise, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=unique_file_path)
    title = models.CharField(max_length=200, default='Merch Image')

    def __str__(self):
        return f"{self.merchandise.title} - Image {self.pk}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    merchandise = models.ForeignKey(Merchandise, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
