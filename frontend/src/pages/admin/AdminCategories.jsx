import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi';
import { categoryService } from '../../services';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image_url: cat.image_url || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
        toast.success('Category updated successfully!');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Category created successfully!');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="page-container admin-categories-page">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">Category Management</h1>
            <p className="page-subtitle">Organize store hierarchy, departments, and catalog classifications</p>
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <FiPlus /> Add New Category
          </button>
        </div>

        <div className="dashboard-section-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-inline" /> Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id || cat.slug}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={cat.image_url || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100'}
                            alt={cat.name}
                            className="table-category-thumb"
                          />
                          <strong>{cat.name}</strong>
                        </div>
                      </td>
                      <td><code>{cat.slug}</code></td>
                      <td>{cat.description || '—'}</td>
                      <td className="text-right">
                        <div className="action-button-group">
                          <button
                            className="btn-icon"
                            title="Edit"
                            onClick={() => handleOpenEdit(cat)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Delete"
                            onClick={() => handleDelete(cat.id)}
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

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingId ? 'Edit Category' : 'Add New Category'}</h3>
                  <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Category Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Smart Wearables"
                        value={formData.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          name: e.target.value,
                          slug: editingId ? formData.slug : e.target.value.toLowerCase().replace(/\s+/g, '-')
                        })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>URL Slug</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. smart-wearables"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Image URL</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        placeholder="Short summary of items in this category"
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
                      {editingId ? 'Save Changes' : 'Create Category'}
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
