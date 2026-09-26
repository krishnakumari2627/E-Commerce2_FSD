from datetime import datetime
from app import db


class Cart(db.Model):
    """Shopping cart model."""
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade='all, delete-orphan')

    def get_totals(self):
        """Calculate cart totals."""
        subtotal = 0
        discount = 0
        for item in self.items:
            product = item.product
            if product and product.stock_quantity > 0:
                subtotal += float(product.price) * item.quantity
                if product.discount_price:
                    discount += (float(product.price) - float(product.discount_price)) * item.quantity
        
        discounted_subtotal = subtotal - discount
        shipping = 0 if discounted_subtotal >= 499 else 49
        final_amount = discounted_subtotal + shipping
        
        return {
            'subtotal': round(subtotal, 2),
            'discount': round(discount, 2),
            'discounted_subtotal': round(discounted_subtotal, 2),
            'shipping': shipping,
            'final_amount': round(final_amount, 2),
            'item_count': self.items.count()
        }

    def to_dict(self):
        items_list = [item.to_dict() for item in self.items]
        totals = self.get_totals()
        return {
            'id': self.id,
            'user_id': self.user_id,
            'items': items_list,
            **totals,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class CartItem(db.Model):
    """Individual cart item."""
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    __table_args__ = (
        db.UniqueConstraint('cart_id', 'product_id', name='unique_cart_product'),
    )

    def to_dict(self):
        product = self.product
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'product': product.to_dict() if product else None,
            'subtotal': round(product.effective_price * self.quantity, 2) if product else 0,
        }


class Wishlist(db.Model):
    """User wishlist model."""
    __tablename__ = 'wishlists'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='unique_wishlist_product'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
