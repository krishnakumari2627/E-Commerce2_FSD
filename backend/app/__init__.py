from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()


def create_app(config_name='development'):
    """Application factory pattern."""
    app = Flask(__name__)

    # Load configuration
    from app.config.settings import config
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'])

    # Create upload directory
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                              app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_dir, exist_ok=True)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.product_routes import product_bp
    from app.routes.category_routes import category_bp
    from app.routes.cart_routes import cart_bp
    from app.routes.wishlist_routes import wishlist_bp
    from app.routes.order_routes import order_bp
    from app.routes.review_routes import review_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.seller_routes import seller_bp
    from app.routes.address_routes import address_bp
    from app.routes.payment_routes import payment_bp
    from app.routes.recommendation_routes import recommendation_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(category_bp, url_prefix='/api/categories')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(order_bp, url_prefix='/api/orders')
    app.register_blueprint(review_bp, url_prefix='/api/reviews')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(seller_bp, url_prefix='/api/seller')
    app.register_blueprint(address_bp, url_prefix='/api/addresses')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(recommendation_bp, url_prefix='/api/recommendations')

    # Register error handlers
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)

    # Health check route
    @app.route('/api/health')
    def health_check():
        return {'success': True, 'message': 'SmartCart API is running!', 'version': '1.0.0'}

    # Create database tables
    with app.app_context():
        db.create_all()
        # Seed initial data
        from app.utils.seed_data import seed_database
        seed_database()

    return app
