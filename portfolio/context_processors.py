from datetime import datetime

def email_verification_status(request):
    if hasattr(request, 'user') and request.user.is_authenticated:
        if hasattr(request.user, 'profile') and not request.user.profile.email_confirmed:
            return {'email_not_verified': True}
    return {}

def site_context(request):
    return {
        'current_year': datetime.now().year
    }
