from flask import Blueprint, request
from sqlalchemy import func
from app import db
from app.models.user import User
from app.models.product import Category, Product
from app.models.cart import Wishlist
from app.models.order import Order, OrderItem, Review, Payment
from app.middleware.auth_middleware import token_required, admin_required
from app.utils.error_handlers import success_response, error_response

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@token_required
@admin_required
def dashboard(current_user):
    """Admin dashboard statistics."""
    total_users = User.query.filter_by(role='customer').count()
    total_sellers = User.query.filter_by(role='seller').count()
    total_products = Product.query.filter_by(status='active').count()
    total_orders = Order.query.count()
    
    total_revenue = db.session.query(
        func.sum(Order.final_amount)
    ).filter(Order.payment_status == 'paid').scalar() or 0
    
    pending_orders = Order.query.filter_by(order_status='pending').count()
    
    low_stock = Product.query.filter(
        Product.stock_quantity <= 5,
        Product.status == 'active'
    ).count()
    
    # Monthly revenue for chart (last 6 months)
    from datetime import datetime, timedelta
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = (datetime.utcnow().replace(day=1) - timedelta(days=i*30))
        month_end = (datetime.utcnow().replace(day=1) - timedelta(days=(i-1)*30)) if i > 0 else datetime.utcnow()
        
        revenue = db.session.query(func.sum(Order.final_amount)).filter(
            Order.created_at >= month_start,
            Order.created_at < month_end,
            Order.payment_status == 'paid'
        ).scalar() or 0
        
        orders_count = Order.query.filter(
            Order.created_at >= month_start,
            Order.created_at < month_end
        ).count()
        
        monthly_data.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': float(revenue),
            'orders': orders_count
        })

    # Category distribution
    category_data = db.session.query(
        Category.name,
        func.count(Product.id).label('count')
    ).join(Product, Product.category_id == Category.id)\
     .filter(Product.status == 'active')\
     .group_by(Category.name).all()

    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    
    # Top selling products
    top_products = db.session.query(
        Product.name,
        Product.image_url,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.subtotal).label('revenue')
    ).join(OrderItem, OrderItem.product_id == Product.id)\
     .group_by(Product.id)\
     .order_by(func.sum(OrderItem.subtotal).desc())\
     .limit(5).all()

    return success_response('Dashboard data retrieved', {
        'stats': {
            'total_users': total_users,
            'total_sellers': total_sellers,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'pending_orders': pending_orders,
            'low_stock_products': low_stock,
        },
        'monthly_data': monthly_data,
        'category_distribution': [
            {'name': c[0], 'count': c[1]} for c in category_data
        ],
        'recent_orders': [o.to_dict() for o in recent_orders],
        'top_products': [
            {
                'name': p[0],
                'image': p[1],
                'total_sold': int(p[2]),
                'revenue': float(p[3])
            } for p in top_products
        ],
    })


@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    """Admin: get all users."""
    page = request.args.get('page', 1, type=int)
    role = request.args.get('role', '')
    search = request.args.get('search', '').strip()
    
    query = User.query
    if role:
        query = query.filter_by(role=role)
    if search:
        query = query.filter(
            db.or_(User.name.ilike(f'%{search}%'), User.email.ilike(f'%{search}%'))
        )
    
    pagination = query.order_by(User.created_at.desc())\
                      .paginate(page=page, per_page=20, error_out=False)
    
    return success_response('Users retrieved', {
        'users': [u.to_dict() for u in pagination.items],
        'pagination': {'page': page, 'total': pagination.total, 'pages': pagination.pages}
    })


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_user_status(current_user, user_id):
    """Admin: activate/deactivate a user."""
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return error_response('Cannot modify admin users')
    
    data = request.get_json()
    status = data.get('status')
    if status not in ('active', 'inactive', 'banned'):
        return error_response('Invalid status')
    
    user.status = status
    db.session.commit()
    return success_response(f'User status updated to {status}', user.to_dict())


@admin_bp.route('/products', methods=['GET'])
@token_required
@admin_required
def get_all_products(current_user):
    """Admin: get all products."""
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    
    query = Product.query
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(Product.created_at.desc())\
                      .paginate(page=page, per_page=20, error_out=False)
    
    return success_response('Products retrieved', {
        'products': [p.to_dict() for p in pagination.items],
        'pagination': {'page': page, 'total': pagination.total, 'pages': pagination.pages}
    })


@admin_bp.route('/analytics', methods=['GET'])
@token_required
@admin_required
def get_analytics(current_user):
    """Admin: platform analytics."""
    # User growth over time
    user_growth = db.session.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).group_by(func.date(User.created_at))\
     .order_by(func.date(User.created_at).desc())\
     .limit(30).all()
    
    # Revenue by category
    rev_by_category = db.session.query(
        Category.name,
        func.sum(OrderItem.subtotal).label('revenue')
    ).join(Product, Product.category_id == Category.id)\
     .join(OrderItem, OrderItem.product_id == Product.id)\
     .join(Order, Order.id == OrderItem.order_id)\
     .filter(Order.payment_status == 'paid')\
     .group_by(Category.name).all()

    return success_response('Analytics retrieved', {
        'user_growth': [
            {'date': str(u[0]), 'count': u[1]} for u in user_growth
        ],
        'revenue_by_category': [
            {'category': r[0], 'revenue': float(r[1])} for r in rev_by_category
        ],
    })
