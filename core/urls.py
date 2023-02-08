from django.urls import path
from .views import (
    ArtworkView,
    ArtworkDetailView,
    ProductView,
    ItemDetailView,
    OrderSummaryView,
    CheckoutView,
    CheckoutSuccessView,
    PaymentView,
    RequestRefundView,
    add_to_cart,
    remove_from_cart,
    remove_single_item_from_cart,
    ContactView,
)

app_name = 'core'


urlpatterns = [
    path('contact/', ContactView.as_view(), name='contact'),
    path('product/', ProductView.as_view(), name='product-page'),
    path('checkout/', CheckoutView.as_view(), name='checkout-page'),
    path('checkout-success/', CheckoutSuccessView.as_view(), name='checkout-page-success'),
    path('product/<slug>', ItemDetailView.as_view(), name='item-page'),
    path('add-to-cart/<slug>', add_to_cart, name='add-to-cart'),
    path('remove-single-item-from-cart/<slug>', remove_single_item_from_cart, name='remove-single-item-from-cart'),
    path('remove-from-cart/<slug>', remove_from_cart, name='remove-from-cart'),
    path('order-summary/', OrderSummaryView.as_view(), name='order-summary'),
    path('payment/<payment_option>/', PaymentView.as_view(), name='payment-page'),
    path('request-refund/', RequestRefundView.as_view(), name='request-refund'),
    path('', ArtworkView.as_view(), name='artwork-list'),
    path('artwork/<slug>', ArtworkDetailView.as_view(), name='artwork-page')
]
