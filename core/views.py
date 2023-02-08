from django.shortcuts import render, redirect, get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.contrib import messages
from django.conf import settings
import stripe
import random
import string
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import Artwork, Item, OrderItem, Order, BillingAddress, Payment, Refund
from .forms import CheckOutForm, RefundForm
from django.views.generic import (
    ListView,
    CreateView,
    DeleteView,
    UpdateView,
    DetailView,
    TemplateView,
    View
)

stripe.api_key = settings.STRIPE_SECRET_KEY


class ContactView(TemplateView):
    template_name = "contact.html"


def create_ref_code(request):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))


class RequestRefundView(View):
    def get(self, *args, **kwargs):
        form = RefundForm()
        context = {
            'form': form
        }
        return render(self.request, 'request_refund.html', context)

    def post(self, *args, **kwargs):
        form = RefundForm(self.request.POST)
        if form.is_valid():
            ref_code = form.cleaned_data.get('ref_code')
            message = form.cleaned_data.get('message')
            email = form.cleaned_data.get('email')
            # edit the order
            try:
                order = Order.objects.get(ref_code=ref_code)
                order.refund_requested = True
                order.save()

                # store the Refund
                refund = Refund()
                refund.order = order
                refund.reason = message
                refund.email = email
                refund.save()

                messages.info(self.request, "Your request was received")
                return redirect("core-request-refund")
            except ObjectDoesNotExist:
                messages.info(self.request, "Order provided does not exist.")
                return redirect("core-request-refund")


class CheckoutSuccessView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        # set all items to ordered=True
        order = Order.objects.get(user=self.request.user, ordered=False)

        order_items = order.items.all()
        order_items.update(ordered=True)
        for item in order_items:
            if item.item.count > 0:
                item.item.count -= 1
                item.item.save()
            else:
                item.item.set_sold_out_item()
                messages.info(self.request, "This item quantity was sold out.")

        # create a reference code for order
        order.ref_code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))

        # Assign the Payment to the order
        order.ordered = True
        order.save()
        messages.success(self.request, f"Your order was successful.")
        return redirect("/")


class CheckoutView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        form = CheckOutForm
        order = Order.objects.get(user=self.request.user, ordered=False)
        description = ""
        price = order.get_order_total()
        for order_item in order.items.all():
            description = description + " " + order_item.item.title + " x" + str(order_item.quantity)
        product = stripe.Product.create(name=description)
        price = stripe.Price.create(
            product=product.id,
            unit_amount=int(price * 100),
            currency='usd',
        )

        context = {
            'form': form,
            'order': order,
            'priceid': price.id,
            'stripekey':settings.STRIPE_PUBLIC_KEY

        }

        return render(self.request, "checkout_page.html", context)

    def post(self, *args, **kwargs):
        form = CheckOutForm(self.request.POST or None)
        if form.is_valid():
            street_address = form.cleaned_data.get('street_address')
            apartment_address = form.cleaned_data.get('apartment_address')
            country = form.cleaned_data.get('country')
            zip_code = form.cleaned_data.get('zip')

            try:
                order = Order.objects.get(user=self.request.user, ordered=False)
            except ObjectDoesNotExist:
                messages.error(self.request, "You don't have an active order")
                return redirect("core:order-summary")

            if country == "United States of America":
                billing_address = BillingAddress(
                    user=self.request.user,
                    street_address=street_address,
                    apartment_address=apartment_address,
                    country=country,
                    zip=zip_code
                )
                billing_address.save()
                order.billing_address = billing_address
                order.save()
            else:
                messages.info(self.request, "Sorry. We are only shipping to the United States at the moment.")
                return redirect("core:order-summary")
        else:
            messages.error(self.request, "Form is not valid")
            return redirect("core:checkout-page")


