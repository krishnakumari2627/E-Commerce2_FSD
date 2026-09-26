from datetime import datetime
from app import db


class Category(db.Model):
    """Product category model."""
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(500), nullable=True)
    status = db.Column(db.Enum('active', 'inactive'), nullable=False, default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', backref='category', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'image': self.image,
            'status': self.status,
            'product_count': self.products.filter_by(status='active').count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Category {self.name}>'


class Product(db.Model):
    """Product model."""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    discount_price = db.Column(db.Numeric(10, 2), nullable=True)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    brand = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.Enum('active', 'inactive', 'out_of_stock'), nullable=False, default='active')
    views = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    images = db.relationship('ProductImage', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', backref='product', lazy='dynamic')
    wishlists = db.relationship('Wishlist', backref='product', lazy='dynamic')
    order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')
    reviews = db.relationship('Review', backref='product', lazy='dynamic')

    @property
    def discount_percentage(self):
        if self.discount_price and self.price > 0:
            return round(float((self.price - self.discount_price) / self.price * 100), 0)
        return 0

    @property
    def effective_price(self):
        return float(self.discount_price) if self.discount_price else float(self.price)

    @property
    def average_rating(self):
        reviews = self.reviews.filter_by(status='approved').all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    @property
    def review_count(self):
        return self.reviews.filter_by(status='approved').count()

    def to_dict(self, detailed=False):
        data = {
            'id': self.id,
            'seller_id': self.seller_id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'seller_name': self.seller.name if self.seller else None,
            'name': self.name,
            'brand': self.brand,
            'price': float(self.price),
            'discount_price': float(self.discount_price) if self.discount_price else None,
            'discount_percentage': self.discount_percentage,
            'effective_price': self.effective_price,
            'stock_quantity': self.stock_quantity,
            'image_url': self.image_url,
            'status': self.status,
            'average_rating': self.average_rating,
            'review_count': self.review_count,
            'views': self.views,
            'is_low_stock': self.stock_quantity <= 5,
            'in_stock': self.stock_quantity > 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if detailed:
            data['description'] = self.description
            data['images'] = [img.to_dict() for img in self.images]
        return data

    def __repr__(self):
        return f'<Product {self.name}>'


class ProductImage(db.Model):
    """Additional product images."""
    __tablename__ = 'product_images'

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'image_url': self.image_url,
        }
