import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from app import create_app

app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    print("==================================================")
    print("SmartCart Backend API Starting...")
    print("API Base URL: http://localhost:5000")
    print("Health Check: http://localhost:5000/api/health")
    print("==================================================")
    print("Demo Accounts:")
    print("  Admin    -> admin@smartcart.com / Admin@123")
    print("  Seller   -> seller@smartcart.com / Seller@123")
    print("  Customer -> customer@smartcart.com / Customer@123")
    print("==================================================")
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    app.run(host='0.0.0.0', port=port, debug=debug)
