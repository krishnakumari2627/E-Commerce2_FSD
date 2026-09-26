import re


def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one digit'
    return True, 'Password is strong'


def validate_phone(phone):
    """Validate Indian phone number."""
    pattern = r'^[6-9]\d{9}$'
    return bool(re.match(pattern, str(phone).replace(' ', '').replace('-', '')))


def validate_pincode(pincode):
    """Validate Indian pincode."""
    pattern = r'^\d{6}$'
    return bool(re.match(pattern, str(pincode)))


def validate_price(price):
    """Validate product price."""
    try:
        p = float(price)
        return p > 0
    except (TypeError, ValueError):
        return False


def validate_stock(quantity):
    """Validate stock quantity."""
    try:
        q = int(quantity)
        return q >= 0
    except (TypeError, ValueError):
        return False


def validate_rating(rating):
    """Validate review rating."""
    try:
        r = int(rating)
        return 1 <= r <= 5
    except (TypeError, ValueError):
        return False
