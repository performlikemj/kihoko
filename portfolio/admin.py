from django.contrib import admin
from .models import Project, ProjectImage, Merchandise, Cart, CartItem

# Define the inline admin class for ProjectImage
class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1

# Define the admin class for Project
class ProjectAdmin(admin.ModelAdmin):
    inlines = [ProjectImageInline]
    list_display = ('title', 'description')
    search_fields = ('title',)

# Define the admin class for Merchandise
class MerchandiseAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'price')
    search_fields = ('title',)

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1

class CartAdmin(admin.ModelAdmin):
    inlines = [CartItemInline]




# Register the models
admin.site.register(Project, ProjectAdmin)
admin.site.register(ProjectImage)
admin.site.register(Merchandise, MerchandiseAdmin)
admin.site.register(Cart, CartAdmin)



