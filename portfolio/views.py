import json
from django.shortcuts import redirect, render, get_object_or_404
from django.http import HttpResponseServerError, HttpResponseBadRequest, HttpResponseNotFound
from random import choice
from django.urls import reverse
from django.http import JsonResponse
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
from django.http import HttpResponseRedirect
from .models import Project, ProjectImage, Merchandise, Cart, CartItem
from .forms import UpdateCartItemForm, RemoveCartItemForm, ContactForm, EditProfileForm, CustomUserCreationForm 
import stripe
from stripe.error import StripeError

stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)


from django.contrib import admin

# Create your views here.
def home(request):
    projects = Project.objects.all()
    return render(request, 'index.html', {'projects': projects})

def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    project_images = ProjectImage.objects.filter(project=project)  # Get related images for the project
    return render(request, 'project_detail.html', {'project': project, 'project_images': project_images})

def art_detail(request, image_id):
    image = get_object_or_404(ProjectImage, id=image_id)
    project_images = list(image.project.projectimage_set.all())  # Convert QuerySet to list
    
    current_index = project_images.index(image)
    prev_index = current_index - 1 if current_index > 0 else len(project_images) - 1
    next_index = (current_index + 1) % len(project_images)

    context = {
        'image': image,
        'prev_image': project_images[prev_index],
        'next_image': project_images[next_index],
    }
    return render(request, 'art_detail.html', context)


def shop(request):
    merchandise = Merchandise.objects.all()
    show_email_verification_message = False

    if request.user.is_authenticated:
        cart = get_or_create_cart(request.user)
        show_email_verification_message = not request.user.profile.email_confirmed
    else:
        cart = None

    context = {
        'merchandise': merchandise,
        'cart': cart,
        'stripe_public_key': settings.STRIPE_PUBLIC_KEY,
        'show_email_verification_message': show_email_verification_message,
    }
    return render(request, 'shop.html', context)



@csrf_exempt
@login_required
def create_checkout_session(request):
    user = request.user
    if not user.profile.email_confirmed:
        return JsonResponse({"success": False, "message": _("Please verify your email address to shop.")})
    try:
        if request.method == 'GET':
            cart = get_or_create_cart(request.user)
            cart_items = CartItem.objects.filter(cart=cart)
            
            line_items = []
            for item in cart_items:
                line_items.append({
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': int(item.merchandise.price * 100),
                        'product_data': {
                            'name': item.merchandise.title,
                            'images': [request.build_absolute_uri(item.merchandise.image.url)],
                        },
                    },
                    'quantity': item.quantity,
                })

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=request.build_absolute_uri('/') + '?success=true',
                cancel_url=request.build_absolute_uri('/') + '?canceled=true',
            )

            return JsonResponse({'sessionId': checkout_session['id']})
    except StripeError as e:
        # Log the error
        logger.warning(f"StripeError: {e}")
        return JsonResponse({'success': False, 'message': _('There was an error creating the checkout session. Please try again later.')})
    except Exception as e:
        # Log the error
        logger.warning(f"Exception: {e}")
        return JsonResponse({'success': False, 'message': _('An unexpected error occurred. Please try again later.')})


@login_required
def cart(request):
    cart = get_or_create_cart(request.user)
    if cart:
        cart_items = CartItem.objects.filter(cart=cart)
        total = sum([item.merchandise.price * item.quantity for item in cart_items])
    else:
        cart_items = []
        total = 0
    context = {
        "cart_items": cart_items,
        "total": total,
    }
    return render(request, "cart.html", context)


def get_or_create_cart(user):
    if not user.is_authenticated:
        return None

    cart, created = Cart.objects.get_or_create(user=user)
    return cart


@login_required
def checkout(request):
    cart = get_or_create_cart(request.user)
    if cart:
        cart_items = CartItem.objects.filter(cart=cart)
        total = sum([item.merchandise.price * item.quantity for item in cart_items])
    else:
        cart_items = []
        total = 0
    context = {
        "cart_items": cart_items,
        "total": total,
        "stripe_public_key": settings.STRIPE_PUBLIC_KEY,
    }
    return render(request, "checkout.html", context)


@login_required
def add_to_cart(request):
    if request.method == "POST":
        user = request.user
        if not user.profile.email_confirmed:
            logger.warning(f"User {user.email} tried to add to cart without verifying email")
            return JsonResponse({"success": False, "message": _("Please verify your email address to shop.")})
        cart = get_or_create_cart(user)
        if cart:
            data = json.loads(request.body)
            merch_id = data.get("merch_id")
            merchandise = get_object_or_404(Merchandise, id=merch_id)

            if merchandise.stock < 1:
                logger.info(f"User {user.email} tried to add out of stock item to cart")
                return JsonResponse({"success": False, "message": _("The item is out of stock")})

            cart_item, created = CartItem.objects.get_or_create(cart=cart, merchandise=merchandise)
            if not created:
                if cart_item.quantity < merchandise.stock:
                    cart_item.quantity += 1
                    cart_item.save()
                else:
                    logger.info(f"User {user.email} tried to add more items than available in stock")
                    return JsonResponse({"success": False, "message": _("You can't add more items than available in stock")})
            else:
                merchandise.stock -= 1
                merchandise.save()

            return JsonResponse({"success": True})
        else:
            logger.info(f"Unauthenticated user tried to add {cart_item} to cart")
            return JsonResponse({"success": False, "message": _("User is not authenticated")})
    return JsonResponse({"success": False})


