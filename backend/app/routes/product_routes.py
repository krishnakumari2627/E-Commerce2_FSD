from flask import Blueprint, request
from app import db
from app.models.product import Category, Product
from app.models.order import Review
from app.middleware.auth_middleware import token_required, seller_or_admin_required, admin_required
from app.utils.validators import validate_price, validate_stock
from app.utils.error_handlers import success_response, error_response

product_bp = Blueprint('products', __name__)


@product_bp.route('', methods=['GET'])
def get_products():
    """Get all products with search, filter, and sort."""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', request.args.get('limit', 12, type=int), type=int), 50)
    
    search = request.args.get('search', '').strip()
    category_id = request.args.get('category_id', type=int)
    category_param = request.args.get('category', '').strip()
    brand = request.args.get('brand', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    in_stock = str(request.args.get('in_stock', 'false')).lower() == 'true'
    sort_by = request.args.get('sort_by', request.args.get('sort', 'newest')).lower()

    # Map sort variations
    if sort_by in ('price_low', 'price_asc', 'low_to_high'):
        sort_by = 'price_asc'
    elif sort_by in ('price_high', 'price_desc', 'high_to_low'):
        sort_by = 'price_desc'
    elif sort_by in ('rating', 'highest_rated'):
        sort_by = 'rating'
    elif sort_by == 'popular':
        sort_by = 'popular'
    else:
        sort_by = 'newest'

    query = Product.query.filter_by(status='active')

    # Search filter
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            db.or_(
                Product.name.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    # Category filter (by category_id or category name/slug)
    if category_id:
        query = query.filter_by(category_id=category_id)
    elif category_param:
        if category_param.isdigit():
            query = query.filter_by(category_id=int(category_param))
        else:
            cat = Category.query.filter(
                db.or_(
                    Category.name.ilike(f'%{category_param}%'),
                    Category.name.ilike(category_param.replace('-', ' '))
                )
            ).first()
            if cat:
                query = query.filter_by(category_id=cat.id)

    # Brand filter
    if brand:
        query = query.filter(Product.brand.ilike(f'%{brand}%'))

    # Price range filter
    if min_price is not None:
        query = query.filter(
            db.or_(
                db.and_(Product.discount_price.isnot(None), Product.discount_price >= min_price),
                db.and_(Product.discount_price.is_(None), Product.price >= min_price)
            )
        )
    if max_price is not None:
        query = query.filter(
            db.or_(
                db.and_(Product.discount_price.isnot(None), Product.discount_price <= max_price),
                db.and_(Product.discount_price.is_(None), Product.price <= max_price)
            )
        )

    # Stock filter
    if in_stock:
        query = query.filter(Product.stock_quantity > 0)

    # Sorting
    if sort_by == 'price_asc':
        query = query.order_by(
            db.case((Product.discount_price.isnot(None), Product.discount_price), else_=Product.price).asc()
        )
    elif sort_by == 'price_desc':
        query = query.order_by(
            db.case((Product.discount_price.isnot(None), Product.discount_price), else_=Product.price).desc()
        )
    elif sort_by == 'popular':
        query = query.order_by(Product.views.desc())
    else:  # newest
        query = query.order_by(Product.created_at.desc())

    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    products = [p.to_dict() for p in pagination.items]
    
    # Apply rating filter after pagination (since it's computed)
    if min_rating:
        products = [p for p in products if p['average_rating'] >= min_rating]

    # Get unique brands for filter panel
    brands = db.session.query(Product.brand).filter(
        Product.brand.isnot(None), Product.status == 'active'
    ).distinct().all()

    return success_response('Products retrieved', {
        'products': products,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
        },
        'brands': [b[0] for b in brands if b[0]],
    })


@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID."""
    product = Product.query.get_or_404(product_id)
    
    # Increment view count
    product.views += 1
    db.session.commit()
    
    # Get related products (same category)
    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product_id,
        Product.status == 'active'
    ).limit(6).all()

    return success_response('Product retrieved', {
        'product': product.to_dict(detailed=True),
        'related_products': [p.to_dict() for p in related],
    })


@product_bp.route('', methods=['POST'])
@token_required
@seller_or_admin_required
def create_product(current_user):
    """Create a new product (seller/admin)."""
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    name = data.get('name', '').strip()
    if not name:
        return error_response('Product name is required')
    
    category_id = data.get('category_id')
    if not category_id:
        return error_response('Category is required')
    
    category = Category.query.get(category_id)
    if not category:
        return error_response('Category not found', 404)

    price = data.get('price')
    if not validate_price(price):
        return error_response('Valid positive price is required')

    stock = data.get('stock_quantity', 0)
    if not validate_stock(stock):
        return error_response('Stock quantity must be a non-negative number')

    discount_price = data.get('discount_price')
    if discount_price is not None:
        if not validate_price(discount_price):
            return error_response('Valid discount price required')
        if float(discount_price) >= float(price):
            return error_response('Discount price must be less than original price')

    seller_id = current_user.id if current_user.role == 'seller' else data.get('seller_id', current_user.id)

    product = Product(
        seller_id=seller_id,
        category_id=category_id,
        name=name,
        description=data.get('description', ''),
        price=float(price),
        discount_price=float(discount_price) if discount_price else None,
        stock_quantity=int(stock),
        brand=data.get('brand', ''),
        image_url=data.get('image_url', ''),
        status='active'
    )
    db.session.add(product)
    db.session.commit()

    return success_response('Product created successfully', product.to_dict(detailed=True), 201)


@product_bp.route('/<int:product_id>', methods=['PUT'])
@token_required
@seller_or_admin_required
def update_product(current_user, product_id):
    """Update a product."""
    product = Product.query.get_or_404(product_id)

    # Sellers can only update their own products
    if current_user.role == 'seller' and product.seller_id != current_user.id:
        return error_response('You can only update your own products', 403)

    data = request.get_json()
    if not data:
        return error_response('No data provided')

    if 'name' in data:
        product.name = data['name'].strip()
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        if not validate_price(data['price']):
            return error_response('Invalid price')
        product.price = float(data['price'])
    if 'discount_price' in data:
        dp = data['discount_price']
        if dp is not None and dp != '':
            if not validate_price(dp):
                return error_response('Invalid discount price')
            if float(dp) >= float(product.price):
                return error_response('Discount price must be less than original price')
            product.discount_price = float(dp)
        else:
            product.discount_price = None
    if 'stock_quantity' in data:
        if not validate_stock(data['stock_quantity']):
            return error_response('Invalid stock quantity')
        product.stock_quantity = int(data['stock_quantity'])
    if 'brand' in data:
        product.brand = data['brand']
    if 'image_url' in data:
        product.image_url = data['image_url']
    if 'status' in data and data['status'] in ('active', 'inactive'):
        product.status = data['status']
    if 'category_id' in data:
        cat = Category.query.get(data['category_id'])
        if not cat:
            return error_response('Category not found', 404)
        product.category_id = data['category_id']

    db.session.commit()
    return success_response('Product updated successfully', product.to_dict(detailed=True))


@product_bp.route('/<int:product_id>', methods=['DELETE'])
@token_required
@seller_or_admin_required
def delete_product(current_user, product_id):
    """Delete/deactivate a product."""
    product = Product.query.get_or_404(product_id)

    if current_user.role == 'seller' and product.seller_id != current_user.id:
        return error_response('You can only delete your own products', 403)

    # Soft delete - just deactivate
    product.status = 'inactive'
    db.session.commit()
    return success_response('Product deleted successfully')


@product_bp.route('/<int:product_id>/reviews', methods=['GET'])
def get_product_reviews(product_id):
    """Get all reviews for a product."""
    product = Product.query.get_or_404(product_id)
    reviews = Review.query.filter_by(product_id=product_id, status='approved')\
                          .order_by(Review.created_at.desc()).all()
    
    return success_response('Reviews retrieved', {
        'reviews': [r.to_dict() for r in reviews],
        'average_rating': product.average_rating,
        'review_count': product.review_count,
    })