class PaymentView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        order = Order.objects.get(user=self.request.user, ordered=False)
        if order.billing_address:
            context = {
                'order': order,
                # 'DISPLAY_COUPON_FORM': False,
                'STRIPE_PUBLIC_KEY': settings.STRIPE_PUBLIC_KEY
            }
        else:
            messages.warning(
                self.request, "You have not added a billing address")
            return redirect("core:checkout-page")
        return render(self.request, "payment_page.html", context)

    def post(self, *args, **kwargs):
        order = Order.objects.get(user=self.request.user, ordered=False)
        token = self.request.POST.get('stripeToken')
        amount = int(order.get_order_total())

        try:
            assert amount > 0
            charge = stripe.Charge.create(
                amount=amount * 100,
                currency='usd',
                source=token
            )
            # Create the payment
            payment = Payment()
            payment.stripe_charge_id = charge['id']
            payment.user = self.request.user
            payment.amount = amount
            payment.save()

            # set all items to ordered=True
            order_items = order.items.all()
            order_items.update(ordered=True)
            for item in order_items:
                if item.count > 0:
                    item.count -= 1
                    item.save()
                else:
                    item.set_sold_out_item()
                    messages.info(self.request, "This item quantity was sold out.")

            # create a reference code for order
            order.ref_code = create_ref_code()

            # Assign the Payment to the order
            order.payment = payment
            order.ordered = True
            order.save()
            messages.success(self.request, f"Your order was successful.")
            return redirect("/")
        except stripe.error.CardError as e:
            # Since it's a decline, stripe.error.CardError will be caught
            body = e.json_body
            err = body.get('error', {})
            messages.error(self.request, f"{err.get('message')}")
            return redirect("core:order-summary")
        except stripe.error.RateLimitError as e:
            # Too many requests made to the API too quickly
            # TODO: Create a log infrastructure
            messages.error(self.request, f"Too many requests")
            return redirect("core:order-summary")
        except stripe.error.InvalidRequestError as e:
            # Invalid parameters were supplied to Stripe's API
            # TODO: Create a log infrastructure
            body = e.json_body
            err = body.get('error', {})
            messages.error(self.request, f"{err.get('message')}")
            # messages.error(self.request, f"Invalid Parameters")
            return redirect("core:order-summary")
        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed
            # (maybe you changed API keys recently)
            # TODO: Create a log infrastructure
            messages.error(self.request, f"Not Authenticated")
            return redirect("core:order-summary")
        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
            # TODO: Create a log infrastructure
            messages.error(self.request, f"Network Error")
            return redirect("core:order-summary")
        except stripe.error.StripeError as e:
            # Display a very generic error to the user, and maybe send
            # yourself an email
            messages.error(self.request, f"Something went wrong and you were not charged. Please try again.")
            return redirect("core:order-summary")
        except Exception as e:
            # Something else happened, completely unrelated to Stripe
            messages.error(self.request, f"An error has occurred.")
            return redirect("core:order-summary")


def product(request):
    return render(request, "product_page.html")


class ItemDetailView(DetailView):
    model = Item
    template_name = "product_page.html"

class ArtworkDetailView(DetailView):
    model = Artwork
    template_name = "artwork_page.html"

class ProductView(ListView):
    model = Item
    ordering = ['title']
    paginate_by = 12
    template_name = "product_list.html"


class ArtworkView(ListView):
    model = Artwork
    paginate_by = 12
    template_name = "artwork_list.html"


class OrderSummaryView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        order = Order.objects.get(user=self.request.user, ordered=False)
        try:
            return render(self.request, 'order_summary.html', context={'object': order})
        except ObjectDoesNotExist:
            messages.error(self.request, "You don't have an active order")
            return redirect("core:order-summary")


@login_required
def add_to_cart(request, slug):
    item = get_object_or_404(Item, slug=slug)
    print("test")
    order_item, created = OrderItem.objects.get_or_create(
        item=item,
        user=request.user,
        ordered=False
    )
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False)
    if order_qs.exists():
        order = order_qs[0]
        # check if the order item is in the order
        # item count placeholder
        if order.items.filter(item__slug=item.slug).exists():
            if order_item.quantity < item.count:
                order_item.quantity += 1
                order_item.save()
            else:
                messages.info(request, f"We only have {item.count} in stock.")
        else:
            order.items.add(order_item)
            # order_item.save()
        messages.info(request, "This item quantity was updated.")
        return redirect("core:order-summary")
    else:
        ordered_date = timezone.now()
        order = Order.objects.create(
            user=request.user, ordered_date=ordered_date)
        order.items.add(order_item)
    return redirect("core:order-summary")


@login_required
def remove_from_cart(request, slug):
    item = get_object_or_404(Item, slug=slug)
    print("remove from cart")
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False
    )
    if order_qs.exists():
        order = order_qs[0]
        # check if the order item is in the order
        if order.items.filter(item__slug=item.slug).exists():
            order_item = OrderItem.objects.filter(
                item=item,
                user=request.user,
                ordered=False
            )[0]
            order.items.remove(order_item)
            order_item.delete()
            messages.info(request, "This item was removed from your cart.")
            return redirect("core:product-page", slug=slug)
        else:
            messages.info(request, "This item was not in your cart")
            return redirect("core:product-page", slug=slug)
    else:
        messages.info(request, "You do not have an active order")
        return redirect("core:product-page", slug=slug)


@login_required
def remove_single_item_from_cart(request, slug):
    item = get_object_or_404(Item, slug=slug)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False
    )
    if order_qs.exists():
        order = order_qs[0]
        # check if the order item is in the order
        if order.items.filter(item__slug=item.slug).exists():
            order_item = OrderItem.objects.filter(
                item=item,
                user=request.user,
                ordered=False
            )[0]
            if order_item.quantity > 1:
                order_item.quantity -= 1
                order_item.save()
            else:
                order.items.remove(order_item)
            messages.info(request, "This item quantity was updated.")
            return redirect("core:order-summary")
        else:
            messages.info(request, "This item was not in your cart")
            return redirect("core:product-page", slug=slug)
    else:
        messages.info(request, "You do not have an active order")
        return redirect("core:order-summary")
