import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import { sellerService, productService, categoryService } from '../../services';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    sku: '',
    stock_quantity: 15,
    primary_image: '',
    is_active: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await sellerService.getProducts({ search: search || undefined });
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
  }, [search]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      short_description: '',
      category_id: categories[0]?.id || '',
      price: '',
      compare_at_price: '',
      sku: '',
      stock_quantity: 15,
      primary_image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
      is_active: true,
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
      sku: prod.sku || '',
      stock_quantity: prod.stock_quantity || 0,
      primary_image: prod.primary_image || '',
      is_active: prod.is_active !== undefined ? prod.is_active : true,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData);
        toast.success('Listing updated successfully!');
      } else {
        await productService.createProduct(formData);
        toast.success('Listing published to store!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save listing');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product listing?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Listing removed');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove listing');
    }
  };

  return (
    <div className="page-container seller-products-page">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">My Store Inventory</h1>
            <p className="page-subtitle">Add new items for sale, modify pricing and monitor warehouse stock</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <FiPlus /> New Product Listing
          </button>
        </div>

        <div className="admin-toolbar-card">
          <div className="toolbar-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search your listings..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>SKU</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-inline" /> Loading inventory...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      No listings found. Create your first product listing above.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={prod.primary_image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100'}
                            alt={prod.name}
                            className="table-product-thumb"
                          />
                          <div>
                            <span className="table-product-title">{prod.name}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{prod.category_name || 'General'}</span>
                      </td>
                      <td><code>{prod.sku || 'N/A'}</code></td>
                      <td><strong>{formatPrice(prod.price)}</strong></td>
                      <td>
                        <span className={`badge ${prod.stock_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {prod.stock_quantity} in stock
                        </span>
                      </td>
                      <td>★ {Number(prod.rating || 5).toFixed(1)}</td>
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
                            onClick={() => handleDelete(prod.id)}
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

        {/* Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingId ? 'Edit Product Listing' : 'Publish New Product Listing'}</h3>
                  <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Product Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Mechanical Gaming Keyboard RGB"
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
                        <label>SKU / Model Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. KB-RGB-01"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Price ($) *</label>
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
                        <label>Compare Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-input"
                          value={formData.compare_at_price}
                          onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Inventory Quantity *</label>
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
                      <label>Image URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.primary_image}
                        onChange={(e) => setFormData({ ...formData, primary_image: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Short Description</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Key feature summary"
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Full Product Details</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Detailed product information..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Save Changes' : 'Publish Listing'}
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
