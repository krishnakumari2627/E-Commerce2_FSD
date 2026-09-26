from flask import Blueprint, request
from datetime import datetime
import uuid
from app import db
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.order import Order, OrderItem, Payment, Address
from app.middleware.auth_middleware import token_required, customer_required, seller_or_admin_required, admin_required
from app.utils.error_handlers import success_response, error_response

order_bp = Blueprint('orders', __name__)


@order_bp.route('', methods=['POST'])
@token_required
@customer_required
def create_order(current_user):
    """Place a new order from cart."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    address_id = data.get('address_id')
    payment_method = data.get('payment_method', 'cod')
    notes = data.get('notes', '')

    if not address_id:
        return error_response('Delivery address is required')

    # Verify address belongs to user
    address = Address.query.filter_by(id=address_id, user_id=current_user.id).first()
    if not address:
        return error_response('Address not found', 404)

    if payment_method not in ('cod', 'online', 'demo'):
        return error_response('Invalid payment method')

    # Get cart
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart or cart.items.count() == 0:
        return error_response('Your cart is empty')

    # Validate stock for all items
    cart_items = cart.items.all()
    for item in cart_items:
        product = item.product
        if not product or product.status != 'active':
            return error_response(f'Product "{product.name if product else "Unknown"}" is no longer available')
        if product.stock_quantity < item.quantity:
            return error_response(f'Only {product.stock_quantity} units of "{product.name}" available')

    # Calculate totals
    totals = cart.get_totals()

    # Create order
    order = Order(
        user_id=current_user.id,
        address_id=address_id,
        total_amount=totals['subtotal'],
        discount_amount=totals['discount'],
        shipping_amount=totals['shipping'],
        final_amount=totals['final_amount'],
        payment_status='pending',
        order_status='pending',
        notes=notes
    )
    db.session.add(order)
    db.session.flush()

    # Create order items and reduce stock
    for item in cart_items:
        product = item.product
        effective_price = float(product.discount_price) if product.discount_price else float(product.price)
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            seller_id=product.seller_id,
            quantity=item.quantity,
            price=effective_price,
            subtotal=effective_price * item.quantity
        )
        db.session.add(order_item)

        # Reduce stock
        product.stock_quantity -= item.quantity
        if product.stock_quantity <= 0:
            product.status = 'out_of_stock'

    # Create payment record
    transaction_id = str(uuid.uuid4()).replace('-', '').upper()[:20]
    payment_status = 'pending'
    payment_date = None

    if payment_method == 'cod':
        payment_status = 'pending'  # Will be collected on delivery
    elif payment_method == 'demo':
        payment_status = 'completed'  # Demo payment auto-succeeds
        payment_date = datetime.utcnow()
        order.payment_status = 'paid'
        order.order_status = 'confirmed'

    payment = Payment(
        order_id=order.id,
        payment_method=payment_method,
        transaction_id=transaction_id,
        amount=totals['final_amount'],
        payment_status=payment_status,
        payment_date=payment_date
    )
    db.session.add(payment)

    # Clear cart
    CartItem.query.filter_by(cart_id=cart.id).delete()

    db.session.commit()

    return success_response(
        'Order placed successfully!',
        order.to_dict(detailed=True),
        201
    )


@order_bp.route('', methods=['GET'])
@token_required
@customer_required
def get_orders(current_user):
    """Get customer's order history."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Order.query.filter_by(user_id=current_user.id)\
                            .order_by(Order.created_at.desc())\
                            .paginate(page=page, per_page=per_page, error_out=False)

    return success_response('Orders retrieved', {
        'orders': [o.to_dict() for o in pagination.items],
        'pagination': {
            'page': page,
            'total': pagination.total,
            'pages': pagination.pages,
        }
    })


@order_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_order(current_user, order_id):
    """Get order details."""
    order = Order.query.get_or_404(order_id)

    # Customers can only see their own orders
    if current_user.role == 'customer' and order.user_id != current_user.id:
        return error_response('Access denied', 403)
    
    # Sellers can only see orders containing their products
    if current_user.role == 'seller':
        has_seller_item = any(
            item.seller_id == current_user.id for item in order.items
        )
        if not has_seller_item:
            return error_response('Access denied', 403)

    return success_response('Order retrieved', order.to_dict(detailed=True))


@order_bp.route('/<int:order_id>/cancel', methods=['POST'])
@token_required
@customer_required
def cancel_order(current_user, order_id):
    """Cancel an eligible order."""
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
    if not order:
        return error_response('Order not found', 404)

    if order.order_status not in ('pending', 'confirmed'):
        return error_response(f'Order cannot be cancelled. Current status: {order.order_status}')

    # Restore stock
    for item in order.items:
        if item.product:
            item.product.stock_quantity += item.quantity
            if item.product.status == 'out_of_stock':
                item.product.status = 'active'

    order.order_status = 'cancelled'
    order.payment_status = 'refunded' if order.payment_status == 'paid' else 'failed'
    db.session.commit()

    return success_response('Order cancelled successfully', order.to_dict(detailed=True))


@order_bp.route('/<int:order_id>/status', methods=['PUT'])
@token_required
@seller_or_admin_required
def update_order_status(current_user, order_id):
    """Update order status (seller/admin)."""
    order = Order.query.get_or_404(order_id)

    data = request.get_json()
    new_status = data.get('order_status')
    
    valid_statuses = ('pending', 'confirmed', 'processing', 'shipped', 
                      'out_for_delivery', 'delivered', 'cancelled')
    if new_status not in valid_statuses:
        return error_response(f'Invalid status. Valid statuses: {", ".join(valid_statuses)}')

    # Sellers can only update orders containing their products
    if current_user.role == 'seller':
        has_seller_item = any(
            item.seller_id == current_user.id for item in order.items
        )
        if not has_seller_item:
            return error_response('Access denied', 403)

    order.order_status = new_status
    
    if new_status == 'delivered':
        order.payment_status = 'paid'
        if order.payment:
            order.payment.payment_status = 'completed'
            order.payment.payment_date = datetime.utcnow()

    db.session.commit()
    return success_response('Order status updated', order.to_dict(detailed=True))


@order_bp.route('/all', methods=['GET'])
@token_required
@admin_required
def get_all_orders(current_user):
    """Get all orders (admin)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status', '')
    
    query = Order.query
    if status:
        query = query.filter_by(order_status=status)
    
    pagination = query.order_by(Order.created_at.desc())\
                      .paginate(page=page, per_page=per_page, error_out=False)

    return success_response('All orders retrieved', {
        'orders': [o.to_dict() for o in pagination.items],
        'pagination': {
            'page': page,
            'total': pagination.total,
            'pages': pagination.pages,
        }
    })
