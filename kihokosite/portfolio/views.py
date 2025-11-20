import json
from django.shortcuts import redirect, render, get_object_or_404
from django.http import HttpResponseServerError, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from random import choice
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import logging
from django.contrib.auth import login, authenticate
from django.conf import settings
from django.utils import translation
from django.db.models import Sum
from django.utils import timezone
from .models import Project, ProjectImage, Merchandise, Cart, CartItem, FlashDesign
from .forms import UpdateCartItemForm, RemoveCartItemForm, ContactForm, EditProfileForm, CustomUserCreationForm
import traceback
import os

# REST Framework imports
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.authtoken.models import Token
from .serializers import (
    ProjectSerializer, ProjectListSerializer, ProjectImageSerializer,
    MerchandiseSerializer, ContactFormSerializer, UserSerializer,
    UserRegistrationSerializer, CartSerializer, CartItemSerializer
)

logger = logging.getLogger('django')

from django.contrib import admin

def redirect_to_shop_base(request):
    return redirect(settings.THIRD_PARTY_CHECKOUT_URL, permanent=True)

# EXAMPLE VIEWS
def home(request):
    try:
        projects = Project.objects.all()
        return render(request, 'index.html', {'projects': projects})
    except Exception as e:
        logger.error(f"An error occurred while processing your request: {e}")
        # log the traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")

def project_detail(request, slug):
    try:
        project = get_object_or_404(Project, slug=slug)
        project_images = ProjectImage.objects.filter(project=project)
        return render(request, 'project_detail.html', {'project': project, 'project_images': project_images})
    except Exception as e:
        logger.error(f"An error occurred while processing your request: {e}")
        # log the traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")

def art_detail(request, image_id):
    try:
        image = get_object_or_404(ProjectImage, id=image_id)
        project_images = list(image.project.projectimage_set.all())
        current_index = project_images.index(image)
        prev_index = current_index - 1 if current_index > 0 else len(project_images) - 1
        next_index = (current_index + 1) % len(project_images)

        context = {
            'image': image,
            'prev_image': project_images[prev_index],
            'next_image': project_images[next_index],
        }
        return render(request, 'art_detail.html', context)
    except Exception as e:
        logger.error(f"An error occurred while processing your request: {e}")
        # log the traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")


def flash_gallery(request):
    try:
        flash_designs = FlashDesign.objects.all()
        context = {
            'flash_designs': flash_designs,
            'available_count': flash_designs.filter(is_available=True).count(),
            'taken_count': flash_designs.filter(is_available=False).count(),
        }
        return render(request, 'flash_gallery.html', context)
    except Exception as e:
        logger.error(f"An error occurred while loading the flash gallery: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")


def contact(request):
    try:
        if request.method == 'POST':
            form = ContactForm(request.POST)
            if form.is_valid():
                name = form.cleaned_data.get('name')
                email = form.cleaned_data.get('email')
                subject = form.cleaned_data.get('subject')
                message = form.cleaned_data.get('message')
                
                full_message = f"From: {name} <{email}>\n\n{message}"
                sender_email = "kihokomizuno@icloud.com"
                send_mail(subject, full_message, sender_email, [sender_email], fail_silently=False)

                messages.success(request, _("Your message has been sent successfully!"))
                return redirect('contact')
            else:
                logger.error(f"An error occurred while sending a message to {request.POST.get('email')}")
                messages.error(request, _("An error occurred while sending your message. Please try again."))
        else:
            form = ContactForm()
        return render(request, 'contact.html', {'form': form})
    except Exception as e:
        logger.error(f"An error occurred while processing your request: {e}")
        # log the traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")

def signup(request):
    try:
        if request.method == 'POST':
            form = CustomUserCreationForm(request.POST)
            if form.is_valid():
                user = form.save()
                login(request, user)
                return redirect('home')
        else:
            form = CustomUserCreationForm()
        return render(request, 'signup.html', {'form': form})
    except Exception as e:
        logger.error(f"An error occurred while processing your request: {e}")
        # log the traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")

@login_required
def edit_profile(request):
    try:
        if request.method == 'POST':
            old_email = request.user.email
            form = EditProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            if form.cleaned_data['email'] != old_email:
                request.user.profile.email_confirmed = False
                request.user.profile.save()
                send_activation_email(request, request.user)
                form.save()
                messages.success(request, _('Your profile has been updated successfully.'))
                return redirect('edit_profile')
            else:
                logger.info(f"An error occurred while updating the profile of {request.user.email}")
                messages.error(request, _('An error occurred while updating your profile.'))
        else:
            form = EditProfileForm(instance=request.user)    
        return render(request, 'edit_profile.html', {'form': form})
    except Exception as e:
        logger.error(f"An error occurred while processing your request: {e}")
        # log the traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return HttpResponseServerError("An error occurred while processing your request.")

