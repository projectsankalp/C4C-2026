import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import { FiStar, FiShoppingCart, FiMessageCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../styles/categories.css';
import { useLanguage } from '../../context/LanguageContext';

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || '';

  // Filter States
  const [searchFilter, setSearchFilter] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state with URL changes (e.g. when navbar search is triggered)
  useEffect(() => {
    const search = queryParams.get('search') || '';
    const category = queryParams.get('category') || '';
    
    setSearchFilter(search);
    if (category) {
      setSelectedCategories([category]);
    }
    setCurrentPage(1); // Reset to page 1 on new search
  }, [location.search]);

  // Handler for category checkbox toggle
  const handleCategoryToggle = (category) => {
    let updatedCategories = [...selectedCategories];
    if (updatedCategories.includes(category)) {
      updatedCategories = updatedCategories.filter(c => c !== category);
    } else {
      updatedCategories.push(category);
    }
    setSelectedCategories(updatedCategories);
    setCurrentPage(1);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Added ${product.title} to cart!`);
  };

  // Perform Catalog Filtering
  const filteredProducts = products.filter(prod => {
    // 1. Search Query Match
    if (searchFilter) {
      const matchTitle = prod.title.toLowerCase().includes(searchFilter.toLowerCase());
      const matchCat = prod.category.toLowerCase().includes(searchFilter.toLowerCase());
      const matchDesc = prod.description.toLowerCase().includes(searchFilter.toLowerCase());
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }

    // 2. Category Checkboxes Match
    if (selectedCategories.length > 0) {
      if (!selectedCategories.includes(prod.category)) return false;
    }

    // 3. Price Limit
    if (prod.price > maxPrice) return false;

    // 4. Rating Limit
    if (prod.rating < selectedRating) return false;

    // 5. District Selection
    if (selectedDistrict !== 'All') {
      if (prod.district !== selectedDistrict) return false;
    }

    return true;
  });

  // Sort Filtered Results
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'low-to-high') return a.price - b.price;
    if (sortBy === 'high-to-low') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // "recent" default ordering
  });

  // Pagination bounds calculation (6 items per page)
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const resetFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(50000);
    setSelectedRating(0);
    setSelectedDistrict('All');
    setSortBy('recent');
    navigate('/collections');
    toast.success("Filters cleared.");
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* HEADER HERO */}
      <section className="collections-hero">
        <div className="container">
          <span className="hero-badge-tag">{t('categories.badge')}</span>
          <h1 style={{ marginTop: '10px' }}>{t('categories.title')}</h1>
        </div>
      </section>

      {/* FILTER & GRID LAYOUT CONTAINER */}
      <section className="container">
        <div className="collections-layout">
          
          {/* 1. LEFT SIDEBAR FILTERS */}
          <aside className="filters-sidebar">
            
            {/* Title & Clear Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px' }}>{t('categories.filters')}</h3>
              <button 
                onClick={resetFilters}
                style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-terracotta)', borderBottom: '1px solid var(--primary-terracotta)' }}
              >
                {t('categories.clearAll')}
              </button>
            </div>

            {/* Filter: Craft Type */}
            <div>
              <h4 className="filter-group-title">{t('categories.craftType')}</h4>
              <div className="filter-options-list">
                {['Pottery & Ceramics', 'Hand-loom Textiles', 'Metalwork (Dhokra)', 'Wooden Carvings'].map(cat => (
                  <label key={cat} className="filter-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Filter: Price Range */}
            <div>
              <h4 className="filter-group-title">{t('categories.priceRange')}</h4>
              <input 
                type="range" 
                min="500" 
                max="50000" 
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-slider-input"
              />
              <div className="price-slider-info">
                <span>₹500</span>
                <span style={{ color: 'var(--primary-terracotta)', fontWeight: '700' }}>{t('categories.upTo')} {formatPrice(maxPrice)}</span>
              </div>
            </div>

            {/* Filter: Ratings */}
            <div>
              <h4 className="filter-group-title">{t('categories.minRating')}</h4>
              <div className="filter-options-list">
                {[5, 4.5, 4].map(stars => (
                  <label key={stars} className="filter-checkbox-label" onClick={() => setSelectedRating(stars)}>
                    <input 
                      type="radio" 
                      name="rating-filter"
                      checked={selectedRating === stars}
                      onChange={() => setSelectedRating(stars)}
                      style={{ accentColor: 'var(--primary-terracotta)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ display: 'inline-flex', color: 'var(--gold-accent)' }}><FiStar style={{ fill: 'var(--gold-accent)' }} /></span>
                      <span>{stars}{t('categories.andUp')}</span>
                    </div>
                  </label>
                ))}
                <label className="filter-checkbox-label" onClick={() => setSelectedRating(0)}>
                  <input 
                    type="radio" 
                    name="rating-filter"
                    checked={selectedRating === 0}
                    onChange={() => setSelectedRating(0)}
                    style={{ accentColor: 'var(--primary-terracotta)' }}
                  />
                  <span>{t('categories.allRatings')}</span>
                </label>
              </div>
            </div>

            {/* Filter: Districts */}
            <div>
              <h4 className="filter-group-title">{t('categories.districtOrigin')}</h4>
              <select 
                value={selectedDistrict} 
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="district-select-custom"
              >
                <option value="All">{t('categories.allDistricts')}</option>
                <option value="Bhuj">Bhuj (Kutch)</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Kashmir">Kashmir Valley</option>
                <option value="Bastar">Bastar Collective</option>
                <option value="Mysore">Mysore</option>
                <option value="Jaipur">Jaipur</option>
              </select>
            </div>

          </aside>

          {/* 2. RIGHT PRODUCTS LIST */}
          <main className="products-grid-section">
            
            {/* Listing Header */}
            <div className="grid-results-header">
              <div>
                {t('categories.showing')} <strong>{filteredProducts.length}</strong> {t('categories.results')} 
                {searchFilter && <span> {t('categories.for')} "<strong>{searchFilter}</strong>"</span>}
              </div>
              
              {/* Sorting selectors */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '500' }}>{t('categories.sortBy')}</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--primary-terracotta)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <option value="recent">{t('categories.mostRecent')}</option>
                  <option value="low-to-high">{t('categories.priceLowHigh')}</option>
                  <option value="high-to-low">{t('categories.priceHighLow')}</option>
                  <option value="rating">{t('categories.topRated')}</option>
                </select>
              </div>
            </div>

            {/* Grid listings cards */}
            {currentProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'var(--cream-card)',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px dashed var(--cream-border)'
              }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '8px' }}>{t('categories.noMatches')}</p>
                <p style={{ color: 'var(--warm-charcoal-muted)', fontSize: '14px', marginBottom: '24px' }}>{t('categories.noMatchesSub')}</p>
                <button onClick={resetFilters} className="btn-primary">{t('categories.resetFilters')}</button>
              </div>
            ) : (
              <div className="products-listing-grid">
                {currentProducts.map(product => (
                  <Link to={`/product/${product.id}`} key={product.id} className="product-card-container">
                    <div className="product-card-image-wrap">
                      <img src={product.images ? product.images[0] : ""} alt={product.title} />
                      
                      {/* Handmade Tag overlay */}
                      {product.tags && product.tags.length > 0 && (
                        <span 
                          className="product-card-ribbon"
                          style={{
                            background: product.tags.includes('Organic Indigo Dye') || product.tags.includes('Eco-friendly') 
                              ? 'var(--forest-teal)' 
                              : 'var(--primary-terracotta)'
                          }}
                        >
                          {product.tags[0]}
                        </span>
                      )}
                      
                      {/* Quick Add Button */}
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="product-card-add-btn"
                        title="Add to Cart"
                      >
                        <FiShoppingCart size={18} />
                      </button>
                    </div>
                    
                    <div className="product-card-details">
                      <span className="product-card-category">{product.category} • {product.district}</span>
                      <h4 className="product-card-title">{product.title}</h4>
                      
                      <div className="product-card-meta">
                        <span className="product-card-price">{formatPrice(product.price)}</span>
                        <span className="product-card-rating">
                          <FiStar style={{ fill: 'var(--gold-accent)', color: 'var(--gold-accent)' }} />
                          <strong>{product.rating}</strong> ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {sortedProducts.length > itemsPerPage && (
              <div className="pagination-container">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  title="Previous Page"
                >
                  <FiChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  title="Next Page"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}

          </main>

        </div>
      </section>

      {/* 3. FLOATING CHAT BUBBLE ASSISTANT TRIGGER */}
      <div 
        onClick={() => { navigate('/help'); toast.success("Opening KariGhar Assistant Chatbot..."); }}
        className="floating-chat-trigger" 
        title={t('categories.openAssistant')}
      >
        <FiMessageCircle />
      </div>

    </div>
  );
};

export default Categories;
