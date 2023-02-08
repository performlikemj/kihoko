from django.db import models
from django.shortcuts import reverse
from django.conf import settings
from django_countries.fields import CountryField
# Create your models here.

CATEGORY_CHOICES =(
    ('C', 'Clothing'),
    ('A', 'Art'),
)

LABEL_CHOICES =(
    ('P', 'primary'),
    ('D', 'danger'),
    ('S', 'secondary'),
)

class Item(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='product_images')
    price = models.DecimalField(max_digits=8, decimal_places=2)
    discount_price = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    category = models.CharField(choices=CATEGORY_CHOICES, max_length=2)
    label = models.CharField(choices=LABEL_CHOICES, max_length=1)
    slug = models.SlugField()
    description = models.TextField()
    count = models.IntegerField(default=0)
    sold_out = models.BooleanField(default=False)

    def __str__(self):
        return self.title


    def get_absolute_url(self):
        return reverse("core:item-page", kwargs={
            'slug': self.slug
        })

    def get_add_to_cart_url(self):
        return reverse("core:add-to-cart", kwargs={
            'slug': self.slug
        })

    def get_remove_from_cart_url(self):
        return reverse("core:remove-from-cart", kwargs={
            'slug': self.slug
        })

    def remove_single_item_from_cart(self):
        return reverse("core:remove-single-item-from-cart", kwargs={
            'slug': self.slug
        })

    def set_sold_out_item(self):
        """Function to set sold out flag to True if item count reaches 0
            Takes no argument. Checks own object count value
            Returns boolea"""

        if self.count == 0:
            self.sold_out = True

        return self.sold_out

    # def image_url(self):
    #     if self.image and hasattr(self.image, 'url'):
    #         return self.image.url


class OrderItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    ordered = models.BooleanField(default=False,)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.item.title}"

    def get_total_price(self):
        return (self.item.price * self.quantity)

    def get_total_discount_price(self):
        return (self.item.discount_price * self.quantity)

    def get_final_price(self):
        if self.item.discount_price:
            return self.get_total_discount_price()
        else:
            return self.get_total_price()



class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    ref_code = models.CharField(max_length=20)
    items = models.ManyToManyField(OrderItem)
    start_date = models.DateTimeField(auto_now_add=True)
    ordered_date = models.DateTimeField()
    ordered = models.BooleanField(default=False)
    billing_address = models.ForeignKey('BillingAddress',
                                        on_delete=models.SET_NULL, blank=True, null=True)
    payment = models.ForeignKey('Payment',
                                        on_delete=models.SET_NULL, blank=True, null=True)
    being_delivered = models.BooleanField(default=False)
    received = models.BooleanField(default=False)
    refund_requested = models.BooleanField(default=False)
    refund_granted = models.BooleanField(default=False)


    def __str__(self):
        return self.user.username


    def get_order_total(self):
        total = 0
        for order_items in self.items.all():
            total += order_items.get_final_price()
        return total


class BillingAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    street_address = models.CharField(max_length=100)
    apartment_address = models.CharField(max_length=20)
    country = CountryField(multiple=False)
    zip = models.CharField(max_length=20)
    usa_resident = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.user.username} living in {self.country} with zip {self.zip}"



class Payment(models.Model):
    stripe_charge_id = models.CharField(max_length=50)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount} for {self.user.username}"



class Refund(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    reason = models.TextField()
    accepted = models.BooleanField(default=False)
    email = models.EmailField()

    def __str__(self):
        return f"{self.pk}"


class Artwork(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(default='Artwork by Kiho')
    slug = models.SlugField(unique=True)
    art = models.ImageField(upload_to='artwork_pics')

    def __str__(self):
        return f'{self.name}'

    def get_absolute_url(self):
        return reverse("core:artwork-page", kwargs={
            'slug': self.slug
        })

    class Meta:
        ordering = ['-id']