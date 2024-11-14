from django.core.exceptions import ValidationError


class CustomPasswordValidator():
    def validate(self, password, user=None):
        if not any(c.islower() for c in password):
            raise ValidationError(
                "The password must contain at least one lowercase letter.",
                code="password_no_lower",
            )
        if not any(c.isupper() for c in password):
            raise ValidationError(
                "The password must contain at least one uppercase letter.",
                code="password_no_upper",
            )
        if not any(c.isdigit() for c in password):
            raise ValidationError(
                "The password must contain at least one digit.",
                code="password_no_digit",
            )

    def get_help_text(self):
        return "Your password must contain a combination of upper/lowercase as well as digits/letters."
