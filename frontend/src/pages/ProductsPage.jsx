import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSearch, FiSliders, FiGrid, FiList } from 'react-icons/fi';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '');

  // Fetch categories
  useEffect(() => {
    categoryService.getCategories().then(res => {
      setCategories(res.data.data || []);
    }).catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        sort: sortBy,
        in_stock: inStockOnly ? 'true' : undefined,
        min_rating: minRating || undefined,
      };

      // Clean undefined keys
      Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);

      const res = await productService.getProducts(params);
      setProducts(res.data.data?.products || []);
      setPagination(res.data.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sortBy, inStockOnly, minRating]);

  // Sync params to URL and fetch
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (sortBy !== 'featured') params.sort = sortBy;
    if (inStockOnly) params.in_stock = 'true';
    if (minRating) params.min_rating = minRating;

    setSearchParams(params, { replace: true });
    fetchProducts(1);
  }, [search, category, minPrice, maxPrice, sortBy, inStockOnly, minRating, fetchProducts, setSearchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    setInStockOnly(false);
    setMinRating('');
    setSearchParams({});
  };

  return (
    <div className="page-container products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div>
            <h1 className="page-title">Explore Products</h1>
            <p className="page-subtitle">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="products-controls">
            <button
              className="btn btn-outline mobile-filter-toggle"
              onClick={() => setShowMobileFilter(true)}
            >
              <FiFilter /> Filters
            </button>

            <div className="sort-select-wrapper">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="products-layout">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar ${showMobileFilter ? 'mobile-open' : ''}`}>
            <div className="filters-header">
              <h3 className="filters-title">
                <FiSliders /> Filter Products
              </h3>
              {showMobileFilter && (
                <button
                  className="close-btn"
                  onClick={() => setShowMobileFilter(false)}
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Search Filter */}
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <form onSubmit={handleSearchSubmit} className="filter-search-form">
                <div className="search-input-wrapper">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    className="form-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">Categories</label>
              <div className="filter-options">
                <button
                  type="button"
                  className={`filter-chip ${!category ? 'active' : ''}`}
                  onClick={() => setCategory('')}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const isActive = category === String(cat.id) || category === cat.name;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      className={`filter-chip ${isActive ? 'active' : ''}`}
                      onClick={() => setCategory(isActive ? '' : String(cat.id))}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <label className="filter-label">Price Range (₹)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <span className="price-separator">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="filter-label">Minimum Rating</label>
              <div className="rating-filter-options">
                {[4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="rating-radio-label">
                    <input
                      type="radio"
                      name="rating"
                      value={stars}
                      checked={Number(minRating) === stars}
                      onChange={() => setMinRating(Number(minRating) === stars ? '' : stars.toString())}
                      onClick={() => {
                        if (Number(minRating) === stars) setMinRating('');
                      }}
                    />
                    <span className="stars-text">★ {stars} Stars & up</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Checkbox */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </aside>

          {/* Product Grid Area */}
          <main className="products-content">
            {loading ? (
              <div className="products-grid skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="product-skeleton-card">
                    <div className="skeleton-img" />
                    <div className="skeleton-line title" />
                    <div className="skeleton-line price" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
                <button className="btn btn-primary" onClick={handleResetFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchProducts(pagination.page - 1)}
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      className="pagination-btn"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchProducts(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
