from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models.user import User


def token_required(f):
    """Decorator: requires valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            current_user = User.query.get(int(user_id))
            if not current_user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
            if current_user.status != 'active':
                return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
    return decorated


def role_required(*roles):
    """Decorator: requires specific user role(s)."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                current_user = User.query.get(int(user_id))
                if not current_user:
                    return jsonify({'success': False, 'message': 'User not found'}), 401
                if current_user.status != 'active':
                    return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
                if current_user.role not in roles:
                    return jsonify({
                        'success': False,
                        'message': f'Access denied. Required role: {", ".join(roles)}'
                    }), 403
                return f(current_user, *args, **kwargs)
            except Exception as e:
                return jsonify({'success': False, 'message': 'Authentication required'}), 401
        return decorated
    return decorator


def admin_required(f):
    """Decorator: requires admin role."""
    return role_required('admin')(f)


def seller_required(f):
    """Decorator: requires seller role."""
    return role_required('seller')(f)


def customer_required(f):
    """Decorator: requires customer role."""
    return role_required('customer')(f)


def seller_or_admin_required(f):
    """Decorator: requires seller or admin role."""
    return role_required('seller', 'admin')(f)
