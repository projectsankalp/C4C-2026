import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { formatPrice } from '../../utils/helpers';
import { FiArrowRight, FiShoppingCart, FiStar, FiX, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../styles/home.css';
import { useLanguage } from '../../context/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, getArtisanById } = useProducts();
  const { t } = useLanguage();

  const [storyModalOpen, setStoryModalOpen] = useState(false);

  // Get the 4 signature products for "Curation of the Month"
  const curationProducts = products.filter(p => 
    ["earthbound-vase", "silk-lotus-throw", "indigo-dream-cup", "sandalwood-keepsake"].includes(p.id)
  );

  const handleAddToCartClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Added ${product.title} to cart!`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/collections?category=${encodeURIComponent(categoryName)}`);
    toast.success(`Filtered by ${categoryName}`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* 1. HERO BANNER */}
      <section className="hero-section">
        <div className="container hero-grid">
          
          <div className="hero-content">
            <span className="hero-badge-tag">{t('home.badgeText')}</span>
            <h1 className="hero-title">{t('home.heroTitle')}</h1>
            <div className="hero-ctas">
              <button onClick={() => navigate('/collections')} className="btn-primary">
                {t('home.exploreBtn')} <FiArrowRight />
              </button>
              <button onClick={() => navigate('/seller')} className="btn-secondary">
                {t('home.becomeSellerBtn')}
              </button>
            </div>
          </div>

          <div className="hero-visual-wrapper">
            <img 
              src="/images/parvati-devi-weaver.png" 
              alt="Artisans Spinning Weaves" 
              className="hero-main-img"
            />
            
            {/* Interactive floating stat badges */}
            <div className="floating-stat-card stat-card-1">
              <span className="stat-icon-dot"></span>
              <div>
                <div className="stat-title">150+</div>
                <div className="stat-sub">{t('home.womenStat')}</div>
              </div>
            </div>

            <div className="floating-stat-card stat-card-2">
              <span className="stat-icon-dot" style={{ backgroundColor: 'var(--gold-accent)' }}></span>
              <div>
                <div className="stat-title">30+</div>
                <div className="stat-sub">{t('home.districtsStat')}</div>
              </div>
            </div>

            <div className="floating-stat-card stat-card-3">
              <span className="stat-icon-dot" style={{ backgroundColor: 'var(--forest-teal)' }}></span>
              <div>
                <div className="stat-title">500+</div>
                <div className="stat-sub">{t('home.productsStat')}</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THE ARTISAN'S PALETTE (CATEGORIES) */}
      <section className="categories-section">
        <div className="container">
          <div className="categories-header text-center">
            <span className="hero-badge-tag" style={{ fontSize: '10px' }}>{t('home.paletteSub')}</span>
            <h2 className="serif-title" style={{ marginTop: '10px' }}>{t('home.paletteTitle')}</h2>
          </div>

          <div className="categories-grid">
            
            {/* Handloom (Wider Card, matching design) */}
            <div className="category-tile" onClick={() => handleCategoryClick('Hand-loom Textiles')}>
              <img src="/images/indigo-silk-stole.png" alt="Handloom silk" />
              <div className="category-tile-overlay">
                <h3 className="category-tile-title">{t('home.handloomTitle')}</h3>
                <p className="category-tile-sub">{t('home.handloomSub')}</p>
              </div>
            </div>

            {/* Pottery */}
            <div className="category-tile" onClick={() => handleCategoryClick('Pottery & Ceramics')}>
              <img src="/images/earthen-sanctuary-vase.png" alt="Pottery clay" />
              <div className="category-tile-overlay">
                <h3 className="category-tile-title">{t('home.potteryTitle')}</h3>
                <p className="category-tile-sub">{t('home.potterySub')}</p>
              </div>
            </div>

            {/* Jewelry */}
            <div className="category-tile" onClick={() => handleCategoryClick('Metalwork (Dhokra)')}>
              <img src="/images/dhokra-metal-nandi.png" alt="Jewelry castings" />
              <div className="category-tile-overlay">
                <h3 className="category-tile-title">{t('home.jewelryTitle')}</h3>
                <p className="category-tile-sub">{t('home.jewelrySub')}</p>
              </div>
            </div>

            {/* Paintings */}
            <div className="category-tile" onClick={() => handleCategoryClick('Wooden Carvings')}>
              <img src="/images/carved-walnut-bowl.png" alt="Paintings & Carvings" />
              <div className="category-tile-overlay">
                <h3 className="category-tile-title">{t('home.paintingsTitle')}</h3>
                <p className="category-tile-sub">{t('home.paintingsSub')}</p>
              </div>
            </div>

            {/* Embroidery */}
            <div className="category-tile" onClick={() => handleCategoryClick('Hand-loom Textiles')}>
              <img src="/images/pashmina-heritage-wrap.png" alt="Embroidery detail" />
              <div className="category-tile-overlay">
                <h3 className="category-tile-title">{t('home.embroideryTitle')}</h3>
                <p className="category-tile-sub">{t('home.embroiderySub')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CURATION OF THE MONTH */}
      <section className="curation-section">
        <div className="container">
          <div className="curation-header">
            <div>
              <span className="hero-badge-tag" style={{ fontSize: '10px' }}>{t('home.curationSub')}</span>
              <h2 className="serif-title" style={{ marginTop: '10px' }}>{t('home.curationTitle')}</h2>
            </div>
            <Link to="/collections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--primary-terracotta)' }}>
              {t('home.viewAll')} <FiArrowRight />
            </Link>
          </div>

          <div className="curation-grid">
            {curationProducts.map((product, idx) => {
              const ribbonColors = ['ribbon-gold', 'ribbon-teal', 'ribbon-indigo', 'ribbon-wine'];
              const artisan = getArtisanById ? getArtisanById(product.artisanId) : null;
              return (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-container">
                <div className="product-card-image-wrap">
                  <img src={product.images ? product.images[0] : ""} alt={product.title} />
                  <span className={`product-card-ribbon ${ribbonColors[idx % ribbonColors.length]}`}>{t('home.signature')}</span>
                  
                  {/* Quick add circular button */}
                  <button 
                    onClick={(e) => handleAddToCartClick(e, product)}
                    className="product-card-add-btn"
                    title="Add to Cart"
                  >
                    <FiShoppingCart size={16} />
                  </button>
                </div>
                
                <div className="product-card-details">
                  <div className="product-card-title-row">
                    <h4>{product.title}</h4>
                    <span className="product-card-price">{formatPrice(product.price)}</span>
                  </div>
                  <div className="product-card-artisan-line">
                    {t('home.artisanLabel')} {artisan ? artisan.name : 'KariGhar Collective'}<span>•</span>{product.district || 'India'}
                  </div>
                  <div className="product-card-rating-line">
                    <span className="stars-container">
                      <FiStar style={{ fill: 'var(--gold-accent)', color: 'var(--gold-accent)' }} />
                    </span>
                    <strong>{product.rating}</strong> ({product.reviewCount})
                  </div>
                </div>
              </Link>
            );
            })}
          </div>

        </div>
      </section>

      {/* 4. MEET PARVATI DEVI (ARTISAN SPOTLIGHT) */}
      <section className="spotlight-section">
        <div className="container spotlight-container">
          
          <div className="spotlight-img-frame">
            <img 
              src="/images/parvati-devi-weaver.png" 
              alt="Artisan Parvati Devi" 
              className="spotlight-img"
            />
          </div>

          <div className="spotlight-content">
            <span className="spotlight-badge">{t('home.spotlightBadge')}</span>
            <h2 className="spotlight-title">{t('home.meetParvati')}</h2>
            
            <p className="spotlight-desc">
              {t('home.parvatiDesc')}
            </p>

            <blockquote className="spotlight-quote">
              {t('home.parvatiQuote')}
            </blockquote>

            <div className="spotlight-meta">
              <div className="meta-pill">
                <span className="meta-pill-label">{t('home.districtLabel')}</span>
                <span className="meta-pill-val">{t('home.districtVal')}</span>
              </div>
              <div className="meta-pill">
                <span className="meta-pill-label">{t('home.specLabel')}</span>
                <span className="meta-pill-val">{t('home.specVal')}</span>
              </div>
            </div>

            <button onClick={() => setStoryModalOpen(true)} className="btn-primary" style={{ marginTop: '16px' }}>
              {t('home.readStoryBtn')}
            </button>
          </div>

        </div>
      </section>

      {/* DYNAMIC ARTISAN STORY MODAL */}
      {storyModalOpen && (
        <div className="story-modal-overlay" onClick={() => setStoryModalOpen(false)}>
          <div className="story-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="story-modal-close" onClick={() => setStoryModalOpen(false)} title="Close Modal">
              <FiX />
            </button>
            
            <div className="story-modal-body">
              <h2 className="serif-title" style={{ fontSize: '32px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiInfo style={{ color: 'var(--gold-accent)' }} />
                {t('home.modalTitle')}
              </h2>
              
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '20px' }}>
                <img 
                  src="/images/parvati-devi-weaver.png" 
                  alt="Parvati Devi Spinning" 
                  style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--cream-border)' }}
                />
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px', color: 'var(--warm-charcoal)' }}>
                  <p>
                    <strong>{t('home.modalSub')}</strong>
                  </p>
                  <p>
                    {t('home.modalPara1')}
                  </p>
                  <p>
                    {t('home.modalPara2')}
                  </p>
                  <p>
                    {t('home.modalPara3')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
