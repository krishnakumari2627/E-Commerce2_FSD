from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from datetime import timedelta
from app import db
from app.models.user import User
from app.models.cart import Cart
from app.middleware.auth_middleware import token_required
from app.utils.validators import validate_email, validate_password, validate_phone
from app.utils.error_handlers import success_response, error_response

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'customer')
    phone = data.get('phone', '').strip()

    # Validations
    if not name or len(name) < 2:
        return error_response('Name must be at least 2 characters')
    if not email or not validate_email(email):
        return error_response('Please enter a valid email address')
    
    valid_pw, pw_msg = validate_password(password)
    if not valid_pw:
        return error_response(pw_msg)
    
    if role not in ('customer', 'seller'):
        return error_response('Invalid role. Choose customer or seller')
    
    if phone and not validate_phone(phone):
        return error_response('Please enter a valid 10-digit phone number')

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return error_response('Email already registered. Please login.', 409)

    # Create user
    user = User(name=name, email=email, role=role, phone=phone or None)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    # Create cart for customers
    if role == 'customer':
        cart = Cart(user_id=user.id)
        db.session.add(cart)

    db.session.commit()

    # Generate token
    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(days=1)
    )

    return success_response(
        'Registration successful! Welcome to SmartCart.',
        {
            'token': token,
            'user': user.to_dict()
        },
        201
    )


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return error_response('Email and password are required')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return error_response('Invalid email or password', 401)

    if user.status == 'banned':
        return error_response('Your account has been banned. Contact support.', 403)

    if user.status == 'inactive':
        return error_response('Your account is deactivated. Contact support.', 403)

    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(days=1)
    )

    return success_response(
        f'Welcome back, {user.name}!',
        {
            'token': token,
            'user': user.to_dict()
        }
    )


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Logout user (client should discard the token)."""
    return success_response('Logged out successfully')


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    """Get current authenticated user."""
    return success_response('User profile retrieved', current_user.to_dict())


@auth_bp.route('/me', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    if 'name' in data:
        name = data['name'].strip()
        if len(name) < 2:
            return error_response('Name must be at least 2 characters')
        current_user.name = name

    if 'phone' in data:
        phone = data['phone'].strip()
        if phone and not validate_phone(phone):
            return error_response('Invalid phone number')
        current_user.phone = phone or None

    if 'password' in data and data['password']:
        valid_pw, pw_msg = validate_password(data['password'])
        if not valid_pw:
            return error_response(pw_msg)
        current_user.set_password(data['password'])

    db.session.commit()
    return success_response('Profile updated successfully', current_user.to_dict())
