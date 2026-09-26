from flask import Blueprint, request
from app import db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.middleware.auth_middleware import token_required, customer_required
from app.utils.error_handlers import success_response, error_response

cart_bp = Blueprint('cart', __name__)


def get_or_create_cart(user_id):
    """Get or create cart for user."""
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.flush()
    return cart


@cart_bp.route('', methods=['GET'])
@token_required
@customer_required
def get_cart(current_user):
    """Get user's cart."""
    cart = get_or_create_cart(current_user.id)
    db.session.commit()
    return success_response('Cart retrieved', cart.to_dict())


@cart_bp.route('/items', methods=['POST'])
@token_required
@customer_required
def add_to_cart(current_user):
    """Add item to cart."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return error_response('Product ID is required')

    try:
        quantity = int(quantity)
        if quantity <= 0:
            return error_response('Quantity must be at least 1')
    except (TypeError, ValueError):
        return error_response('Invalid quantity')

    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)
    if product.status != 'active':
        return error_response('Product is not available')
    if product.stock_quantity <= 0:
        return error_response('Product is out of stock')
    if quantity > product.stock_quantity:
        return error_response(f'Only {product.stock_quantity} items available in stock')

    cart = get_or_create_cart(current_user.id)

    # Check if item already in cart
    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
    if cart_item:
        new_qty = cart_item.quantity + quantity
        if new_qty > product.stock_quantity:
            return error_response(f'Cannot add more. Only {product.stock_quantity} in stock')
        cart_item.quantity = new_qty
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)

    db.session.commit()
    cart = Cart.query.get(cart.id)
    return success_response('Item added to cart', cart.to_dict(), 201)


@cart_bp.route('/items/<int:item_id>', methods=['PUT'])
@token_required
@customer_required
def update_cart_item(current_user, item_id):
    """Update cart item quantity."""
    cart_item = CartItem.query.get_or_404(item_id)
    
    # Verify ownership
    if cart_item.cart.user_id != current_user.id:
        return error_response('Access denied', 403)

    data = request.get_json()
    quantity = data.get('quantity')

    try:
        quantity = int(quantity)
        if quantity <= 0:
            return error_response('Quantity must be at least 1')
    except (TypeError, ValueError):
        return error_response('Invalid quantity')

    product = cart_item.product
    if quantity > product.stock_quantity:
        return error_response(f'Only {product.stock_quantity} items available in stock')

    cart_item.quantity = quantity
    db.session.commit()

    cart = cart_item.cart
    return success_response('Cart updated', cart.to_dict())


@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@token_required
@customer_required
def remove_cart_item(current_user, item_id):
    """Remove item from cart."""
    cart_item = CartItem.query.get_or_404(item_id)

    if cart_item.cart.user_id != current_user.id:
        return error_response('Access denied', 403)

    cart = cart_item.cart
    db.session.delete(cart_item)
    db.session.commit()

    cart = Cart.query.get(cart.id)
    return success_response('Item removed from cart', cart.to_dict())


@cart_bp.route('', methods=['DELETE'])
@token_required
@customer_required
def clear_cart(current_user):
    """Clear all items from cart."""
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if cart:
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()
    return success_response('Cart cleared')
