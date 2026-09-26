# 🛒 SmartCart – Full Stack E-Commerce Platform

**SmartCart** is a modern, production-grade Full-Stack E-Commerce web application built with **React**, **Flask (Python)**, **SQLAlchemy**, and **MySQL**. It features JWT authentication, multi-role user workflows (Customer, Seller, Admin), real-time cart & wishlist, demo payment gateways, dynamic product catalog, review management, and an analytics dashboard.

---

## 🌟 Key Features

### 🛍️ Storefront & Customer Experience
- **Interactive Homepage:** Featured deals, category explorer, trending picks, and smart product recommendations.
- **Product Catalog:** Filter by category, price range, star rating, stock availability, and multiple sorting options.
- **Product Details:** High-res image gallery, stock counts, discount calculations, specifications table, and verified customer reviews.
- **Cart & Wishlist:** Persistent cart state, live quantity modification, promo code engine (`SAVE10`, `FESTIVE20`), and free-shipping progress indicators.
- **Checkout & Demo Payments:** Address book management (CRUD), multi-payment options (Credit/Debit card simulation, UPI/QR, Cash on Delivery), and order confirmation.
- **Order Tracking & Invoicing:** Visual step-by-step order fulfillment timeline and printable invoices.

### 🏢 Merchant / Seller Portal (`/seller`)
- **Seller Analytics:** Real-time metrics for total store sales, orders received, active listings, and seller ratings.
- **Inventory Management:** Create, edit, and delete product listings with custom pricing, SKU codes, and stock controls.
- **Fulfillment Management:** Process customer orders and transition fulfillment states (Pending, Confirmed, Processing, Shipped, Delivered).

### ⚡ Administrator Management Console (`/admin`)
- **Analytics & Revenue Charts:** Interactive monthly revenue & order volume charts powered by Recharts.
- **Catalog Management:** Full store product inventory oversight with quick edit and deletion controls.
- **User Account Directory:** View and manage registered customers, sellers, and staff; toggle account activation statuses.
- **Category Hierarchy:** Manage store categories, URL slugs, and banner images.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, React Context API, Axios, Recharts, React Hot Toast, React Icons, Vanilla CSS Design System |
| **Backend** | Python Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS |
| **Database** | MySQL / SQLite (Development auto-fallback) |
| **Security** | JWT Authentication with interceptors, password hashing with Werkzeug |

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
> The API server will start on `http://localhost:5000`. Database tables and demo data will be seeded automatically on first start.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> The React development server will start on `http://localhost:5173`.

---

## 👥 Demo Accounts (1-Click Login Available on Login Page)

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@smartcart.com` | `Customer@123` |
| **Seller** | `seller@smartcart.com` | `Seller@123` |
| **Admin** | `admin@smartcart.com` | `Admin@123` |

---

## 📂 Project Structure

```
smart_ecommerce_platform_fsd_project/
├── backend/
│   ├── app/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Business logic handlers
│   │   ├── middleware/      # Auth & role verification
│   │   ├── models/          # SQLAlchemy Database Models (User, Product, Order, Cart)
│   │   ├── routes/          # REST API Blueprints
│   │   ├── services/        # Service layer
│   │   └── utils/           # Error handlers, seed data
│   ├── run.py               # Flask entry point
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Footer, ProductCard, etc.
    │   ├── context/         # AuthContext, CartContext
    │   ├── pages/           # Storefront, Admin, and Seller pages
    │   ├── routes/          # ProtectedRoute, PublicRoute
    │   ├── services/        # Axios API client modules
    │   ├── index.css        # Core design system & theme tokens
    │   ├── App.jsx          # Main routing & provider tree
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```