@login_required
def send_activation_email(request, user):
    token = default_token_generator.make_token(user)
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    activation_link = request.build_absolute_uri(reverse('activate_email', kwargs={'uidb64': uidb64, 'token': token}))

    subject = _('Activate your email address')
    message = render_to_string('email_activation.html', {
        'user': user,
        'activation_link': activation_link
    })

    sender_email = "kiho@kihoko.com"
    email = EmailMessage(subject, message, from_email=sender_email, to=[user.email])
    email.send()

@login_required
def verify_email(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        try:
            validate_email(email)
            user = User.objects.get(email=email)
            if not user.profile.email_confirmed:
                send_activation_email(request, user)
        except (ValidationError, User.DoesNotExist):
            pass
        messages.success(request, _('An email has been sent with an activation link. Please check your inbox.'))

    projects = Project.objects.all()
    return render(request, 'index.html', {'projects': projects})

@login_required
def activate_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.profile.email_confirmed = True
            user.save()
            messages.success(request, _('Your email address has been verified successfully.'))
            return redirect(reverse('edit_profile'))
        else:
            logger.info(f"Invalid activation link for {user.email}")
            messages.error(request, _('The email verification link is invalid. Please request a new one.'))
            return redirect(reverse('edit_profile'))
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        logger.info("Invalid activation link")
        messages.error(request, _('The email verification link is invalid. Please request a new one.'))
        return redirect(reverse('edit_profile'))

# 400 Series Errors
def custom_404(request, exception):
    logger.error(f"404 error: {exception}")
    images = ProjectImage.objects.all()
    random_image = choice(images) if images.exists() else None
    return render(request, '404.html', {'random_image': random_image}, status=404)

def custom_400(request, exception):
    logger.error(f"400 error: {exception}")
    images = ProjectImage.objects.all()
    random_image = choice(images) if images.exists() else None
    return render(request, '400.html', {'random_image': random_image})

# 500 Series Errors
def custom_500(request):
    logger.error(f"500 error")
    images = ProjectImage.objects.all()
    random_image = choice(images) if images.exists() else None
    return render(request, '500.html', {'random_image': random_image})


# =====================================
# API VIEWS FOR REACT FRONTEND
# =====================================

@api_view(['GET'])
@permission_classes([AllowAny])
def api_projects_list(request):
    """API endpoint to get all projects for the React frontend"""
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
    """API endpoint to get project details"""
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
    """API endpoint to get project images"""
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
def api_artwork_detail(request, artwork_id):
    """API endpoint to get artwork details"""
    try:
        artwork = get_object_or_404(ProjectImage, id=artwork_id)
        serializer = ProjectImageSerializer(artwork, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_artwork_detail: {e}")
        return Response({'error': 'Failed to fetch artwork'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_artworks_list(request):
    """API endpoint to get all artworks"""
    try:
        artworks = ProjectImage.objects.all()
        serializer = ProjectImageSerializer(artworks, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_artworks_list: {e}")
        return Response({'error': 'Failed to fetch artworks'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_contact_form(request):
    """API endpoint to handle contact form submissions"""
    try:
        serializer = ContactFormSerializer(data=request.data)
        if serializer.is_valid():
            name = serializer.validated_data['name']
            email = serializer.validated_data['email']
            subject = serializer.validated_data['subject']
            message = serializer.validated_data['message']
            
            # Create the full message
            full_message = f"From: {name} <{email}>\n\n{message}"
            sender_email = "kihokomizuno@icloud.com"
            
            # Send email
            send_mail(
                subject=f"Contact Form: {subject}",
                message=full_message,
                from_email=sender_email,
                recipient_list=[sender_email],
                fail_silently=False
            )
            
            return Response({'message': 'Your message has been sent successfully!'})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in api_contact_form: {e}")
        return Response({'error': 'Failed to send message'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_user_login(request):
    """API endpoint for user login"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            user_serializer = UserSerializer(user)
            return Response({
                'token': token.key,
                'user': user_serializer.data,
                'message': 'Login successful'
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"Error in api_user_login: {e}")
        return Response({'error': 'Login failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_user_signup(request):
    """API endpoint for user signup"""
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            user_serializer = UserSerializer(user)
            return Response({
                'token': token.key,
                'user': user_serializer.data,
                'message': 'Account created successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in api_user_signup: {e}")
        return Response({'error': 'Signup failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def api_user_logout(request):
    """API endpoint for user logout"""
    try:
        if request.user.is_authenticated:
            # Delete the user's token
            Token.objects.filter(user=request.user).delete()
            return Response({'message': 'Logged out successfully'})
        else:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f"Error in api_user_logout: {e}")
        return Response({'error': 'Logout failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_merchandise_list(request):
    """API endpoint to get all merchandise"""
    try:
        merchandise = Merchandise.objects.all()
        serializer = MerchandiseSerializer(merchandise, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in api_merchandise_list: {e}")
        return Response({'error': 'Failed to fetch merchandise'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
