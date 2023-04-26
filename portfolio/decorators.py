# decorators.py
from django.contrib.admin.views.decorators import user_passes_test

def admin_required(function=None, login_url=None):
    actual_decorator = user_passes_test(
        lambda u: u.is_active and u.is_staff,
        login_url=login_url or 'login',  # Set the default login_url value to the name of your custom login view
    )
    if function:
        return actual_decorator(function)
    return actual_decorator
