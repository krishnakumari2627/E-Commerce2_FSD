from flask import Blueprint, request
from app import db
from app.models.order import Review, Order, OrderItem
from app.models.product import Product
from app.middleware.auth_middleware import token_required, customer_required, admin_required
from app.utils.validators import validate_rating
from app.utils.error_handlers import success_response, error_response

review_bp = Blueprint('reviews', __name__)


@review_bp.route('', methods=['POST'])
@token_required
@customer_required
def create_review(current_user):
    """Submit a product review (must have purchased the product)."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    product_id = data.get('product_id')
    rating = data.get('rating')
    review_text = data.get('review_text', '').strip()

    if not product_id:
        return error_response('Product ID is required')
    if not validate_rating(rating):
        return error_response('Rating must be between 1 and 5')

    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)

    # Check if user has purchased this product
    purchased = OrderItem.query.join(Order).filter(
        Order.user_id == current_user.id,
        OrderItem.product_id == product_id,
        Order.order_status.in_(('delivered', 'out_for_delivery'))
    ).first()
    
    if not purchased:
        return error_response('You can only review products you have purchased and received')

    # Check for duplicate review
    existing = Review.query.filter_by(
        user_id=current_user.id, product_id=product_id
    ).first()
    if existing:
        return error_response('You have already reviewed this product', 409)

    review = Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=int(rating),
        review_text=review_text,
        status='approved'
    )
    db.session.add(review)
    db.session.commit()

    return success_response('Review submitted successfully', review.to_dict(), 201)


@review_bp.route('/<int:review_id>', methods=['PUT'])
@token_required
@customer_required
def update_review(current_user, review_id):
    """Update own review."""
    review = Review.query.filter_by(id=review_id, user_id=current_user.id).first()
    if not review:
        return error_response('Review not found', 404)

    data = request.get_json()
    if 'rating' in data:
        if not validate_rating(data['rating']):
            return error_response('Rating must be between 1 and 5')
        review.rating = int(data['rating'])
    if 'review_text' in data:
        review.review_text = data['review_text'].strip()

    db.session.commit()
    return success_response('Review updated', review.to_dict())


@review_bp.route('/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(current_user, review_id):
    """Delete a review (own or admin)."""
    review = Review.query.get_or_404(review_id)
    
    if current_user.role != 'admin' and review.user_id != current_user.id:
        return error_response('Access denied', 403)

    db.session.delete(review)
    db.session.commit()
    return success_response('Review deleted')


@review_bp.route('/<int:review_id>/moderate', methods=['PUT'])
@token_required
@admin_required
def moderate_review(current_user, review_id):
    """Admin: approve or reject a review."""
    review = Review.query.get_or_404(review_id)
    data = request.get_json()
    status = data.get('status')
    
    if status not in ('approved', 'rejected', 'pending'):
        return error_response('Invalid status')
    
    review.status = status
    db.session.commit()
    return success_response('Review moderated', review.to_dict())


@review_bp.route('/all', methods=['GET'])
@token_required
@admin_required
def get_all_reviews(current_user):
    """Admin: get all reviews."""
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    
    query = Review.query
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.order_by(Review.created_at.desc())\
                      .paginate(page=page, per_page=20, error_out=False)
    
    return success_response('Reviews retrieved', {
        'reviews': [r.to_dict() for r in pagination.items],
        'pagination': {
            'page': page,
            'total': pagination.total,
            'pages': pagination.pages,
        }
    })
