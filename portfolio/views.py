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
from django.contrib.auth import login
from django.conf import settings
from django.utils import translation
from django.db.models import Sum
from django.utils import timezone
from .models import Project, ProjectImage, Merchandise, Cart, CartItem
from .forms import UpdateCartItemForm, RemoveCartItemForm, ContactForm, EditProfileForm, CustomUserCreationForm
import traceback
import stripe
from stripe.error import StripeError
import os

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

from django.contrib import admin

def redirect_to_shop_base(request):
    return redirect('https://shop.base.com', permanent=True)

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

