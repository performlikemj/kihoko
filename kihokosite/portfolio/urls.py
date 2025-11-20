from django.urls import path
from . import views, api_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Traditional Django views
    path('', views.home, name='home'),
    path('project/<slug:slug>/', views.project_detail, name='project_detail'),
    path('art_detail/<int:image_id>/', views.art_detail, name='art_detail'),
    path('flash/', views.flash_gallery, name='flash_gallery'),
    path('contact/', views.contact, name='contact'),
    path('checkout/', views.redirect_to_shop_base, name='checkout'),
    
    # New Azure Blob Storage API endpoints
    path('api/v2/projects/', api_views.api_projects_list, name='api_v2_projects_list'),
    path('api/v2/project/<slug:slug>/', api_views.api_project_detail, name='api_v2_project_detail'),
    path('api/v2/project/<slug:slug>/images/', api_views.api_project_images, name='api_v2_project_images'),
    path('api/v2/artworks/', api_views.api_all_artworks, name='api_v2_all_artworks'),
    
    # Image upload/management endpoints
    path('api/v2/project/<slug:slug>/upload-image/', api_views.api_upload_project_image, name='api_v2_upload_project_image'),
    path('api/v2/project/<slug:slug>/upload-featured/', api_views.api_upload_featured_image, name='api_v2_upload_featured_image'),
    path('api/v2/image/<int:image_id>/update/', api_views.api_update_project_image, name='api_v2_update_project_image'),
    path('api/v2/image/<int:image_id>/delete/', api_views.api_delete_project_image, name='api_v2_delete_project_image'),
    
    # Azure Blob Storage health check
    path('api/v2/azure/health/', api_views.api_azure_blob_health, name='api_v2_azure_health'),
    
    # Legacy API endpoints (for backward compatibility)
    path('api/projects/', views.api_projects_list, name='api_projects_list'),
    path('api/project/<slug:slug>/', views.api_project_detail, name='api_project_detail'),
    path('api/project/<slug:slug>/images/', views.api_project_images, name='api_project_images'),
    path('api/artwork/<int:artwork_id>/', views.api_artwork_detail, name='api_artwork_detail'),
    path('api/artworks/', views.api_artworks_list, name='api_artworks_list'),
    path('api/contact/', views.api_contact_form, name='api_contact_form'),
    path('api/merchandise/', views.api_merchandise_list, name='api_merchandise_list'),
    
    # Authentication API endpoints
    path('api/auth/login/', views.api_user_login, name='api_user_login'),
    path('api/auth/signup/', views.api_user_signup, name='api_user_signup'),
    path('api/auth/logout/', views.api_user_logout, name='api_user_logout'),
]
