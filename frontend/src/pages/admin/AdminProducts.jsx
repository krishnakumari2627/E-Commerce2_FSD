import { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiStar, 
  FiCheckCircle, FiXCircle, FiSliders, FiEye 
} from 'react-icons/fi';
import { adminService, productService, categoryService } from '../../services';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    sku: '',
    stock_quantity: 10,
    is_active: true,
    is_featured: false,
    primary_image: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        limit: 50,
        search: search || undefined,
        category: selectedCategory || undefined,
      });
      setProducts(res.data.data?.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getCategories().then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      short_description: '',
      category_id: categories[0]?.id || '',
      price: '',
      compare_at_price: '',
      cost_price: '',
      sku: '',
      stock_quantity: 20,
      is_active: true,
      is_featured: false,
      primary_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      short_description: prod.short_description || '',
      category_id: prod.category_id || '',
      price: prod.price || '',
      compare_at_price: prod.compare_at_price || '',
      cost_price: prod.cost_price || '',
      sku: prod.sku || '',
      stock_quantity: prod.stock_quantity || 0,
      is_active: prod.is_active !== undefined ? prod.is_active : true,
      is_featured: prod.is_featured || false,
      primary_image: prod.primary_image || '',
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(formData);
        toast.success('New product created successfully!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="page-container admin-products-page">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">Product Inventory</h1>
            <p className="page-subtitle">Manage store catalog, prices, stocks, and product visibility</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <FiPlus /> Add New Product
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="admin-toolbar-card">
          <div className="toolbar-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, SKU..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filter">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="dashboard-section-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Featured</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-inline" /> Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      No products found. Click "Add New Product" to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={prod.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={prod.name}
                            className="table-product-thumb"
                          />
                          <div>
                            <span className="table-product-title">{prod.name}</span>
                            <span className="table-subinfo">{prod.brand || 'SmartCart'}</span>
                          </div>
                        </div>
                      </td>
                      <td><code>{prod.sku || 'N/A'}</code></td>
                      <td>
                        <span className="badge badge-secondary">{prod.category_name || 'General'}</span>
                      </td>
                      <td>
                        <strong>{formatPrice(prod.price)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${prod.stock_quantity > 5 ? 'badge-success' : prod.stock_quantity > 0 ? 'badge-warning' : 'badge-danger'}`}>
                          {prod.stock_quantity} in stock
                        </span>
                      </td>
                      <td>
                        <span className="rating-badge">★ {Number(prod.rating || 5).toFixed(1)}</span>
                      </td>
                      <td>
                        {prod.is_featured ? (
                          <span className="badge badge-primary">Featured</span>
                        ) : (
                          <span className="text-muted">Standard</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="action-button-group">
                          <button
                            className="btn-icon"
                            title="Edit"
                            onClick={() => handleOpenEdit(prod)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Delete"
                            onClick={() => handleDeleteProduct(prod.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Create/Edit Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingId ? 'Edit Product' : 'Create New Product'}</h3>
                  <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSaveProduct}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Product Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Wireless Noise Canceling Headphones"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Category *</label>
                        <select
                          className="form-select"
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>SKU / Model Code</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. WH-1000XM5"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Selling Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Compare at Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={formData.compare_at_price}
                          onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Primary Image URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formData.primary_image}
                        onChange={(e) => setFormData({ ...formData, primary_image: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Short Summary</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Brief 1-sentence product highlight"
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Full Description</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Detailed technical specifications and features..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="form-row-2 mt-3">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        />
                        <span>Active for Sale</span>
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        />
                        <span>Featured on Homepage</span>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Save Changes' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
