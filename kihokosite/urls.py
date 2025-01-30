"""kihokosite URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required

from portfolio import views  # import your portfolio views

urlpatterns = [
    path("admin/", admin.site.urls),

    # Example: routes for portfolio app
    path('art/', include('portfolio.urls')),

    # Auth
    path('signup/', views.signup, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/profile/', login_required(views.edit_profile), name='edit_profile'),
    path('accounts/verify_email/', views.verify_email, name='verify_email'),
    path('accounts/activate/<str:uidb64>/<str:token>/', views.activate_email, name='activate_email'),

]

# Serve media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom error handlers
handler404 = 'portfolio.views.custom_404'
handler400 = 'portfolio.views.custom_400'
handler500 = 'portfolio.views.custom_500'
