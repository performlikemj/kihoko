"""kihokosite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from django.conf import settings
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from portfolio import views
from django.contrib.auth.decorators import login_required


urlpatterns = [
    path("admin/", admin.site.urls),
    path('', include('portfolio.urls')),
    path('shop/', views.shop, name='shop'),
    path('create_checkout_session/', views.create_checkout_session, name='create_checkout_session'),
    path('cart/', views.cart, name='cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('add_to_cart/', views.add_to_cart, name='add_to_cart'),
    path('remove_cart_item/', views.remove_cart_item, name='remove_cart_item'),
    path('update_cart_item/', views.update_cart_item, name='update_cart_item'),
    path('signup/', views.signup, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('accounts/profile/', login_required(views.edit_profile), name='edit_profile'),
    path('accounts/verify_email/', views.verify_email, name='verify_email'),
    path('accounts/activate/<str:uidb64>/<str:token>/', views.activate_email, name='activate_email'),
    path('change_language/', views.change_language, name='change_language'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'portfolio.views.custom_404'
handler400 = 'portfolio.views.custom_400'
handler500 = 'portfolio.views.custom_500'
