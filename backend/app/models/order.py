from datetime import datetime
from app import db


class Address(db.Model):
    """User address model."""
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address_line = db.Column(db.String(500), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    country = db.Column(db.String(100), nullable=False, default='India')
    address_type = db.Column(db.Enum('home', 'work', 'other'), nullable=False, default='home')
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='address', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'address_line': self.address_line,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'country': self.country,
            'address_type': self.address_type,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Order(db.Model):
    """Order model."""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    shipping_amount = db.Column(db.Numeric(10, 2), default=0)
    final_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(
        db.Enum('pending', 'paid', 'failed', 'refunded'),
        nullable=False, default='pending'
    )
    order_status = db.Column(
        db.Enum('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'),
        nullable=False, default='pending'
    )
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False)

    def to_dict(self, detailed=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'address_id': self.address_id,
            'address': self.address.to_dict() if self.address else None,
            'total_amount': float(self.total_amount),
            'discount_amount': float(self.discount_amount),
            'shipping_amount': float(self.shipping_amount),
            'final_amount': float(self.final_amount),
            'payment_status': self.payment_status,
            'order_status': self.order_status,
            'can_cancel': self.order_status in ('pending', 'confirmed'),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if detailed:
            data['items'] = [item.to_dict() for item in self.items]
            data['payment'] = self.payment.to_dict() if self.payment else None
        else:
            data['item_count'] = self.items.count()
            # Include first item image for list view
            first_item = self.items.first()
            data['preview_image'] = first_item.product.image_url if first_item and first_item.product else None
        return data


class OrderItem(db.Model):
    """Individual order line item."""
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'seller_id': self.seller_id,
            'quantity': self.quantity,
            'price': float(self.price),
            'subtotal': float(self.subtotal),
            'product': self.product.to_dict() if self.product else None,
        }


class Payment(db.Model):
    """Payment model."""
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True, index=True)
    payment_method = db.Column(db.Enum('cod', 'online', 'demo'), nullable=False)
    transaction_id = db.Column(db.String(255), nullable=True, unique=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(
        db.Enum('pending', 'completed', 'failed', 'refunded'),
        nullable=False, default='pending'
    )
    payment_date = db.Column(db.DateTime, nullable=True)
    gateway_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'amount': float(self.amount),
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Review(db.Model):
    """Product review model."""
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    review_text = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('pending', 'approved', 'rejected'), nullable=False, default='approved')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='unique_user_product_review'),
        db.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'Anonymous',
            'product_id': self.product_id,
            'rating': self.rating,
            'review_text': self.review_text,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
