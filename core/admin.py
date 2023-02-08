from django.contrib import admin
from .models import Artwork, Item, OrderItem, Order, BillingAddress, Payment, Refund
# Register your models here.

def make_refund_accepted(modeladmin, queryset, request):
    queryset.update(refund_requested=False, refund_granted=True)
make_refund_accepted.short_description = 'Update orders to refund granted'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [ 'user', 'ordered', 'being_delivered',
                     'received', 'refund_requested', 'refund_granted',
                     'billing_address', 'payment' ]
    list_display_links = ['billing_address', 'payment']
    date_hierarchy = 'ordered_date'
    list_filter = [ 'ordered', 'being_delivered', 'received',
                    'refund_requested', 'refund_granted', 'ordered_date' ]
    list_editable = [ 'ordered', 'being_delivered', 'received', 'refund_requested', 'refund_granted' ]
    search_fields = ['user__username', 'ref_code']
    ordering = ['ordered_date']
    actions = [make_refund_accepted]

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'discount_price', 'category', 'count']
    list_editable = ['price', 'discount_price', 'category', 'count']
    list_filter = ['category']


admin.site.register(OrderItem)

admin.site.register(BillingAddress)
class BillingAddressAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'street_address',
        'apartment_address',
        'country',
        'zip',
    ]
    list_filter = ['address_type', 'country']
    search_fields = ['user__username', 'street_address', 'apartment_address', 'zip']





admin.site.register(Payment)

admin.site.register(Refund)

admin.site.register(Artwork)