from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, ProjectImage, Merchandise, MerchandiseImage, Cart, CartItem


class ProjectImageSerializer(serializers.ModelSerializer):
    image_url = serializers.ReadOnlyField()
    
    class Meta:
        model = ProjectImage
        fields = ['id', 'title', 'description', 'image_url', 'order', 'created_at']
        read_only_fields = ['created_at']


class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    featured_image_url = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'featured_image_url', 'slug', 'images']


class ProjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for project list view"""
    featured_image_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        fields = ['id', 'title', 'featured_image_url', 'slug']


class MerchandiseImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchandiseImage
        fields = ['id', 'title', 'image']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['image'] and not representation['image'].startswith('http'):
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(representation['image'])
        return representation


class MerchandiseSerializer(serializers.ModelSerializer):
    images = MerchandiseImageSerializer(source='merchandiseimage_set', many=True, read_only=True)

    class Meta:
        model = Merchandise
        fields = ['id', 'title', 'description', 'price', 'stock', 'images']


class ContactFormSerializer(serializers.Serializer):
    """Serializer for contact form submission"""
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    subject = serializers.ChoiceField(choices=[
        ('request', 'Request a quote'),
        ('question', 'General question'),
        ('other', 'Other')
    ])
    message = serializers.CharField()

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password1')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CartItemSerializer(serializers.ModelSerializer):
    merchandise = MerchandiseSerializer(read_only=True)
    merchandise_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'merchandise', 'merchandise_id', 'quantity', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(source='cartitem_set', many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'created_at', 'items', 'total_items', 'total_price']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.cartitem_set.all())

    def get_total_price(self, obj):
        return sum(item.merchandise.price * item.quantity for item in obj.cartitem_set.all()) 