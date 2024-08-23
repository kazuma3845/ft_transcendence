from django import forms
from django.contrib.auth.models import User
from .models import UserProfile


class SignUpForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    bio = forms.CharField(widget=forms.Textarea, required=False)  # Ajoute le champ bio

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])  # Hash le mot de passe
        if commit:
            user.save()
        return user
