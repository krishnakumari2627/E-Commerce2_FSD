from flask import Blueprint, request
from app import db
from app.models.product import Category
from app.middleware.auth_middleware import token_required, admin_required
from app.utils.error_handlers import success_response, error_response

category_bp = Blueprint('categories', __name__)


@category_bp.route('', methods=['GET'])
def get_categories():
    """Get all active categories."""
    categories = Category.query.filter_by(status='active').order_by(Category.name).all()
    return success_response('Categories retrieved', [c.to_dict() for c in categories])


@category_bp.route('/<int:cat_id>', methods=['GET'])
def get_category(cat_id):
    """Get a single category."""
    cat = Category.query.get_or_404(cat_id)
    return success_response('Category retrieved', cat.to_dict())


@category_bp.route('', methods=['POST'])
@token_required
@admin_required
def create_category(current_user):
    """Create a new category (admin only)."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    name = data.get('name', '').strip()
    if not name:
        return error_response('Category name is required')
    
    if Category.query.filter_by(name=name).first():
        return error_response('Category with this name already exists', 409)

    cat = Category(
        name=name,
        description=data.get('description', ''),
        image=data.get('image', ''),
        status='active'
    )
    db.session.add(cat)
    db.session.commit()
    return success_response('Category created successfully', cat.to_dict(), 201)


@category_bp.route('/<int:cat_id>', methods=['PUT'])
@token_required
@admin_required
def update_category(current_user, cat_id):
    """Update a category (admin only)."""
    cat = Category.query.get_or_404(cat_id)
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    if 'name' in data:
        cat.name = data['name'].strip()
    if 'description' in data:
        cat.description = data['description']
    if 'image' in data:
        cat.image = data['image']
    if 'status' in data and data['status'] in ('active', 'inactive'):
        cat.status = data['status']

    db.session.commit()
    return success_response('Category updated successfully', cat.to_dict())


@category_bp.route('/<int:cat_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_category(current_user, cat_id):
    """Delete/deactivate a category (admin only)."""
    cat = Category.query.get_or_404(cat_id)
    cat.status = 'inactive'
    db.session.commit()
    return success_response('Category deactivated successfully')
