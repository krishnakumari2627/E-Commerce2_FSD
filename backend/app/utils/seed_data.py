from app import db
from app.models.user import User
from app.models.product import Category, Product
from app.models.order import Review
import logging

logger = logging.getLogger(__name__)


def seed_database():
    """Seed the database with comprehensive product catalog if empty."""
    try:
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@smartcart.com').first()
        if not admin:
            # Create admin user
            admin = User(
                name='SmartCart Admin',
                email='admin@smartcart.com',
                role='admin',
                phone='9999999999',
                status='active'
            )
            admin.set_password('Admin@123')
            db.session.add(admin)

            # Create demo seller
            seller = User(
                name='TechZone Store',
                email='seller@smartcart.com',
                role='seller',
                phone='9888888888',
                status='active'
            )
            seller.set_password('Seller@123')
            db.session.add(seller)

            # Create demo customer
            customer = User(
                name='John Doe',
                email='customer@smartcart.com',
                role='customer',
                phone='9777777777',
                status='active'
            )
            customer.set_password('Customer@123')
            db.session.add(customer)

            db.session.flush()

        seller = User.query.filter_by(email='seller@smartcart.com').first()
        customer = User.query.filter_by(email='customer@smartcart.com').first()

        # Check existing categories
        categories = Category.query.all()
        if not categories:
            categories_data = [
                {'name': 'Electronics', 'description': 'Smartphones, laptops, audio, wearables & gadgets', 'image': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'},
                {'name': 'Fashion', 'description': 'Clothing, footwear, watches & luxury accessories', 'image': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'},
                {'name': 'Home & Kitchen', 'description': 'Appliances, furniture, cookware & smart home decor', 'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'},
                {'name': 'Sports & Fitness', 'description': 'Workout equipment, yoga gear, supplements & apparel', 'image': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'},
                {'name': 'Books', 'description': 'Bestsellers, technical guides, self-growth & literature', 'image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'},
                {'name': 'Beauty & Health', 'description': 'Premium skincare, wellness, perfumes & grooming', 'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'},
                {'name': 'Toys & Games', 'description': 'Board games, robotics, action figures & gaming gear', 'image': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400'},
                {'name': 'Automotive', 'description': 'Car electronics, detailing kits, dash cams & tools', 'image': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'},
            ]

            categories = []
            for cat_data in categories_data:
                cat = Category(status='active', **cat_data)
                db.session.add(cat)
                categories.append(cat)

            db.session.flush()

        # If we have less than 20 products, seed the full catalog
        if Product.query.count() < 25:
            products_data = [
                # ===== 0: ELECTRONICS =====
                {
                    'name': 'iPhone 15 Pro Max',
                    'brand': 'Apple',
                    'category_idx': 0,
                    'price': 159900,
                    'discount_price': 149900,
                    'stock': 45,
                    'image': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500',
                    'description': 'The most powerful iPhone ever. Titanium design, A17 Pro chip, customizable Action button, and 5x optical zoom.'
                },
                {
                    'name': 'Samsung Galaxy S24 Ultra',
                    'brand': 'Samsung',
                    'category_idx': 0,
                    'price': 134999,
                    'discount_price': 119999,
                    'stock': 30,
                    'image': 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500',
                    'description': 'Unleash Galaxy AI. Titanium frame, 200MP camera with Quad Telephoto system, and built-in S Pen.'
                },
                {
                    'name': 'MacBook Pro 14-inch M3',
                    'brand': 'Apple',
                    'category_idx': 0,
                    'price': 199900,
                    'discount_price': 179900,
                    'stock': 20,
                    'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
                    'description': 'Supercharged by Apple M3 processor. Liquid Retina XDR display with up to 22 hours of battery life.'
                },
                {
                    'name': 'Sony WH-1000XM5 Wireless Headphones',
                    'brand': 'Sony',
                    'category_idx': 0,
                    'price': 34990,
                    'discount_price': 27990,
                    'stock': 100,
                    'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                    'description': 'Industry-leading noise cancelation, 30-hour battery life, ultra-comfortable lightweight design.'
                },
                {
                    'name': 'Apple Watch Series 9 GPS',
                    'brand': 'Apple',
                    'category_idx': 0,
                    'price': 41900,
                    'discount_price': 37900,
                    'stock': 60,
                    'image': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
                    'description': 'S9 SiP chip with Double Tap gesture, Blood Oxygen sensing, ECG, and bright always-on Retina display.'
                },
                {
                    'name': 'Dell XPS 15 OLED Laptop',
                    'brand': 'Dell',
                    'category_idx': 0,
                    'price': 185000,
                    'discount_price': 169999,
                    'stock': 15,
                    'image': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
                    'description': '13th Gen Intel Core i7, 32GB RAM, 1TB SSD, and 3.5K OLED InfinityEdge touch screen.'
                },

                # ===== 1: FASHION =====
                {
                    'name': 'Nike Air Max 270 React',
                    'brand': 'Nike',
                    'category_idx': 1,
                    'price': 12995,
                    'discount_price': 9995,
                    'stock': 85,
                    'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
                    'description': 'Bold lifestyle sneaker boasting the largest Max Air heel unit for maximum all-day bounce and comfort.'
                },
                {
                    'name': "Levi's 511 Slim Fit Denim Jeans",
                    'brand': "Levi's",
                    'category_idx': 1,
                    'price': 4999,
                    'discount_price': 2999,
                    'stock': 120,
                    'image': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
                    'description': 'Classic slim fit through thigh and leg. Premium stretch denim for ultimate flexibility.'
                },
                {
                    'name': 'Fossil Minimalist Chronograph Watch',
                    'brand': 'Fossil',
                    'category_idx': 1,
                    'price': 11995,
                    'discount_price': 7995,
                    'stock': 40,
                    'image': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
                    'description': 'Clean Scandinavian design with genuine leather strap, quartz movement, and 50m water resistance.'
                },
                {
                    'name': 'Ray-Ban Aviator Classic Sunglasses',
                    'brand': 'Ray-Ban',
                    'category_idx': 1,
                    'price': 9590,
                    'discount_price': 8150,
                    'stock': 65,
                    'image': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
                    'description': 'Timeless teardrop pilot shape with 100% UV-protected crystal green G-15 lenses.'
                },
                {
                    'name': 'Adidas Originals Trefoil Hoodie',
                    'brand': 'Adidas',
                    'category_idx': 1,
                    'price': 5999,
                    'discount_price': 3999,
                    'stock': 90,
                    'image': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
                    'description': 'Heavyweight French terry cotton with iconic centered Trefoil embroidery and kangaroo pocket.'
                },

                # ===== 2: HOME & KITCHEN =====
                {
                    'name': 'Instant Pot Duo 7-in-1 Multi-Cooker',
                    'brand': 'Instant Pot',
                    'category_idx': 2,
                    'price': 9999,
                    'discount_price': 6999,
                    'stock': 70,
                    'image': 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
                    'description': 'Electric pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker and food warmer.'
                },
                {
                    'name': 'Philips Air Fryer XL 4.1L',
                    'brand': 'Philips',
                    'category_idx': 2,
                    'price': 12995,
                    'discount_price': 8999,
                    'stock': 55,
                    'image': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
                    'description': 'Rapid Air technology fries, bakes, grills and roasts with up to 90% less fat.'
                },
                {
                    'name': 'Nespresso Vertuo Coffee & Espresso Maker',
                    'brand': 'Nespresso',
                    'category_idx': 2,
                    'price': 19999,
                    'discount_price': 15999,
                    'stock': 35,
                    'image': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
                    'description': 'Centrifusion extraction technology automatically recognizes each blend for barista-quality coffee.'
                },
                {
                    'name': 'Dyson V12 Detect Slim Vacuum',
                    'brand': 'Dyson',
                    'category_idx': 2,
                    'price': 54900,
                    'discount_price': 46900,
                    'stock': 25,
                    'image': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
                    'description': 'Laser reveals microscopic dust with piezo sensor particle count display and 60 minutes run time.'
                },
                {
                    'name': 'Ergonomic Velvet Accent Armchair',
                    'brand': 'HomeCraft',
                    'category_idx': 2,
                    'price': 18999,
                    'discount_price': 13499,
                    'stock': 18,
                    'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
                    'description': 'Mid-century modern aesthetic with golden metal legs and high-density memory foam padding.'
                },

                # ===== 3: SPORTS & FITNESS =====
                {
                    'name': 'Optimum Nutrition Gold Standard 100% Whey',
                    'brand': 'Optimum Nutrition',
                    'category_idx': 3,
                    'price': 4999,
                    'discount_price': 3799,
                    'stock': 150,
                    'image': 'https://images.unsplash.com/photo-1579722822168-e9e5f2b5e6b5?w=500',
                    'description': '24 grams of protein per serving with whey protein isolates and 5.5g naturally occurring BCAAs.'
                },
                {
                    'name': 'Manduka PRO Yoga & Pilates Mat',
                    'brand': 'Manduka',
                    'category_idx': 3,
                    'price': 8999,
                    'discount_price': 6499,
                    'stock': 60,
                    'image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
                    'description': 'High-density 6mm cushion provides unmatched support, joint protection, and lifetime durability.'
                },
                {
                    'name': 'Bowflex SelectTech Adjustable Dumbbells (Pair)',
                    'brand': 'Bowflex',
                    'category_idx': 3,
                    'price': 38999,
                    'discount_price': 32999,
                    'stock': 22,
                    'image': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500',
                    'description': 'Adjusts from 5 to 52.5 lbs per dumbbell with turn of a dial, replacing 15 sets of weights.'
                },
                {
                    'name': 'Garmin Forerunner 265 Running Smartwatch',
                    'brand': 'Garmin',
                    'category_idx': 3,
                    'price': 46990,
                    'discount_price': 41990,
                    'stock': 30,
                    'image': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500',
                    'description': 'Colorful AMOLED touch display, training readiness metrics, and multi-band GPS tracking.'
                },
                {
                    'name': 'Hydro Flask 32oz Insulated Water Bottle',
                    'brand': 'Hydro Flask',
                    'category_idx': 3,
                    'price': 3499,
                    'discount_price': 2799,
                    'stock': 110,
                    'image': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
                    'description': 'TempShield double-wall vacuum insulation keeps cold beverages ice-cold for up to 24 hours.'
                },

                # ===== 4: BOOKS =====
                {
                    'name': 'Atomic Habits by James Clear',
                    'brand': 'Penguin Random House',
                    'category_idx': 4,
                    'price': 799,
                    'discount_price': 499,
                    'stock': 350,
                    'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
                    'description': 'The definitive guide on breaking bad behaviors and adopting good 1% daily micro-habits.'
                },
                {
                    'name': 'The Psychology of Money by Morgan Housel',
                    'brand': 'Harriman House',
                    'category_idx': 4,
                    'price': 599,
                    'discount_price': 399,
                    'stock': 280,
                    'image': 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500',
                    'description': 'Timeless lessons on wealth, greed, and happiness exploring how people think about money.'
                },
                {
                    'name': 'Designing Data-Intensive Applications',
                    'brand': "O'Reilly Media",
                    'category_idx': 4,
                    'price': 2499,
                    'discount_price': 1899,
                    'stock': 90,
                    'image': 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500',
                    'description': 'The big ideas behind reliable, scalable, and maintainable distributed software systems by Martin Kleppmann.'
                },
                {
                    'name': 'Clean Code: A Handbook of Agile Software Craftsmanship',
                    'brand': 'Prentice Hall',
                    'category_idx': 4,
                    'price': 1999,
                    'discount_price': 1499,
                    'stock': 120,
                    'image': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
                    'description': 'Legendary software engineer Robert C. Martin provides essential best practices for pristine code.'
                },
                {
                    'name': 'Deep Work by Cal Newport',
                    'brand': 'Grand Central Publishing',
                    'category_idx': 4,
                    'price': 699,
                    'discount_price': 449,
                    'stock': 160,
                    'image': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
                    'description': 'Rules for focused success in a distracted world to master hard tasks in less time.'
                },

                # ===== 5: BEAUTY & HEALTH =====
                {
                    'name': 'The Ordinary Niacinamide 10% + Zinc 1%',
                    'brand': 'The Ordinary',
                    'category_idx': 5,
                    'price': 999,
                    'discount_price': 799,
                    'stock': 180,
                    'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500',
                    'description': 'High-strength vitamin and mineral blemish formula that reduces skin blemishes and signs of congestion.'
                },
                {
                    'name': 'CeraVe Hydrating Facial Cleanser 473ml',
                    'brand': 'CeraVe',
                    'category_idx': 5,
                    'price': 1499,
                    'discount_price': 1199,
                    'stock': 140,
                    'image': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
                    'description': 'Non-foaming lotion cleanser with 3 essential ceramides and hyaluronic acid to restore skin barrier.'
                },
                {
                    'name': 'Dior Sauvage Eau De Parfum 100ml',
                    'brand': 'Dior',
                    'category_idx': 5,
                    'price': 14500,
                    'discount_price': 12900,
                    'stock': 40,
                    'image': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500',
                    'description': 'Sensual and mysterious fragrance combining Calabrian bergamot with smoky accents of vanilla absolute.'
                },
                {
                    'name': 'Laneige Lip Sleeping Mask Berry',
                    'brand': 'Laneige',
                    'category_idx': 5,
                    'price': 1650,
                    'discount_price': 1320,
                    'stock': 95,
                    'image': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500',
                    'description': 'Berry Fruit Complex with Vitamin C and coconut oil delivers intense hydration while you sleep.'
                },
                {
                    'name': 'La Roche-Posay Anthelios SPF 50+ Sunscreen',
                    'brand': 'La Roche-Posay',
                    'category_idx': 5,
                    'price': 2100,
                    'discount_price': 1750,
                    'stock': 110,
                    'image': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500',
                    'description': 'Ultra-light fluid offering very high broad-spectrum protection against UVA/UVB rays with matte finish.'
                },
                {
                    'name': 'Oral-B iO Series 9 Electric Toothbrush',
                    'brand': 'Oral-B',
                    'category_idx': 5,
                    'price': 18999,
                    'discount_price': 14999,
                    'stock': 35,
                    'image': 'https://images.unsplash.com/photo-1559591937-e1032d6db7b0?w=500',
                    'description': 'Revolutionary magnetic iO technology with interactive color display and 3D teeth tracking.'
                },

                # ===== 6: TOYS & GAMES =====
                {
                    'name': 'LEGO Technic Porsche 911 GT3 RS',
                    'brand': 'LEGO',
                    'category_idx': 6,
                    'price': 29999,
                    'discount_price': 24999,
                    'stock': 25,
                    'image': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500',
                    'description': '2,704 pieces authentic supercar model with working dual-clutch gearbox and opening doors.'
                },
                {
                    'name': 'Secretlab TITAN Evo 2024 Gaming Chair',
                    'brand': 'Secretlab',
                    'category_idx': 6,
                    'price': 42999,
                    'discount_price': 36999,
                    'stock': 30,
                    'image': 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=500',
                    'description': 'NEO Hybrid Leatherette, 4-way L-ADAPT Lumbar system, and magnetic memory foam head pillow.'
                },
                {
                    'name': 'Logitech G502 X PLUS Wireless RGB Mouse',
                    'brand': 'Logitech',
                    'category_idx': 6,
                    'price': 14995,
                    'discount_price': 11995,
                    'stock': 75,
                    'image': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
                    'description': 'LIGHTFORCE hybrid optical-mechanical switches, HERO 25K gaming sensor, and LIGHTSYNC RGB.'
                },
                {
                    'name': 'PlayStation 5 DualSense Wireless Controller',
                    'brand': 'Sony',
                    'category_idx': 6,
                    'price': 6390,
                    'discount_price': 5490,
                    'stock': 90,
                    'image': 'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=500',
                    'description': 'Immersive haptic feedback, dynamic adaptive triggers, and built-in microphone array.'
                },
                {
                    'name': 'Catan Board Game (5th Edition)',
                    'brand': 'Catan Studio',
                    'category_idx': 6,
                    'price': 3999,
                    'discount_price': 2999,
                    'stock': 85,
                    'image': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500',
                    'description': 'The award-winning game of discovery, trading, and settlement building for 3-4 players.'
                },

                # ===== 7: AUTOMOTIVE =====
                {
                    'name': 'Vantrue N4 3-Channel 4K Dash Cam',
                    'brand': 'Vantrue',
                    'category_idx': 7,
                    'price': 24999,
                    'discount_price': 18999,
                    'stock': 40,
                    'image': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=500',
                    'description': 'Triple camera recording (Front 4K, Inside 1080P, Rear 1080P) with IR Night Vision and 24/7 parking mode.'
                },
                {
                    'name': 'Meguiar’s Complete Car Care Kit',
                    'brand': "Meguiar's",
                    'category_idx': 7,
                    'price': 7999,
                    'discount_price': 5999,
                    'stock': 65,
                    'image': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500',
                    'description': '12-piece detailing set including Gold Class Car Wash, Liquid Wax, clay bar, and microfiber towels.'
                },
                {
                    'name': 'NOCO Boost Plus GB40 1000A Jump Starter',
                    'brand': 'NOCO',
                    'category_idx': 7,
                    'price': 11999,
                    'discount_price': 8999,
                    'stock': 50,
                    'image': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500',
                    'description': 'UltraSafe 12-volt lithium jump starter power bank with spark-proof technology for up to 20 jump starts.'
                },
                {
                    'name': 'Baseus Car Tire Inflator Air Compressor',
                    'brand': 'Baseus',
                    'category_idx': 7,
                    'price': 4999,
                    'discount_price': 3499,
                    'stock': 85,
                    'image': 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500',
                    'description': 'Cordless smart digital tire pump with auto shut-off, LED flashlight, and real-time pressure monitoring.'
                },
                {
                    'name': 'Anker Roav Bluetooth FM Transmitter & Charger',
                    'brand': 'Anker',
                    'category_idx': 7,
                    'price': 2499,
                    'discount_price': 1799,
                    'stock': 130,
                    'image': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500',
                    'description': 'High-speed dual USB charging, noise-canceling hands-free calling, and stable Bluetooth 5.0 streaming.'
                },
            ]

            for p_data in products_data:
                idx = p_data.pop('category_idx')
                stock = p_data.pop('stock')
                image_url = p_data.pop('image', None)
                
                # Check if product exists already
                existing = Product.query.filter_by(name=p_data['name']).first()
                if not existing:
                    prod = Product(
                        seller_id=seller.id if seller else 1,
                        category_id=categories[idx].id,
                        stock_quantity=stock,
                        image_url=image_url,
                        status='active',
                        **p_data
                    )
                    db.session.add(prod)
                    db.session.flush()

                    # Add a sample review for this product
                    review = Review(
                        user_id=customer.id if customer else 1,
                        product_id=prod.id,
                        rating=5,
                        review_text="Excellent build quality! Highly recommended.",
                        status='approved'
                    )
                    db.session.add(review)

            db.session.commit()
            print("Expanded catalog with 40+ products seeded successfully!")

    except Exception as e:
        db.session.rollback()
        print(f"Database seeding note: {e}")
