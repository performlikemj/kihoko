from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _


class UpdateCartItemForm(forms.Form):
    merch_id = forms.IntegerField()
    quantity = forms.IntegerField(min_value=1)


class RemoveCartItemForm(forms.Form):
    merch_id = forms.IntegerField()


class ContactForm(forms.Form):
    SUBJECT_CHOICES = (
        ('request_quote', 'Request a quote'),
        ('inquiry_services', 'Inquiry about your services'),
        ('feedback', 'Feedback on your portfolio'),
        ('collaboration', 'Collaboration proposal'),
        ('general', 'General question or comment'),
    )

    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    subject = forms.ChoiceField(choices=SUBJECT_CHOICES, required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)




class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, validators=[validate_email])

    class Meta:
        model = User
        fields = ['email', 'password1', 'password2']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = user.email
        if commit:
            user.save()
        return user


class EditProfileForm(forms.ModelForm):
    email = forms.EmailField(required=True, validators=[validate_email])

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        labels = {
            'first_name': 'First Name',
            'last_name': 'Last Name',
            'email': 'Email Address',
        }

    def clean_email(self):
        email = self.cleaned_data['email']
        if self.instance.email != email:
            if User.objects.filter(email=email).exists():
                raise ValidationError(_("Email address is already in use."))
        return email
