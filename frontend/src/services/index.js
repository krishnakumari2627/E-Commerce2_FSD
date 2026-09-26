import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProductReviews: (id) => api.get(`/products/${id}/reviews`),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/items', data),
  updateCartItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post('/wishlist', { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getAllOrders: (params) => api.get('/orders/all', { params }),
};

export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getAllReviews: (params) => api.get('/reviews/all', { params }),
  moderateReview: (id, data) => api.put(`/reviews/${id}/moderate`, data),
};

export const addressService = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

export const paymentService = {
  demoPayment: (data) => api.post('/payments/demo', data),
  getPayment: (orderId) => api.get(`/payments/${orderId}`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getAllProducts: (params) => api.get('/admin/products', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

export const sellerService = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProducts: (params) => api.get('/seller/products', { params }),
  getOrders: (params) => api.get('/seller/orders', { params }),
  getReviews: () => api.get('/seller/reviews'),
};

export const recommendationService = {
  getRecommendations: () => api.get('/recommendations'),
  getTrending: () => api.get('/recommendations/trending'),
  getFeatured: () => api.get('/recommendations/featured'),
};
