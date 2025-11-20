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
    # Store blob name instead of actual file
    featured_image_blob = models.CharField(max_length=500, blank=True, null=True, 
                                          help_text="Azure blob name for featured image")
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.title
    
    @property
    def featured_image_url(self):
        """Get the URL for the featured image from Azure Blob Storage"""
        if self.featured_image_blob:
            from .azure_service import azure_blob_service
            return azure_blob_service.get_image_url(self.featured_image_blob)
        return None

    def delete(self, *args, **kwargs):
        # Delete the blob when the model instance is deleted
        if self.featured_image_blob:
            from .azure_service import azure_blob_service
            azure_blob_service.delete_image(self.featured_image_blob)
        super().delete(*args, **kwargs)

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='images')
    # Store blob name instead of actual file
    image_blob = models.CharField(max_length=500, help_text="Azure blob name for image")
    title = models.CharField(max_length=200, default='Untitled')
    description = models.TextField(blank=True, help_text="Optional image description")
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.project.title} - {self.title}"
    
    @property
    def image_url(self):
        """Get the URL for the image from Azure Blob Storage"""
        if self.image_blob:
            from .azure_service import azure_blob_service
            return azure_blob_service.get_image_url(self.image_blob)
        return None

    def delete(self, *args, **kwargs):
        # Delete the blob when the model instance is deleted
        if self.image_blob:
            from .azure_service import azure_blob_service
            azure_blob_service.delete_image(self.image_blob)
        super().delete(*args, **kwargs)


class FlashDesign(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    image_blob = models.CharField(max_length=500, help_text="Azure blob name for flash artwork")
    is_available = models.BooleanField(default=True, help_text="Uncheck when this design has been claimed")
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Flash design"
        verbose_name_plural = "Flash designs"

    def __str__(self):
        return self.title

    @property
    def image_url(self):
        if self.image_blob:
            from .azure_service import azure_blob_service
            return azure_blob_service.get_image_url(self.image_blob)
        return None

    def delete(self, *args, **kwargs):
        if self.image_blob:
            from .azure_service import azure_blob_service
            azure_blob_service.delete_image(self.image_blob)
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
