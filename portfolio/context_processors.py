# In your context_processors.py file
def email_verification_status(request):
    if request.user.is_authenticated and not request.user.profile.email_confirmed:
        return {'email_not_verified': True}
    return {}
