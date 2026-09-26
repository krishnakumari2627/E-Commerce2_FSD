from flask import Blueprint, request
from sqlalchemy import func
from app import db
from app.models.product import Product
from app.models.order import Order, OrderItem, Review
from app.middleware.auth_middleware import token_required, seller_required
from app.utils.error_handlers import success_response, error_response

seller_bp = Blueprint('seller', __name__)


@seller_bp.route('/dashboard', methods=['GET'])
@token_required
@seller_required
def dashboard(current_user):
    """Seller dashboard statistics."""
    seller_id = current_user.id
    
    total_products = Product.query.filter_by(seller_id=seller_id, status='active').count()
    
    total_orders = db.session.query(func.count(func.distinct(OrderItem.order_id)))\
                             .filter(OrderItem.seller_id == seller_id).scalar() or 0
    
    total_revenue = db.session.query(func.sum(OrderItem.subtotal))\
                              .join(Order, Order.id == OrderItem.order_id)\
                              .filter(
                                  OrderItem.seller_id == seller_id,
                                  Order.payment_status == 'paid'
                              ).scalar() or 0
    
    pending_orders = db.session.query(func.count(func.distinct(OrderItem.order_id)))\
                               .join(Order, Order.id == OrderItem.order_id)\
                               .filter(
                                   OrderItem.seller_id == seller_id,
                                   Order.order_status == 'pending'
                               ).scalar() or 0
    
    low_stock = Product.query.filter(
        Product.seller_id == seller_id,
        Product.stock_quantity <= 5,
        Product.status == 'active'
    ).all()
    
    # Monthly sales
    from datetime import datetime, timedelta
    monthly_sales = []
    for i in range(5, -1, -1):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=i*30))
        month_end = (datetime.utcnow().replace(day=1) - timedelta(days=(i-1)*30)) if i > 0 else datetime.utcnow()
        
        rev = db.session.query(func.sum(OrderItem.subtotal))\
                        .join(Order, Order.id == OrderItem.order_id)\
                        .filter(
                            OrderItem.seller_id == seller_id,
                            Order.created_at >= month_start,
                            Order.created_at < month_end,
                            Order.payment_status == 'paid'
                        ).scalar() or 0
        
        monthly_sales.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': float(rev)
        })

    # Recent orders for this seller
    recent_order_items = OrderItem.query.filter_by(seller_id=seller_id)\
                                        .order_by(OrderItem.id.desc()).limit(10).all()
    
    return success_response('Dashboard retrieved', {
        'stats': {
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'pending_orders': pending_orders,
            'low_stock_count': len(low_stock),
        },
        'low_stock_products': [p.to_dict() for p in low_stock],
        'monthly_sales': monthly_sales,
        'recent_orders': [
            {
                'order_id': item.order_id,
                'product': item.product.to_dict() if item.product else None,
                'quantity': item.quantity,
                'subtotal': float(item.subtotal),
                'order_status': item.order.order_status if item.order else None,
                'created_at': item.order.created_at.isoformat() if item.order else None,
            }
            for item in recent_order_items
        ]
    })


@seller_bp.route('/products', methods=['GET'])
@token_required
@seller_required
def get_seller_products(current_user):
    """Get seller's own products."""
    page = request.args.get('page', 1, type=int)
    
    pagination = Product.query.filter_by(seller_id=current_user.id)\
                              .order_by(Product.created_at.desc())\
                              .paginate(page=page, per_page=20, error_out=False)
    
    return success_response('Products retrieved', {
        'products': [p.to_dict(detailed=True) for p in pagination.items],
        'pagination': {'page': page, 'total': pagination.total, 'pages': pagination.pages}
    })


@seller_bp.route('/orders', methods=['GET'])
@token_required
@seller_required
def get_seller_orders(current_user):
    """Get orders containing seller's products."""
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    
    query = db.session.query(Order).join(
        OrderItem, OrderItem.order_id == Order.id
    ).filter(OrderItem.seller_id == current_user.id).distinct()
    
    if status:
        query = query.filter(Order.order_status == status)
    
    pagination = query.order_by(Order.created_at.desc())\
                      .paginate(page=page, per_page=20, error_out=False)
    
    return success_response('Orders retrieved', {
        'orders': [o.to_dict(detailed=True) for o in pagination.items],
        'pagination': {'page': page, 'total': pagination.total, 'pages': pagination.pages}
    })


@seller_bp.route('/reviews', methods=['GET'])
@token_required
@seller_required
def get_seller_reviews(current_user):
    """Get reviews for seller's products."""
    reviews = Review.query.join(Product, Product.id == Review.product_id)\
                          .filter(Product.seller_id == current_user.id)\
                          .order_by(Review.created_at.desc()).all()
    
    return success_response('Reviews retrieved', [r.to_dict() for r in reviews])