@csrf_exempt
@login_required
def update_cart_item(request):
    if request.method == "POST":
        user = request.user
        if not user.profile.email_confirmed:
            logger.info(f"User {user.email} tried to update cart without verifying email")
            return JsonResponse({"success": False, "message": _("Please verify your email address to shop.")})
        form = UpdateCartItemForm(request.POST)
        if form.is_valid():
            merch_id = request.POST.get('merch_id')
            quantity = int(request.POST.get('quantity'))
            merchandise = get_object_or_404(Merchandise, id=merch_id)

            if quantity > merchandise.stock:
                logger.info(f"User {user.email} tried to add more items with merch id:{merch_id} than available in stock")
                return JsonResponse({'success': False, 'message': _('You can\'t add more items than available in stock')})

            cart = get_or_create_cart(request.user)
            cart_item = get_object_or_404(CartItem, cart=cart, merchandise=merchandise)

            # Update stock before setting new cart_item quantity
            merchandise.stock += cart_item.quantity
            cart_item.quantity = max(quantity, 1)
            merchandise.stock -= cart_item.quantity
            merchandise.save()

            cart_item.save()

            return JsonResponse({'success': True})
        else:
            logger.warning(f"User {user.email} tried to update cart with invalid form data")
            return JsonResponse({'success': False, 'message': _('Invalid input')})



@csrf_exempt
@login_required
def remove_cart_item(request):
    if request.method == "POST":
        user = request.user
        if not user.profile.email_confirmed:
            logger.info(f"User {user.email} tried to remove cart item without verifying email")
            return JsonResponse({"success": False, "message": _("Please verify your email address to shop.")})
        form = RemoveCartItemForm(request.POST)
        if form.is_valid():
            merch_id = request.POST.get('merch_id')
            merchandise = get_object_or_404(Merchandise, id=merch_id)

            cart = get_or_create_cart(request.user)
            cart_item = get_object_or_404(CartItem, cart=cart, merchandise=merchandise)

            # Update merchandise stock
            merchandise.stock += cart_item.quantity
            merchandise.save()

            cart_item.delete()

            return JsonResponse({'success': True})
        else:
            logger.warning(f"User {user.email} tried to remove cart item with invalid form data")
            return JsonResponse({'success': False, 'message': _('Invalid input')})



# Contact Form
def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data.get('name')
            email = form.cleaned_data.get('email')
            subject = form.cleaned_data.get('subject')
            message = form.cleaned_data.get('message')
            
            # Create the full message including the user's email address
            full_message = f"From: {name} <{email}>\n\n{message}"
            
            # Use kihokomizuno@icloud.com as the sender's address
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


# Authentication
def signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'signup.html', {'form': form})


@login_required
def edit_profile(request):
    if request.method == 'POST':
        old_email = request.user.email  # Save the old email before binding the form
        form = EditProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            # Check if the email has changed
            if form.cleaned_data['email'] != old_email:
                request.user.profile.email_confirmed = False
                request.user.profile.save()
                send_activation_email(request, request.user)  # Send a new activation email for the updated email address

            form.save()
            messages.success(request, _('Your profile has been updated successfully.'))
            return redirect('edit_profile')
        else:
            logger.info(f"An error occurred while updating the profile of {request.user.email}")
            messages.error(request, _('An error occurred while updating your profile.'))
    else:
        form = EditProfileForm(instance=request.user)

    context = {
        'form': form,
    }
    return render(request, 'edit_profile.html', context)



@login_required
def send_activation_email(request, user):
    token = default_token_generator.make_token(user)
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

    activation_link = request.build_absolute_uri(
        reverse('activate_email', kwargs={'uidb64': uidb64, 'token': token}))

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

    merchandise = Merchandise.objects.all()
    show_email_verification_message = False

    if request.user.is_authenticated:
        cart = get_or_create_cart(request.user)
        show_email_verification_message = not request.user.profile.email_confirmed
    else:
        cart = None

    context = {
        'merchandise': merchandise,
        'cart': cart,
        'show_email_verification_message': show_email_verification_message,
    }
    return render(request, 'shop.html', context)



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
        logger.info(f"Invalid activation link for {user.email}")
        messages.error(request, _('The email verification link is invalid. Please request a new one.'))
        return redirect(reverse('edit_profile'))


# 400 Series Errors
def custom_404(request, exception):
    random_image = None
    images = ProjectImage.objects.all()

    if images.exists():
        random_image = choice(images)

    HttpResponseNotFound(render(request, '404.html', {'random_image': random_image}, status=404))

def custom_400(request, exception):
    random_image = None
    images = ProjectImage.objects.all()

    if images.exists():
        random_image = choice(images)

    HttpResponseBadRequest(render(request, '400.html', {'random_image': random_image}, status=404))

# 500 Series Errors
def custom_500(request, exception):
    random_image = None
    images = ProjectImage.objects.all()

    if images.exists():
        random_image = choice(images)

    HttpResponseServerError(render(request, '500.html', {'random_image': random_image}, status=404)) 

# Language
def change_language(request):
    user_language = request.GET.get('lang', None)
    
    if user_language and user_language in [lang[0] for lang in settings.LANGUAGES]:
        translation.activate(user_language)
        response = HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
        response.set_cookie(settings.LANGUAGE_COOKIE_NAME, user_language)
        return response
    
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', '/'))
