"""
API Configuration and Utilities for Portfolio App
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Create authentication token for new users"""
    if created:
        Token.objects.create(user=instance)


# API Response utilities
class APIResponse:
    """Utility class for consistent API responses"""
    
    @staticmethod
    def success(data=None, message="Success"):
        """Return success response format"""
        response = {"status": "success", "message": message}
        if data is not None:
            response["data"] = data
        return response
    
    @staticmethod
    def error(message="An error occurred", errors=None):
        """Return error response format"""
        response = {"status": "error", "message": message}
        if errors is not None:
            response["errors"] = errors
        return response 