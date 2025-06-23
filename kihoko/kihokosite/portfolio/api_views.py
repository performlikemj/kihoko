"""
API views for Azure Blob Storage portfolio image management
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
import logging

from .models import Project, ProjectImage
from .serializers import ProjectSerializer, ProjectImageSerializer, ProjectListSerializer
from .azure_service import azure_blob_service

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_projects_list(request):
    """Get list of all projects with featured images from Azure Blob Storage"""
    try:
        projects = Project.objects.all()
        serializer = ProjectListSerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_projects_list: {e}")
        return Response({'error': 'Failed to fetch projects'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_project_detail(request, slug):
    """Get project details with all images from Azure Blob Storage"""
    try:
        project = get_object_or_404(Project, slug=slug)
        serializer = ProjectSerializer(project, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_project_detail: {e}")
        return Response({'error': 'Failed to fetch project'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_project_images(request, slug):
    """Get all images for a specific project from Azure Blob Storage"""
    try:
        project = get_object_or_404(Project, slug=slug)
        images = ProjectImage.objects.filter(project=project)
        serializer = ProjectImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_project_images: {e}")
        return Response({'error': 'Failed to fetch project images'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_all_artworks(request):
    """Get all artwork images from Azure Blob Storage"""
    try:
        artworks = ProjectImage.objects.all().select_related('project')
        serializer = ProjectImageSerializer(artworks, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_all_artworks: {e}")
        return Response({'error': 'Failed to fetch artworks'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def api_upload_project_image(request, slug):
    """Upload a new image for a project to Azure Blob Storage"""
    try:
        project = get_object_or_404(Project, slug=slug)
        
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        title = request.data.get('title', 'Untitled')
        description = request.data.get('description', '')
        order = request.data.get('order', 0)
        
        # Upload to Azure Blob Storage
        file_data = image_file.read()
        blob_name = azure_blob_service.upload_image(
            file_data=file_data,
            filename=image_file.name,
            project_slug=project.slug
        )
        
        if not blob_name:
            return Response({'error': 'Failed to upload image to Azure'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create database record
        project_image = ProjectImage.objects.create(
            project=project,
            image_blob=blob_name,
            title=title,
            description=description,
            order=order
        )
        
        serializer = ProjectImageSerializer(project_image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error in api_upload_project_image: {e}")
        return Response({'error': 'Failed to upload image'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def api_upload_featured_image(request, slug):
    """Upload a featured image for a project to Azure Blob Storage"""
    try:
        project = get_object_or_404(Project, slug=slug)
        
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        # Delete old featured image if exists
        if project.featured_image_blob:
            azure_blob_service.delete_image(project.featured_image_blob)
        
        # Upload new image to Azure Blob Storage
        file_data = image_file.read()
        blob_name = azure_blob_service.upload_image(
            file_data=file_data,
            filename=f"featured_{image_file.name}",
            project_slug=project.slug
        )
        
        if not blob_name:
            return Response({'error': 'Failed to upload image to Azure'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Update project with new blob name
        project.featured_image_blob = blob_name
        project.save()
        
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in api_upload_featured_image: {e}")
        return Response({'error': 'Failed to upload featured image'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_project_image(request, image_id):
    """Delete a project image from both database and Azure Blob Storage"""
    try:
        project_image = get_object_or_404(ProjectImage, id=image_id)
        
        # Delete from Azure Blob Storage
        if project_image.image_blob:
            azure_blob_service.delete_image(project_image.image_blob)
        
        # Delete from database
        project_image.delete()
        
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in api_delete_project_image: {e}")
        return Response({'error': 'Failed to delete image'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_project_image(request, image_id):
    """Update project image metadata"""
    try:
        project_image = get_object_or_404(ProjectImage, id=image_id)
        
        # Update metadata
        project_image.title = request.data.get('title', project_image.title)
        project_image.description = request.data.get('description', project_image.description)
        project_image.order = request.data.get('order', project_image.order)
        project_image.save()
        
        serializer = ProjectImageSerializer(project_image)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in api_update_project_image: {e}")
        return Response({'error': 'Failed to update image'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_azure_blob_health(request):
    """Check Azure Blob Storage connectivity"""
    try:
        if azure_blob_service.client is None:
            return Response({
                'status': 'disconnected',
                'message': 'Azure Blob Storage not configured'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Try to list containers to test connectivity
        containers = list(azure_blob_service.client.list_containers())
        
        return Response({
            'status': 'connected',
            'message': 'Azure Blob Storage is accessible',
            'container_count': len(containers)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Azure Blob Storage health check failed: {e}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE) 