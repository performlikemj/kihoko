from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),
    path('project/<slug:slug>/', views.project_detail, name='project_detail'),
    path('art_detail/<int:image_id>/', views.art_detail, name='art_detail'),
    path('merchandise/<int:merch_id>/', views.merchandise_detail, name='merchandise_detail'),
    path('contact/', views.contact, name='contact'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)