from flask import Blueprint, request
from app import db
from app.models.cart import Wishlist
from app.models.product import Product
from app.middleware.auth_middleware import token_required, customer_required
from app.utils.error_handlers import success_response, error_response

wishlist_bp = Blueprint('wishlist', __name__)


@wishlist_bp.route('', methods=['GET'])
@token_required
@customer_required
def get_wishlist(current_user):
    """Get user's wishlist."""
    items = Wishlist.query.filter_by(user_id=current_user.id)\
                          .order_by(Wishlist.created_at.desc()).all()
    return success_response('Wishlist retrieved', [item.to_dict() for item in items])


@wishlist_bp.route('', methods=['POST'])
@token_required
@customer_required
def add_to_wishlist(current_user):
    """Add product to wishlist."""
    data = request.get_json()
    product_id = data.get('product_id') if data else None

    if not product_id:
        return error_response('Product ID is required')

    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)

    # Check for duplicate
    existing = Wishlist.query.filter_by(
        user_id=current_user.id, product_id=product_id
    ).first()
    if existing:
        return error_response('Product already in wishlist', 409)

    item = Wishlist(user_id=current_user.id, product_id=product_id)
    db.session.add(item)
    db.session.commit()

    return success_response('Added to wishlist', item.to_dict(), 201)


@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
@token_required
@customer_required
def remove_from_wishlist(current_user, product_id):
    """Remove product from wishlist."""
    item = Wishlist.query.filter_by(
        user_id=current_user.id, product_id=product_id
    ).first()

    if not item:
        return error_response('Item not found in wishlist', 404)

    db.session.delete(item)
    db.session.commit()
    return success_response('Removed from wishlist')
