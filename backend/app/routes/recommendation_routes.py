from flask import Blueprint, request
from app import db
from app.models.product import Product
from app.models.cart import Wishlist
from app.models.order import Order, OrderItem
from app.middleware.auth_middleware import token_required, customer_required
from app.utils.error_handlers import success_response, error_response

recommendation_bp = Blueprint('recommendations', __name__)


@recommendation_bp.route('', methods=['GET'])
@token_required
@customer_required
def get_recommendations(current_user):
    """
    Rule-based recommendation engine.
    Recommends products based on:
    1. User's previous purchases (same category)
    2. Wishlist items (same category)
    3. Popular products in user's preferred categories
    4. Fallback: top-rated products across all categories
    """
    user_id = current_user.id
    recommended_ids = set()
    recommendations = []

    # Step 1: Get categories from previous purchases
    purchased_categories = db.session.query(Product.category_id).join(
        OrderItem, OrderItem.product_id == Product.id
    ).join(Order, Order.id == OrderItem.order_id)\
     .filter(Order.user_id == user_id).distinct().all()
    
    purchased_product_ids = db.session.query(OrderItem.product_id).join(
        Order, Order.id == OrderItem.order_id
    ).filter(Order.user_id == user_id).all()
    purchased_product_ids = {p[0] for p in purchased_product_ids}

    category_ids = [c[0] for c in purchased_categories]

    # Step 2: Get categories from wishlist
    wishlist_categories = db.session.query(Product.category_id).join(
        Wishlist, Wishlist.product_id == Product.id
    ).filter(Wishlist.user_id == user_id).distinct().all()
    
    wishlist_product_ids = db.session.query(Wishlist.product_id)\
                                      .filter(Wishlist.user_id == user_id).all()
    wishlist_product_ids = {w[0] for w in wishlist_product_ids}

    category_ids.extend([c[0] for c in wishlist_categories])
    excluded_ids = purchased_product_ids | wishlist_product_ids

    # Step 3: Get products from preferred categories
    if category_ids:
        preferred = Product.query.filter(
            Product.category_id.in_(category_ids),
            Product.status == 'active',
            Product.stock_quantity > 0,
            ~Product.id.in_(excluded_ids) if excluded_ids else db.true()
        ).order_by(Product.views.desc()).limit(8).all()
        
        for p in preferred:
            if p.id not in recommended_ids:
                recommended_ids.add(p.id)
                recommendations.append(p.to_dict())

    # Step 4: Fill with popular products if not enough
    if len(recommendations) < 8:
        popular = Product.query.filter(
            Product.status == 'active',
            Product.stock_quantity > 0,
            ~Product.id.in_(recommended_ids | excluded_ids) if (recommended_ids | excluded_ids) else db.true()
        ).order_by(Product.views.desc()).limit(8 - len(recommendations)).all()
        
        for p in popular:
            recommendations.append(p.to_dict())

    return success_response('Recommendations retrieved', {
        'recommendations': recommendations,
        'is_personalized': len(category_ids) > 0
    })


@recommendation_bp.route('/trending', methods=['GET'])
def get_trending():
    """Get trending/popular products (no auth required)."""
    products = Product.query.filter(
        Product.status == 'active',
        Product.stock_quantity > 0
    ).order_by(Product.views.desc()).limit(8).all()
    
    return success_response('Trending products retrieved', [p.to_dict() for p in products])


@recommendation_bp.route('/featured', methods=['GET'])
def get_featured():
    """Get featured products with discounts."""
    products = Product.query.filter(
        Product.status == 'active',
        Product.discount_price.isnot(None),
        Product.stock_quantity > 0
    ).order_by(Product.created_at.desc()).limit(8).all()
    
    return success_response('Featured products retrieved', [p.to_dict() for p in products])
