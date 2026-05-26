import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CustomMap from './components/CustomMap';
import WhatsAppMock from './components/WhatsAppMock';
import ArtisanEvents from './components/ArtisanEvents';
import AIPipeline from './components/AIPipeline';
import Marketplace from './components/Marketplace';
import ProductDetail from './components/ProductDetail';
import Profile from './components/Profile';
import ImpactDashboard from './components/ImpactDashboard';
import AIAssistant from './components/AIAssistant';
import BackendStatus from './components/BackendStatus';
import { products } from './data/mockData';
import { t, translateField } from './utils/translator';
import { Sparkles, ArrowRight, ArrowLeft, UploadCloud, Fingerprint, FileText, CheckCircle2, Quote, Heart, SlidersHorizontal } from 'lucide-react';

// Premium interactive counter component
const AnimatedCounter = ({ value, duration = 1800, prefix = "", suffix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const targetValue = value * Math.pow(10, decimals);
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = progress * targetValue;
      setCount(current / Math.pow(10, decimals));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, decimals, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString(undefined, { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}
      {suffix}
    </span>
  );
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState('landing'); 
  const [activeProduct, setActiveProduct] = useState(products[0]);
  // Dynamic Catalog State - starts with all products
  const [productList, setProductList] = useState(products);
  
  // Shopping Cart & Direct B2C Flow States
  const [cart, setCart] = useState([]);
  const [showFloatingCart, setShowFloatingCart] = useState(false);

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product]);
    setShowFloatingCart(true);
  };

  const [wishlist, setWishlist] = useState([]);

  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const [checkoutStep, setCheckoutStep] = useState('shipping'); // 'shipping' or 'review'

  const getCartWithQuantities = () => {
    const grouped = {};
    cart.forEach(item => {
      if (!grouped[item.id]) {
        grouped[item.id] = { ...item, quantity: 0 };
      }
      grouped[item.id].quantity += 1;
    });
    return Object.values(grouped);
  };

  const handleIncreaseQuantity = (productId) => {
    const item = products.find(p => p.id === productId);
    if (item) {
      setCart(prev => [...prev, item]);
    }
  };

  const handleDecreaseQuantity = (productId) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === productId);
      if (idx > -1) {
        const newCart = [...prev];
        newCart.splice(idx, 1);
        return newCart;
      }
      return prev;
    });
  };

  // Accessibility Lifted States
  const [language, setLanguage] = useState('EN'); // Global language state: 'HI', 'EN', 'KN'
  const [ruralMode, setRuralMode] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // Sign up popup state
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userAccount, setUserAccount] = useState({
    name: 'Elara Voss',
    email: 'elaravoss@gmail.com',
    lang: 'EN',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  });

  // 5-second automatic sign-up popup timer
  useEffect(() => {
    const timer = setTimeout(() => {
      // Show sign up popup if not logged in
      if (!userAccount) {
        setShowSignUpModal(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [userAccount]);

  // Scroll to top instantly whenever page/activeScreen changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeScreen]);

  const handleWhatsAppUploadComplete = (product) => {
    setActiveProduct(product);
    setActiveScreen('pipeline');
  };

  const handlePipelineComplete = (nextAction, product) => {
    if (product) {
      setProductList(prev => {
        // Prepend new craft if not already present
        if (prev.some(p => p.id === product.id)) return prev;
        return [product, ...prev];
      });
    }
    if (nextAction === 'view-marketplace') {
      setActiveScreen('marketplace');
    }
  };

  const handleProductSelect = (product) => {
    setActiveProduct(product);
    setActiveScreen('product-detail');
  };

  return (
    <div 
      className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between transition-all duration-500 font-sans"
      style={{ fontSize: largeText ? '116%' : '100%' }}
    >
      
      {/* Global Navigation Header shown only on non-landing pages */}
      {activeScreen !== 'landing' && (
        <Navbar 
          activeScreen={activeScreen} 
          setActiveScreen={setActiveScreen} 
          language={language}
          setLanguage={setLanguage}
          ruralMode={ruralMode}
          lowBandwidth={lowBandwidth}
          largeText={largeText}
          userAccount={userAccount}
          onLoginClick={() => setShowLoginModal(true)}
          onLogoutClick={() => setUserAccount(null)}
        />
      )}

      {/* Main Layout Routing */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 ${activeScreen === 'landing' ? 'pt-6 pb-24' : 'pt-24 pb-24'}`}>
        
        {/* LANDING PAGE SCREEN - MATCHING SCREEN 1 OF USER MOCKUP */}
        {activeScreen === 'landing' && (
          <div className="space-y-8 animate-fade-in max-w-3xl mx-auto text-left pb-16">
            
            {/* Top Brand Header Area matching Screen 1 */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-3xl border border-stone-200/60 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C1917] flex items-center justify-center text-white text-lg font-bold shadow-md">
                  🏺
                </div>
                <div>
                  <h3 className="title-serif text-lg font-bold text-stone-900 leading-none">HaathSe</h3>
                  <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mt-1">Heritage Showroom</p>
                </div>
              </div>
              
              <button className="relative p-2.5 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors border border-stone-200/60 shadow-sm">
                <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* Custom Premium Search input matching Screen 1 */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                onClick={() => setActiveScreen('marketplace')}
                className="w-full pl-11 pr-12 py-3.5 bg-stone-100/60 border-none rounded-full text-xs font-semibold placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-all shadow-inner"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <button 
                onClick={() => setActiveScreen('marketplace')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-stone-200/50 text-stone-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hero Banner matching Screen 1 (Warm Gold Gradient, Overlapping Image) */}
            <div className="bg-gradient-to-br from-[#854D0E]/20 via-[#A16207]/10 to-[#FEF08A]/10 rounded-[2rem] p-7 md:p-8 flex items-center justify-between shadow-[0_12px_35px_-12px_rgba(161,98,7,0.1)] relative overflow-hidden border border-[#854D0E]/15 group">
              <div className="text-left space-y-4 md:max-w-[55%] z-10">
                <h2 className="title-serif text-2xl md:text-3xl text-stone-900 leading-tight font-bold">
                  Timeless Designs <br />for Modern Living
                </h2>
                <button 
                  onClick={() => setActiveScreen('marketplace')} 
                  className="px-6 py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white text-[10px] uppercase tracking-widest font-bold rounded-full transition-all duration-300 transform active:scale-95 shadow-md"
                >
                  Shop Now
                </button>
              </div>
              
              <div className="md:max-w-[40%] relative flex justify-center z-10 group-hover:scale-105 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" 
                  alt="Craft Banner" 
                  className="h-32 object-cover rounded-2xl drop-shadow-xl"
                />
              </div>
            </div>

            {/* Categories section matching Screen 1 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest text-left">Categories</h3>
              
              {/* Category Circle Pills Row */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'All', name: 'All' },
                  { id: 'Pottery', name: 'Pottery' },
                  { id: 'Apparel', name: 'Apparel' },
                  { id: 'Wooden Art', name: 'Wooden Art' },
                  { id: 'Home Decor', name: 'Home Decor' },
                  { id: 'Paintings', name: 'Paintings' }
                ].map((cat, idx) => {
                  const isActive = cat.id === 'All';
                  return (
                    <button 
                      key={idx}
                      onClick={() => setActiveScreen('marketplace')}
                      className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 focus:outline-none flex-shrink-0 ${
                        isActive 
                          ? 'bg-[#1C1917] text-white shadow' 
                          : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Curated Collection Section matching Screen 1 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Curated Collection</h3>
                <button onClick={() => setActiveScreen('marketplace')} className="text-xs text-stone-500 font-bold hover:underline flex items-center gap-0.5">
                  View All
                </button>
              </div>

              {/* Curated grid cards */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => handleProductSelect(productList[12])} // Mithila Madhubani
                  className="group cursor-pointer bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-stone-50 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=400" alt="Mithila Art" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4 text-left">
                    <h4 className="text-xs font-bold text-stone-800">Mithila Canvas Art</h4>
                    <p className="text-[9px] text-stone-400 font-medium mt-0.5 leading-normal">Elegant organic natural pigments.</p>
                  </div>
                </div>

                <div 
                  onClick={() => handleProductSelect(productList[3])} // Mulberry Silk
                  className="group cursor-pointer bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-stone-50 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400" alt="Silk Saree" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4 text-left">
                    <h4 className="text-xs font-bold text-stone-800">Mulberry Handlooms</h4>
                    <p className="text-[9px] text-stone-400 font-medium mt-0.5 leading-normal">Kanchipuram temple architectures.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Sellers Grid matching Screen 2 Layout */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Best Sellers</h3>
                <button onClick={() => setActiveScreen('marketplace')} className="text-xs text-stone-500 font-bold hover:underline flex items-center gap-0.5">
                  View All
                </button>
              </div>

              {/* Best sellers grid */}
              <div className="grid grid-cols-2 gap-4">
                {productList.slice(0, 4).map((prod) => (
                  <div 
                    key={prod.id}
                    onClick={() => handleProductSelect(prod)}
                    className="group cursor-pointer bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 relative"
                  >
                    {/* Floating Heart */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(prod);
                      }}
                      className={`absolute top-3 right-3 p-1.5 rounded-full bg-white/90 shadow hover:scale-105 active:scale-95 transition-all z-10 ${
                        wishlist.some(p => p.id === prod.id) ? 'text-red-500' : 'text-stone-400'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlist.some(p => p.id === prod.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    <div className="aspect-[4/3] bg-stone-50 overflow-hidden relative">
                      <img src={prod.image} alt={translateField(prod, 'name', language)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>

                    <div className="p-4 space-y-2 text-left">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-stone-400 font-bold">{translateField(prod, 'craft', language)}</p>
                        <h4 className="text-xs font-bold text-stone-800 truncate mt-0.5">{translateField(prod, 'name', language)}</h4>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                        <p className="text-xs font-mono font-bold text-stone-900">₹{prod.priceINR.toLocaleString()}</p>
                        <button className="p-1.5 rounded-full bg-stone-950 text-white hover:bg-stone-800 active:scale-90 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ARTISAN NEAREST EVENTS & SHOWS DASHBOARD */}
        {activeScreen === 'whatsapp' && (
          <ArtisanEvents 
            language={language} 
            onProductSelect={handleProductSelect} 
            setActiveScreen={setActiveScreen} 
            setActiveProduct={setActiveProduct} 
          />
        )}

        {/* AI PIPELINE VISUALIZATION SCREEN */}
        {activeScreen === 'pipeline' && (
          <AIPipeline activeProduct={activeProduct} onPipelineComplete={handlePipelineComplete} language={language} />
        )}

        {/* B2B MARKETPLACE SCREEN */}
        {activeScreen === 'marketplace' && (
          <Marketplace 
            onProductSelect={handleProductSelect} 
            onBackClick={() => setActiveScreen('landing')} 
            language={language} 
            lowBandwidth={lowBandwidth} 
            products={productList} 
          />
        )}

        {/* PRODUCT DETAIL SCREEN */}
        {activeScreen === 'product-detail' && (
          <ProductDetail 
            product={activeProduct} 
            onBackClick={() => setActiveScreen('marketplace')} 
            language={language} 
            lowBandwidth={lowBandwidth} 
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}
        
        {/* CHECKOUT / DIRECT B2C PAYMENT SCREEN */}
        {activeScreen === 'checkout' && (
          <div className="space-y-6 animate-fade-in max-w-md mx-auto text-left pb-16">
            
            {/* Top Checkout Header Bar */}
            <div className="flex items-center justify-between bg-white px-5 py-4 rounded-3xl border border-stone-200/50 shadow-sm">
              <button 
                onClick={() => {
                  if (checkoutStep === 'review') {
                    setCheckoutStep('shipping');
                  } else {
                    setActiveScreen('product-detail');
                  }
                }}
                className="p-2 rounded-full hover:bg-stone-100 transition-all text-stone-900 border border-stone-200/80 active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-stone-900 tracking-wide font-sans">Checkout</h2>
              <div className="relative p-2 rounded-full bg-stone-50 border border-stone-200/60 shadow-sm">
                <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>

            {/* Stepper matching Screenshot 2 */}
            <div className="bg-white p-5 rounded-3xl border border-stone-200/50 shadow-sm relative">
              <div className="flex items-center justify-between relative z-10">
                {/* Step 1: Shipping */}
                <div className="flex flex-col items-center space-y-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    checkoutStep === 'shipping' 
                      ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-md' 
                      : 'bg-stone-100 border-stone-200 text-stone-400'
                  }`}>
                    <span className="text-xs">📦</span>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide ${checkoutStep === 'shipping' ? 'text-stone-900' : 'text-stone-400'}`}>Shipping</span>
                </div>

                {/* Connecting Line 1 */}
                <div className="h-[2px] flex-1 bg-stone-200 mx-2 -mt-4 relative">
                  <div className={`absolute inset-0 bg-[#1C1917] transition-all duration-500 ${
                    checkoutStep === 'review' ? 'w-full' : 'w-0'
                  }`} />
                </div>

                {/* Step 2: Payment */}
                <div className="flex flex-col items-center space-y-1 flex-1 opacity-70">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 border border-stone-200 text-stone-400">
                    <span className="text-xs">💳</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 tracking-wide">Payment</span>
                </div>

                {/* Connecting Line 2 */}
                <div className="h-[2px] flex-1 bg-stone-200 mx-2 -mt-4" />

                {/* Step 3: Review */}
                <div className="flex flex-col items-center space-y-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    checkoutStep === 'review' 
                      ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-md' 
                      : 'bg-stone-100 border-stone-200 text-stone-400'
                  }`}>
                    <span className="text-xs">📋</span>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide ${checkoutStep === 'review' ? 'text-stone-900' : 'text-stone-400'}`}>Review</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            {checkoutStep === 'shipping' ? (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Enter Shipping Details</h3>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (cart.length === 0) {
                      alert("Your shopping bag is empty! Add items to buy.");
                      return;
                    }
                    setCheckoutStep('review');
                  }} 
                  className="space-y-4 bg-white p-6 rounded-3xl border border-stone-200/50 shadow-sm"
                >
                  <div>
                    <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Full Name*</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Enter Full Name" 
                      className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Phone Number*</label>
                    <div className="flex gap-2">
                      <div className="w-16 p-3.5 bg-stone-100 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-500 text-center shadow-inner">
                        +91
                      </div>
                      <input 
                        required 
                        type="tel" 
                        placeholder="Enter 10-digit number" 
                        pattern="[0-9]{10}"
                        className="flex-1 p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Select Province</label>
                      <select 
                        required
                        className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all shadow-inner"
                      >
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Rajasthan">Rajasthan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Select City</label>
                      <select 
                        required
                        className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all shadow-inner"
                      >
                        <option value="Bangalore">Bangalore</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Varanasi">Varanasi</option>
                        <option value="Jaipur">Jaipur</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Street Address*</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Enter street address" 
                      className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Postal Code*</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Enter postal code" 
                      pattern="[0-9]{6}"
                      className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full py-4 mt-2 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-md transition-all active:scale-98"
                  >
                    Confirm
                  </button>
                </form>
              </div>
            ) : (
              /* Review / Checkout Cart Listings - Step 3 */
              <div className="space-y-6">
                <div className="space-y-3">
                  {getCartWithQuantities().map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-stone-200/50 shadow-sm"
                    >
                      <img 
                        src={item.image} 
                        alt={translateField(item, 'name', language)} 
                        className="w-16 h-16 object-cover rounded-2xl border border-stone-100 shadow-sm"
                      />
                      
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs font-bold text-stone-800 truncate">{translateField(item, 'name', language)}</h4>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-stone-400 block mt-0.5">
                          {translateField(item, 'craft', language)} • Limited Stock
                        </span>
                        <p className="text-xs font-mono font-bold text-stone-900 mt-1">₹{item.priceINR.toLocaleString()}</p>
                      </div>

                      {/* Interactive Quantity Adjuster trigger exactly like Screenshot 2 */}
                      <div className="flex items-center bg-stone-100 border border-stone-200/60 rounded-full px-2.5 py-1">
                        <button 
                          onClick={() => handleDecreaseQuantity(item.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-stone-500 hover:bg-white active:scale-90 transition-all"
                        >
                          -
                        </button>
                        <span className="mx-2 text-xs font-bold text-stone-800 w-3 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-stone-500 hover:bg-white active:scale-90 transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom billing card exactly like screenshot 2 right side */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200/50 shadow-sm space-y-4">
                  <div className="space-y-2.5 text-xs text-stone-600 font-medium">
                    <div className="flex justify-between items-center">
                      <span>Total</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        ₹{cart.reduce((sum, item) => sum + item.priceINR, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Shipping Fee (Middlemen Free)</span>
                      <span className="font-semibold uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/30 text-[9px]">
                        ₹0
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-stone-900">Subtotal</span>
                      <span className="font-mono text-base font-black text-stone-950">
                        ₹{cart.reduce((sum, item) => sum + item.priceINR, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Placement pill submit */}
                  <button 
                    onClick={() => {
                      alert(`🎉 Success! Direct fair-trade transaction completed.\nLedger registration sealed.\nWe are routing the payment directly to the artisans!`);
                      setCart([]);
                      setCheckoutStep('shipping');
                      setActiveScreen('landing');
                    }}
                    className="w-full py-4 mt-2 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-md transition-all active:scale-98"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS IMPACT DASHBOARD SCREEN */}
        {/* MY WISHLIST SCREEN - MATCHING SCREEN 3 OF USER MOCKUP */}
        {activeScreen === 'wishlist' && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto text-left">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm">
              <h2 className="title-serif text-2xl font-bold text-stone-900">My Wishlist</h2>
              <button className="p-2 rounded-full hover:bg-stone-50 text-stone-700 border border-stone-200/80">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/50 shadow-sm space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-stone-50 flex items-center justify-center text-2xl">
                  ❤️
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-850 text-sm">Your wishlist is empty</h3>
                  <p className="text-xs text-stone-400 font-medium">Explore unique artisan mastercrafts and save your favorites here!</p>
                </div>
                <button
                  onClick={() => setActiveScreen('marketplace')}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-[10px] uppercase tracking-wider font-bold rounded-full transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {wishlist.map((prod) => (
                  <div 
                    key={prod.id}
                    onClick={() => handleProductSelect(prod)}
                    className="group cursor-pointer bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 relative"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWishlist(prod);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-red-500 shadow hover:scale-105 active:scale-95 transition-all z-10"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <div className="aspect-[4/3] bg-stone-50 overflow-hidden relative">
                      <img 
                        src={prod.image} 
                        alt={translateField(prod, 'name', language)} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div>
                        <p className="text-[8px] uppercase tracking-widest text-stone-400 font-bold">{translateField(prod, 'craft', language)}</p>
                        <h4 className="text-xs font-bold text-stone-800 truncate mt-0.5">{translateField(prod, 'name', language)}</h4>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                        <p className="text-xs font-mono font-bold text-stone-900">₹{prod.priceINR.toLocaleString()}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(prod);
                          }}
                          className="p-1.5 rounded-full bg-stone-950 text-white hover:bg-stone-800 active:scale-90 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS IMPACT DASHBOARD SCREEN */}
        {activeScreen === 'dashboard' && (
          <ImpactDashboard language={language} />
        )}

        {/* MY PROFILE SCREEN */}
        {activeScreen === 'profile' && (
          <Profile 
            userAccount={userAccount} 
            onUpdateUser={(updated) => setUserAccount(updated)}
            onLogout={() => {
              setUserAccount(null);
              setActiveScreen('landing');
            }}
            onBackClick={() => setActiveScreen('landing')}
          />
        )}

      </main>

      {/* STICKY BOTTOM FLOATING NAVIGATION BAR matching user's reference images exactly */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 border border-stone-200/60 shadow-[0_10px_30px_-5px_rgba(120,113,108,0.2)] rounded-full px-5 py-2.5 flex items-center gap-6 backdrop-blur-md transition-all duration-300">
        {[
          { id: 'landing', icon: (active) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-stone-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, label: 'Home' },
          { id: 'wishlist', icon: (active) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-stone-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>, label: 'Wishlist' },
          { id: 'marketplace', icon: (active) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-stone-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>, label: 'Catalog' },
          { id: 'whatsapp', icon: (active) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-stone-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>, label: 'Events' },
          { id: 'profile', icon: (active) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-stone-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>, label: 'Profile' }
        ].map((tab) => {
          const isActive = activeScreen === tab.id || (tab.id === 'profile' && showLoginModal);
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'profile' && !userAccount) {
                  setShowLoginModal(true);
                } else {
                  setActiveScreen(tab.id);
                }
              }}
              className={`relative p-2.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${isActive ? 'bg-[#1C1917] shadow-md scale-105' : 'bg-transparent hover:bg-stone-100'}`}
              title={tab.label}
            >
              {tab.icon(isActive)}
            </button>
          );
        })}
      </div>

      {/* SIGN UP MODAL POPUP - Triggered after 5 seconds automatically */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-6 shadow-xl relative border border-slate-100 text-left animate-slide-up">
            <button 
              onClick={() => setShowSignUpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="space-y-2">
              <span className="text-xl">👋</span>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Create your Buyer Account</h3>
              <p className="text-xs text-slate-500">Sign up now to directly purchase verified mastercrafts from rural artisan clusters.</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              setUserAccount({
                name: formData.get('name'),
                email: formData.get('email'),
                lang: formData.get('lang')
              });
              setShowSignUpModal(false);
            }} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</label>
                <input 
                  required
                  type="text" 
                  name="name" 
                  placeholder="E.g. Priya Sharma" 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
                <input 
                  required
                  type="email" 
                  name="email" 
                  placeholder="priya@example.com" 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Preferred Language</label>
                <select 
                  name="lang" 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="EN">English</option>
                  <option value="HI">हिन्दी (Hindi)</option>
                  <option value="KN">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                Sign Up Now
              </button>
            </form>
            <div className="text-center">
              <button 
                onClick={() => {
                  setShowSignUpModal(false);
                  setShowLoginModal(true);
                }}
                className="text-xs text-stone-900 font-semibold hover:underline"
              >
                Already have an account? Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL POPUP - Triggered from Top-Right Navbar or footer */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-[#1C1917]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-6 shadow-xl relative border border-stone-200/60 text-left animate-slide-up">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-stone-800 leading-tight">Welcome Back</h3>
              <p className="text-xs text-stone-500">Log in to manage your orders and check artisan certificate ledgers.</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setUserAccount({
                name: 'Priya Sharma',
                email: 'priya@example.com',
                lang: 'EN'
              });
              setShowLoginModal(false);
            }} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Email Address</label>
                <input 
                  required
                  type="email" 
                  defaultValue="priya@example.com"
                  placeholder="priya@example.com" 
                  className="w-full mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Password</label>
                <input 
                  required
                  type="password" 
                  defaultValue="password"
                  placeholder="••••••••" 
                  className="w-full mt-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-400 transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Persistent AI Voice Speech Assistant overlay */}
      <AIAssistant 
        currentScreen={activeScreen}
        language={language}
        ruralMode={ruralMode}
        setRuralMode={setRuralMode}
        lowBandwidth={lowBandwidth}
        setLowBandwidth={setLowBandwidth}
        largeText={largeText}
        setLargeText={setLargeText}
      />

      {/* Global Footer shown on non-landing pages */}
      {activeScreen !== 'landing' && (
        <Footer setActiveScreen={setActiveScreen} language={language} />
      )}

      {/* FLOATING CART WINDOW / POPUP TRIGGER - SLIDES IN FROM THE BOTTOM */}
      {showFloatingCart && cart.length > 0 && (
        <div 
          onClick={() => {
            setActiveScreen('checkout');
            setShowFloatingCart(false);
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white/95 text-stone-900 px-6 py-3 rounded-full shadow-[0_10px_30px_-5px_rgba(120,113,108,0.25)] flex items-center justify-between gap-6 cursor-pointer hover:scale-102 active:scale-95 transition-all duration-300 animate-slide-up border border-stone-200/60 w-[90%] max-w-xs md:max-w-sm backdrop-blur-md"
        >
          <div className="flex items-center gap-3 text-left">
            <span className="text-xl">🛍️</span>
            <div>
              <h4 className="text-[11px] font-bold text-stone-900 tracking-wide">Direct Fair-Trade Cart</h4>
              <p className="text-[9px] text-stone-500 font-medium mt-0.5">{cart.length} item{cart.length > 1 ? 's' : ''} added • ₹{cart.reduce((sum, item) => sum + item.priceINR, 0).toLocaleString()}</p>
            </div>
          </div>
          <button className="text-[9px] uppercase tracking-widest font-extrabold bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full transition-all shadow-sm">
            Checkout
          </button>
        </div>
      )}

      {/* Live Backend Status Badge — visible to judges during demo */}
      <BackendStatus />
    </div>
  );
}
