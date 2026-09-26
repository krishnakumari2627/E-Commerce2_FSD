from flask import Blueprint, request
from datetime import datetime
import uuid
from app import db
from app.models.order import Payment, Order
from app.middleware.auth_middleware import token_required, customer_required
from app.utils.error_handlers import success_response, error_response

payment_bp = Blueprint('payments', __name__)


@payment_bp.route('/demo', methods=['POST'])
@token_required
@customer_required
def demo_payment(current_user):
    """
    DEMO PAYMENT: Simulates online payment for development/testing.
    In production, replace with Razorpay/Stripe SDK.
    """
    data = request.get_json()
    order_id = data.get('order_id')
    
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
    if not order:
        return error_response('Order not found', 404)
    
    if order.payment_status == 'paid':
        return error_response('Order is already paid')

    payment = order.payment
    if not payment:
        return error_response('Payment record not found', 404)

    # Simulate payment processing delay (in real app, gateway handles this)
    transaction_id = f'DEMO-{str(uuid.uuid4()).upper()[:12]}'
    
    payment.transaction_id = transaction_id
    payment.payment_status = 'completed'
    payment.payment_date = datetime.utcnow()
    payment.gateway_response = '{"status": "demo_success", "mode": "test"}'
    
    order.payment_status = 'paid'
    order.order_status = 'confirmed'
    
    db.session.commit()
    
    return success_response(
        '[DEMO] Payment successful! This is a test payment.',
        {
            'transaction_id': transaction_id,
            'amount': float(payment.amount),
            'status': 'completed',
            'order': order.to_dict(detailed=True),
            'demo_notice': 'This is a DEMO payment. No real money was charged.'
        }
    )


@payment_bp.route('/<int:order_id>', methods=['GET'])
@token_required
@customer_required
def get_payment(current_user, order_id):
    """Get payment details for an order."""
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
    if not order:
        return error_response('Order not found', 404)

    payment = order.payment
    if not payment:
        return error_response('Payment not found', 404)

    return success_response('Payment retrieved', payment.to_dict())
