from datetime import datetime

def email_verification_status(request):
    if request.user.is_authenticated and not request.user.profile.email_confirmed:
        return {'email_not_verified': True}
    return {}

def site_context(request):
    return {
        'current_year': datetime.now().year
    }
