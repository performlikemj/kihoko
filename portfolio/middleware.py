from datetime import timedelta
from django.utils import timezone
from .models import CartItem  # Make sure to import your models
from .views import get_or_create_cart  # Importing your utility function

class CartExpiryMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        cart_last_updated = request.session.get('cart_last_updated')
        if cart_last_updated:
            cart_last_updated = timezone.datetime.fromisoformat(cart_last_updated)
            if timezone.now() - cart_last_updated > timedelta(hours=24):
                cart = get_or_create_cart(request)
                
                # Fetch cart items and return them to stock
                cart_items = CartItem.objects.filter(cart=cart)
                for item in cart_items:
                    item.merchandise.stock += item.quantity
                    item.merchandise.save()
                
                # Delete cart items
                cart_items.delete()
                
                # Remove the cart_last_updated session key
                del request.session['cart_last_updated']
        
        response = self.get_response(request)
        return response
