import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiBell, FiShoppingBag, FiDollarSign, FiBox, FiUsers, 
  FiMessageCircle, FiBookOpen, FiMic, FiPlus, FiArrowRight,
  FiPlay, FiVolume2, FiPause, FiX, FiCheck, FiLoader, FiPhone, 
  FiSend, FiArrowLeft, FiClock, FiGlobe
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useLanguage } from '../../context/LanguageContext';
import SellerLayout from './components/SellerLayout';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, addProduct, updateProductStock, refreshProducts } = useProducts();
  const { language, changeLanguage, t } = useLanguage();
  
  // Tabs: overview | bazaar | orders | earnings | sikho
  const [activeTab, setActiveTab] = useState('overview');
  
  // Local list of products to manage stock counts reactively
  const [localProducts, setLocalProducts] = useState([]);

  // Mock orders list
  const [orders, setOrders] = useState([
    {
      id: '1024',
      buyer: 'Aarav Sharma',
      location: 'Mumbai, Maharashtra',
      product: 'Earthen Sanctuary Vase',
      price: 4250,
      image: '/images/earthen-sanctuary-vase.png',
      status: 'Pending',
      date: 'May 24, 2026',
      voiceInstruction: 'राधा दीदी, कृपया इसे अखबार में अच्छे से लपेट देना, यह मेरी माँ के लिए उपहार है।'
    },
    {
      id: '1023',
      buyer: 'Priya Patel',
      location: 'Bangalore, Karnataka',
      product: 'Terracotta Uru',
      price: 3400,
      image: '/images/terracotta-uru.png',
      status: 'Pending',
      date: 'May 23, 2026',
      voiceInstruction: 'नमस्ते राधा जी, कृपया मिट्टी के घड़े का ढक्कन थोड़ा चौड़ा बनाइएगा।'
    },
    {
      id: '1021',
      buyer: 'Siddharth Verma',
      location: 'Delhi',
      product: 'Ripple Clay Bowl',
      price: 1400,
      image: '/images/ripple-clay-bowl.png',
      status: 'Shipped',
      date: 'May 20, 2026',
      tracking: 'India Post EP108395729IN',
      voiceInstruction: ''
    },
    {
      id: '1018',
      buyer: 'Amit Singh',
      location: 'Pune, Maharashtra',
      product: 'Heritage Pitcher',
      price: 2050,
      image: '/images/heritage-pitcher.png',
      status: 'Completed',
      date: 'May 15, 2026',
      voiceInstruction: ''
    }
  ]);

  // Earnings details
  const [earningsBalance, setEarningsBalance] = useState(4520);
  const [withdrawalHistory, setWithdrawalHistory] = useState([
    { id: 'TXN-90281', date: 'May 10, 2026', amount: 10500, bank: 'SBI (4321)', status: 'Success' },
    { id: 'TXN-80928', date: 'Apr 28, 2026', amount: 8200, bank: 'SBI (4321)', status: 'Success' }
  ]);

  // Modal control states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1); // 1: Input/Check, 2: Loading, 3: Success

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newCategory, setNewCategory] = useState('Pottery & Ceramics');
  const [newDescription, setNewDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState('/images/earthen-sanctuary-vase.png');
  const [isRecordingDesc, setIsRecordingDesc] = useState(false);

  // Audio instruction playback tracking
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Learning course playback
  const [playingCourse, setPlayingCourse] = useState(null);
  const [lowInternetMode, setLowInternetMode] = useState(false);

  // Pre-curated high-quality craft images for listing to avoid placeholders
  const CRAFT_IMAGES = [
    { name: 'Clay Vase', path: '/images/earthen-sanctuary-vase.png' },
    { name: 'Water Carafe', path: '/images/terracotta-uru.png' },
    { name: 'Ceramic Pitcher', path: '/images/heritage-pitcher.png' },
    { name: 'Indigo Stole', path: '/images/indigo-silk-stole.png' }
  ];

  // Fallback to Radha Devi if user name not set
  const displayName = user?.name || user?.full_name || 'Radha Devi';

  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, pendingOrdersCount: 0 });

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/api/seller/dashboard');
      if (res && res.stats) {
        setStats(res.stats);
        setEarningsBalance(res.stats.revenue);
      }
    } catch (err) {
      console.error('Failed to load seller stats:', err);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      const res = await api.get('/api/seller/orders');
      if (res && res.orders) {
        const mapped = res.orders.map(o => ({
          id: o.id,
          buyer: o.buyer?.full_name || 'Buyer',
          location: `${o.buyer?.district || 'India'}, ${o.buyer?.state || ''}`,
          product: o.order_items?.[0]?.product?.title || 'Handicrafts',
          price: Number(o.total_amount),
          image: o.order_items?.[0]?.product?.image_urls?.[0] || '/images/earthen-sanctuary-vase.png',
          status: o.order_status.charAt(0).toUpperCase() + o.order_status.slice(1),
          date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          voiceInstruction: ''
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Failed to load seller orders:', err);
    }
  };

  // Synchronize local products with context data on load
  useEffect(() => {
    if (products && products.length > 0) {
      setLocalProducts(products);
    }
  }, [products]);

  // Synchronize stats and orders when user or activeTab changes
  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchSellerOrders();
      refreshProducts();
    }
  }, [user, activeTab]);

  // Parse voice commands received from SellerLayout's microphone helper
  const handleVoiceInput = (text) => {
    const cleanText = text.toLowerCase();
    
    if (cleanText.includes('bazaar') || cleanText.includes('market') || cleanText.includes('stock') || cleanText.includes('saaman')) {
      setActiveTab('bazaar');
      toast.success("Bazaar tab active / दुकान का स्टॉक खुल गया है", { icon: '🏪' });
    } else if (cleanText.includes('saheli') || cleanText.includes('chat') || cleanText.includes('talk') || cleanText.includes('sister') || cleanText.includes('community') || cleanText.includes('baat')) {
      toast.success("Redirecting to Sisters Voice Circle / सहेली लाइव रूम में जा रहे हैं...", { icon: '💬' });
      navigate('/artisans');
    } else if (cleanText.includes('order') || cleanText.includes('bikli') || cleanText.includes('graha')) {
      setActiveTab('orders');
      toast.success("Orders tab active / आर्डर की सूची खुल गयी है", { icon: '🛍️' });
    } else if (cleanText.includes('sikho') || cleanText.includes('learn') || cleanText.includes('video') || cleanText.includes('padho')) {
      setActiveTab('sikho');
      toast.success("Sikho Training active / सीखो पोर्टल खुल गया है", { icon: '📖' });
    } else if (cleanText.includes('earning') || cleanText.includes('paisa') || cleanText.includes('kamai') || cleanText.includes('bank')) {
      setActiveTab('earnings');
      toast.success("Earnings tab active / आपकी कमाई की जानकारी", { icon: '💰' });
    } else if (cleanText.includes('home') || cleanText.includes('dashboard') || cleanText.includes('overview') || cleanText.includes('main')) {
      setActiveTab('overview');
      toast.success("Overview active / मुख्य डैशबोर्ड", { icon: '🏠' });
    } else if (cleanText.includes('logout') || cleanText.includes('sign out') || cleanText.includes('exit')) {
      logout();
      navigate('/seller');
      toast.success("Logged out successfully");
    } else {
      toast(`Prompt received: "${text}"`, { icon: '🤖' });
    }
  };

  // Play instruction using browser synthesis
  const playVoiceInstruction = (orderId, text) => {
    if ('speechSynthesis' in window) {
      if (playingAudioId === orderId) {
        window.speechSynthesis.cancel();
        setPlayingAudioId(null);
        return;
      }
      
      window.speechSynthesis.cancel();
      setPlayingAudioId(orderId);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9; // Slow rate for accessibility
      
      utterance.onend = () => {
        setPlayingAudioId(null);
      };
      utterance.onerror = () => {
        setPlayingAudioId(null);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Audio playback not supported in this browser");
    }
  };

  // Modify stock counts reactively
  const handleUpdateStock = async (productId, amount) => {
    const item = localProducts.find(p => p.id === productId);
    if (!item) return;
    const currentStock = item.stock !== undefined ? item.stock : 12;
    const newStock = Math.max(0, currentStock + amount);

    try {
      const success = await updateProductStock(productId, newStock);
      if (success) {
        toast.success("Stock count updated!");
      } else {
        toast.error("Failed to update stock.");
      }
    } catch (err) {
      toast.error("Error updating stock.");
    }
  };

  // Submit product creation form
  // Submit product creation form
  const handleAddProductSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!newTitle.trim() || !newPrice.trim()) {
      toast.error("Please enter item name and price!");
      return;
    }

    const priceNum = Number(newPrice);
    const stockNum = Number(newStock);

    try {
      const newProd = await addProduct({
        title: newTitle,
        price: priceNum,
        category: newCategory,
        description: newDescription || `${newTitle} handcrafted with traditional skills.`,
        stock: stockNum,
        stockStatus: `In stock (${stockNum} units)`,
        artisanId: user?.id || 'meera-devi',
        subtitle: `${newCategory.toUpperCase()} • ${user?.district?.toUpperCase() || 'BHUJ'} DISTRICT`,
        district: user?.district || 'Bhuj',
        images: [selectedImage],
        tags: ["Handmade", "Local Craft"]
      });

      // Update local state list
      setLocalProducts([newProd, ...localProducts]);
      
      // Reset Form
      setNewTitle('');
      setNewPrice('');
      setNewStock('10');
      setNewDescription('');
      setShowAddProductModal(false);
      
      toast.success(`"${newTitle}" has been listed on KariGhar Bazaar!`, {
        icon: '🎉',
        duration: 5000
      });
    } catch (err) {
      toast.error(err.message || "Failed to list craft.");
    }
  };

  // Simulate record voice description
  const simulateVoiceRecord = () => {
    setIsRecordingDesc(true);
    toast.loading("Recording voice details... बोलिए...", { id: 'voice-rec' });
    
    setTimeout(() => {
      setIsRecordingDesc(false);
      setNewDescription(`Earthen sanctuary clay vase hand-carved with traditional floral motifs from ${user?.village || 'Bhuj'} village.`);
      toast.dismiss('voice-rec');
      toast.success("Voice transcribed successfully!", { icon: '✍️' });
    }, 2500);
  };

  // Mark pending order as shipped
  const handleShipOrder = async (orderId) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: 'shipped' });
      toast.success(`Order marked as Shipped!`);
      await fetchSellerOrders();
      await fetchDashboardStats();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  // Mark shipped order as completed/delivered
  const handleDeliverOrder = async (orderId) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: 'delivered' });
      toast.success(`Order delivered successfully!`);
      await fetchSellerOrders();
      await fetchDashboardStats();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  // Bank payout simulation flow
  const handlePayoutInitiate = () => {
    if (earningsBalance <= 0) {
      toast.error("Available balance is ₹0");
      return;
    }
    setShowWithdrawModal(true);
    setWithdrawStep(1);
  };

  const handleWithdrawConfirm = () => {
    setWithdrawStep(2); // Loading step
    setTimeout(() => {
      setWithdrawStep(3); // Success step
      
      // Update ledger balance
      const withdrawnAmount = earningsBalance;
      setEarningsBalance(0);
      setWithdrawalHistory(prev => [
        {
          id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          date: 'Today',
          amount: withdrawnAmount,
          bank: 'SBI (4321)',
          status: 'Success'
        },
        ...prev
      ]);
      toast.success(`Withdrew ₹${withdrawnAmount.toLocaleString('en-IN')} successfully!`);
    }, 3000);
  };

  // Filter products to display on Bazaar page
  // Fallback to displaying meera-devi products to show loaded mock database
  const myProducts = localProducts.filter(p => p.artisanId === user?.id || p.artisanId === 'meera-devi');

  return (
    <SellerLayout onVoiceInput={handleVoiceInput}>
      
      {/* Replicated Consumer-Style Header Navbar */}
      <header className="sticky top-0 left-0 w-full z-50 bg-[#FDF8F4]/85 backdrop-blur-md border-b border-[#E5DCD0]/60 transition-all -mx-6 md:-mx-12 px-6 md:px-12 mb-6">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/seller/dashboard" onClick={() => setActiveTab('overview')} className="font-serif text-2xl md:text-3xl font-bold text-[#8B3A1A] hover:scale-102 transition-transform tracking-wide flex items-center gap-1">
            KariGhar<span className="text-[#2D5A3D]">.</span> <span className="text-xs uppercase bg-[#8B3A1A]/10 text-[#8B3A1A] px-2.5 py-0.5 rounded-full ml-2 font-sans font-bold tracking-normal">Seller</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`font-semibold text-base py-2 transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#8B3A1A] after:transition-all ${
                activeTab === 'overview' ? 'text-[#8B3A1A] after:w-full' : 'text-[#555555] hover:text-[#8B3A1A] after:w-0 hover:after:w-full'
              }`}
            >
              {t('seller.overview')}
            </button>
            <button 
              onClick={() => setActiveTab('bazaar')} 
              className={`font-semibold text-base py-2 transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#8B3A1A] after:transition-all ${
                activeTab === 'bazaar' ? 'text-[#8B3A1A] after:w-full' : 'text-[#555555] hover:text-[#8B3A1A] after:w-0 hover:after:w-full'
              }`}
            >
              {t('seller.bazaar')}
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`font-semibold text-base py-2 transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#8B3A1A] after:transition-all ${
                activeTab === 'orders' ? 'text-[#8B3A1A] after:w-full' : 'text-[#555555] hover:text-[#8B3A1A] after:w-0 hover:after:w-full'
              }`}
            >
              {t('seller.orders')}
            </button>
            <button 
              onClick={() => setActiveTab('earnings')} 
              className={`font-semibold text-base py-2 transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#8B3A1A] after:transition-all ${
                activeTab === 'earnings' ? 'text-[#8B3A1A] after:w-full' : 'text-[#555555] hover:text-[#8B3A1A] after:w-0 hover:after:w-full'
              }`}
            >
              {t('seller.earnings')}
            </button>
            <button 
              onClick={() => setActiveTab('sikho')} 
              className={`font-semibold text-base py-2 transition-all relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#8B3A1A] after:transition-all ${
                activeTab === 'sikho' ? 'text-[#8B3A1A] after:w-full' : 'text-[#555555] hover:text-[#8B3A1A] after:w-0 hover:after:w-full'
              }`}
            >
              {t('seller.sikho')}
            </button>
            <Link 
              to="/artisans" 
              className="font-semibold text-base py-2 text-[#555555] hover:text-[#8B3A1A] transition-all"
            >
              {t('seller.sisters')}
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-[#FDF8F4] border border-[#E5DCD0] rounded-xl px-2 py-1 shadow-sm">
              <FiGlobe className="text-[#8B3A1A] w-4 h-4" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-[#1A1A1A] outline-none cursor-pointer p-0"
                title={t('nav.languageSelect')}
                style={{ fontFamily: 'var(--font-sans)', appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="en">EN</option>
                <option value="hi">हिन्दी</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>
            </div>

            <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-[#2D5A3D] hover:text-[#8B3A1A] transition-colors" title="Go to Consumer Store">
              🏠 <span className="hidden sm:inline">Store</span>
            </Link>

            <button className="text-xl hover:text-[#8B3A1A] p-2 hover:bg-[#8B3A1A]/10 rounded-full transition-all relative" title="Notifications">
              <FiBell />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8B3A1A]"></span>
            </button>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              <img 
                src={user?.avatar || '/karighar-assistant-lady.png'} 
                alt="Artisan Avatar" 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#8B3A1A] cursor-pointer hover:scale-105 transition-transform"
                title={`${displayName} - Click to Sign Out`}
                onClick={() => {
                  if (window.confirm("Do you want to sign out?")) {
                    logout();
                    navigate('/seller');
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (window.confirm("Do you want to sign out?")) {
                    logout();
                    navigate('/seller');
                  }
                }}
                className="hidden md:flex text-sm font-bold text-[#8B3A1A] hover:underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content Body */}
      <div className="flex-1 flex flex-col gap-6 py-2 pb-28 w-full max-w-[1440px] mx-auto z-10">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            {/* Welcome Banner Card */}
            <div className="karigar-card w-full flex flex-col gap-3 border-l-[6px] border-l-[#8B3A1A] shadow-md bg-white">
              <span className="text-lg md:text-xl italic font-semibold text-[#8B3A1A] karigar-serif">
                {t('seller.motto')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] karigar-serif">
                {t('seller.welcome')}{displayName}
              </h2>
            </div>

            {/* 2x2 Grid of Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Orders */}
              <div 
                onClick={() => setActiveTab('orders')}
                className="karigar-card bg-white hover:scale-[1.01] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-[180px] p-6 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                      <FiShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#8B3A1A] transition-colors">{t('seller.orders')}</h4>
                      <p className="text-sm text-[#666666]">View and manage your orders</p>
                    </div>
                  </div>
                  <span className="bg-[#FFF0EB] text-[#8B3A1A] text-xs font-bold px-3 py-1.5 rounded-full border border-[#8B3A1A]/10">
                    {orders.filter(o => o.status === 'Pending').length} Pending
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-[#E5DCD0]/30 pt-4 mt-2">
                  <span className="text-xs font-bold text-[#8B3A1A] tracking-wider uppercase">Fulfill Pending</span>
                  <FiArrowRight className="w-5 h-5 text-[#8B3A1A] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Earnings */}
              <div 
                onClick={() => setActiveTab('earnings')}
                className="karigar-card bg-white hover:scale-[1.01] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-[180px] p-6 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2D5A3D]">
                      <FiDollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#2D5A3D] transition-colors">{t('seller.earnings')}</h4>
                      <p className="text-sm text-[#666666]">Your hard earned money</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-[#2D5A3D]">
                    ₹ {earningsBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-[#E5DCD0]/30 pt-4 mt-2">
                  <span className="text-xs font-bold text-[#2D5A3D] tracking-wider uppercase">Withdraw to Bank</span>
                  <FiArrowRight className="w-5 h-5 text-[#2D5A3D] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Stock */}
              <div 
                onClick={() => setActiveTab('bazaar')}
                className="karigar-card bg-white hover:scale-[1.01] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-[180px] p-6 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <FiBox className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1A1A1A] group-hover:text-[#8B3A1A] transition-colors">{t('seller.stock')}</h4>
                      <p className="text-sm text-[#666666]">Manage your products</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-[#8B3A1A]">
                    {myProducts.length} Items Listed
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-[#E5DCD0]/30 pt-4 mt-2">
                  <span className="text-xs font-bold text-[#8B3A1A] tracking-wider uppercase">Manage Inventory</span>
                  <FiPlus className="w-5 h-5 text-[#8B3A1A]" />
                </div>
              </div>

              {/* Card 4: Community */}
              <Link 
                to="/artisans"
                className="karigar-card bg-white hover:scale-[1.01] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-[180px] p-6 group text-left"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                      <FiUsers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#1A1A1A] group-hover:text-purple-600 transition-colors">{t('seller.community')}</h4>
                      <p className="text-sm text-[#666666]">Sisters of your craft</p>
                    </div>
                  </div>
                  
                  {/* Overlapping Avatar Circles */}
                  <div className="flex items-center -space-x-3">
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhv24OrCZTog5IHmEdtnhupk9ecHTkmN585kF-0_TuqciePmlXlXTLT9g4em5dXEbqNCI0g0Vr9c58z3HthVKpe-bmlJjaNqlo_vfalJSnMM3oiV3fsbHUKYP2-htqf1KITIlI7BJyEtTlKwlzikw7xSAW3JoGn6bMcCZQHHJdYAYTZspghYWwahP7tQC--xHp9a6Qav98tf2LlPzX1IaFnaOv5rHanvGuc5VDRSRoi-_rAcDLtBCuSm4j3cunoaQ7NzvXBwNcZaQ_" alt="Sisters" />
                    <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN4HhWBa8kV8LLQmUw80gc2Al2fQFujXYApcjviK2aMl4jaxA2cYocfM2U342B8jDIlbkkwtfRLWqw2L_JarPjcdijUpnS9DWSVYsWx6QwW7ujr5TAiYsqJiqwaYGlzgcEp1iveCSQa69NA5yV6Ezq3CI7caB5tenf9pycZHOkiqKiPIXIYCn5dKUFIbBM_8cBQpbwyBojH7MmKM_XImBDGBM_QVzswyYcplN6O88fffeYjgV5J1_MT491M7OhW0Z7sgfZpbNJdlBG" alt="Sisters" />
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#8B3A1A] text-white flex items-center justify-center text-xs font-bold">
                      +15
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-[#E5DCD0]/30 pt-4 mt-2">
                  <span className="text-xs font-bold text-purple-600 tracking-wider uppercase">{t('seller.enterVoice')}</span>
                  <FiArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>

            {/* Dashed Border Prompt Card */}
            <div className="border-4 border-dashed border-[#E5DCD0] bg-white/50 rounded-[24px] p-8 text-center flex flex-col items-center justify-center gap-4 relative mt-4">
              <p className="text-lg font-semibold text-[#1A1A1A] max-w-md">
                {t('seller.quickHelp')}
              </p>
              <div className="w-14 h-14 rounded-full bg-[#FFF0EB] border border-[#8B3A1A]/30 flex items-center justify-center text-[#8B3A1A] shadow-md animate-pulse mt-1 cursor-pointer">
                <FiMic className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BAZAAR (STOCK MANAGEMENT) */}
        {activeTab === 'bazaar' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="flex justify-between items-center w-full">
              <div>
                <h2 className="text-3xl font-bold text-[#8B3A1A] font-serif">{t('seller.bazaarTitle')}</h2>
                <p className="text-[#666666] text-sm">{t('seller.bazaarSub')}</p>
              </div>
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="karigar-btn-primary px-6 py-3.5 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FiPlus className="w-5 h-5" /> {t('seller.addCraftBtn')}
              </button>
            </div>

            {/* Products Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {myProducts.map(prod => {
                const stockVal = prod.stock !== undefined ? prod.stock : 12;
                return (
                  <div key={prod.id} className="karigar-card bg-white p-5 flex flex-col justify-between gap-4 border border-[#E5DCD0]/40">
                    <div className="flex gap-4">
                      <img 
                        src={prod.images ? prod.images[0] : '/images/earthen-sanctuary-vase.png'} 
                        alt={prod.title} 
                        className="w-24 h-24 rounded-2xl object-cover border border-[#E5DCD0]" 
                      />
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <span className="text-xs font-bold text-[#8B3A1A] tracking-wider uppercase truncate">{prod.category}</span>
                        <h4 className="text-lg font-bold text-[#1A1A1A] leading-snug truncate mt-0.5">{prod.title}</h4>
                        <span className="text-xl font-bold text-[#2D5A3D] mt-1">₹{prod.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-[#E5DCD0]/30 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#666666]">{t('seller.stockQuantity')}:</span>
                        <span className={`text-sm font-extrabold ${stockVal > 0 ? 'text-[#2D5A3D]' : 'text-red-500'}`}>
                          {stockVal > 0 ? `${stockVal} ${t('seller.availableUnits')}` : t('seller.outOfStock')}
                        </span>
                      </div>
                      
                      {/* Counter Controls */}
                      <div className="flex items-center justify-between gap-3 mt-1 bg-[#FDFBF9] border border-[#E5DCD0] rounded-xl p-2.5">
                        <button 
                          onClick={() => handleUpdateStock(prod.id, -1)}
                          className="w-10 h-10 rounded-lg bg-white border border-[#E5DCD0] text-xl font-bold text-[#8B3A1A] hover:bg-[#FFF0EB] flex items-center justify-center cursor-pointer shadow-sm"
                          title="Decrease Stock"
                        >
                          -
                        </button>
                        <span className="text-lg font-extrabold text-[#1A1A1A]">{stockVal}</span>
                        <button 
                          onClick={() => handleUpdateStock(prod.id, 1)}
                          className="w-10 h-10 rounded-lg bg-white border border-[#E5DCD0] text-xl font-bold text-[#8B3A1A] hover:bg-[#FFF0EB] flex items-center justify-center cursor-pointer shadow-sm"
                          title="Increase Stock"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-bold text-[#8B3A1A] font-serif">{t('seller.ordersTitle')}</h2>
              <p className="text-[#666666] text-sm">{t('seller.ordersSub')}</p>
            </div>

            {/* List of Orders */}
            <div className="flex flex-col gap-5 mt-4">
              {orders.map(order => (
                <div key={order.id} className="karigar-card bg-white p-6 border-l-[6px] border-[#E5DCD0] border border-[#E5DCD0]/40 flex flex-col md:flex-row justify-between gap-6" style={{ borderLeftColor: order.status === 'Pending' ? '#8B3A1A' : order.status === 'Shipped' ? '#D4AF37' : '#2D5A3D' }}>
                  
                  {/* Order Details */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-5 items-start">
                    <img 
                      src={order.image} 
                      alt={order.product} 
                      className="w-20 h-20 rounded-xl object-cover border border-[#E5DCD0]" 
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-[#8B3A1A]">Order #{order.id}</span>
                        <span className="text-[#666666] text-xs font-semibold">• {order.date}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          order.status === 'Pending' ? 'bg-[#FFF0EB] text-[#8B3A1A]' : 
                          order.status === 'Shipped' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-[#2D5A3D]'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-[#1A1A1A] mt-1">{order.product}</h4>
                      <p className="text-sm text-[#666666] mt-0.5">Buyer: <strong className="text-[#1A1A1A]">{order.buyer}</strong> ({order.location})</p>
                      
                      {/* Audio customer request */}
                      {order.voiceInstruction && (
                        <div className="mt-3 flex items-center gap-3 bg-[#FDF8F4] border border-[#8B3A1A]/10 p-3 rounded-xl max-w-xl">
                          <button 
                            onClick={() => playVoiceInstruction(order.id, order.voiceInstruction)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md cursor-pointer ${
                              playingAudioId === order.id ? 'bg-[#2D5A3D] text-white animate-pulse' : 'bg-[#FFF0EB] text-[#8B3A1A]'
                            }`}
                            title="Play Voice Request"
                          >
                            {playingAudioId === order.id ? <FiPause /> : <FiVolume2 className="w-5 h-5" />}
                          </button>
                          <div className="flex-1">
                            <span className="text-[11px] font-extrabold uppercase text-[#8B3A1A] tracking-wider block">🔈 {t('seller.listenRequest')}</span>
                            <p className="text-sm italic font-semibold text-[#1A1A1A] truncate max-w-sm sm:max-w-md mt-0.5">"{order.voiceInstruction}"</p>
                          </div>
                        </div>
                      )}

                      {order.tracking && (
                        <p className="text-sm font-semibold text-[#2D5A3D] mt-2 flex items-center gap-1">
                          📦 Courier Tracking: <strong className="underline">{order.tracking}</strong> (India Post)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-row md:flex-col justify-end items-end gap-3 min-w-[200px] border-t md:border-t-0 border-[#E5DCD0]/30 pt-4 md:pt-0">
                    <span className="text-2xl font-bold text-[#2D5A3D]">₹{order.price.toLocaleString('en-IN')}</span>
                    
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => handleShipOrder(order.id)}
                        className="karigar-btn-secondary px-6 py-2.5 text-sm shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <FiSend className="w-4 h-4" /> {t('seller.shipPackageBtn')}
                      </button>
                    )}

                    {order.status === 'Shipped' && (
                      <button 
                        onClick={() => handleDeliverOrder(order.id)}
                        className="karigar-btn-primary px-6 py-2.5 text-sm shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <FiCheck className="w-4 h-4" /> {t('seller.markDeliveredBtn')}
                      </button>
                    )}

                    {order.status === 'Completed' && (
                      <div className="flex items-center gap-1.5 text-[#2D5A3D] font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-[#2D5A3D]/20">
                        <FiCheck className="w-4 h-4" /> {t('seller.paidDelivered')}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EARNINGS */}
        {activeTab === 'earnings' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-bold text-[#8B3A1A] font-serif">{t('seller.earnings')}</h2>
              <p className="text-[#666666] text-sm">{t('seller.earningsSub')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Balance Box */}
              <div className="karigar-card bg-white border-l-[6px] border-l-[#2D5A3D] flex flex-col justify-between gap-6 shadow-md p-6 col-span-1 lg:col-span-1">
                <div>
                  <span className="text-xs font-bold text-[#666666] uppercase tracking-wider">{t('seller.availablePayout')}</span>
                  <h3 className="text-5xl font-extrabold text-[#2D5A3D] mt-2 font-serif">₹{earningsBalance.toLocaleString('en-IN')}</h3>
                  <p className="text-xs text-[#666666] mt-2 leading-relaxed">
                    Direct payout into your State Bank of India account ending in <strong>4321</strong>.
                  </p>
                </div>
                <button 
                  onClick={handlePayoutInitiate}
                  disabled={earningsBalance <= 0}
                  className={`w-full text-center py-4 rounded-full font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    earningsBalance > 0 
                      ? 'bg-[#2D5A3D] hover:bg-[#22452E] text-white' 
                      : 'bg-[#E2D7CB] text-[#888888] cursor-not-allowed shadow-none'
                  }`}
                >
                  <FiDollarSign /> {t('seller.withdrawBtn')}
                </button>
              </div>

              {/* Bank Details */}
              <div className="karigar-card bg-white p-6 shadow-md col-span-1 flex flex-col justify-between border border-[#E5DCD0]/40">
                <div>
                  <h4 className="text-lg font-bold text-[#8B3A1A] font-serif">{t('seller.linkedBank')}</h4>
                  <div className="h-0.5 bg-[#E5DCD0]/50 my-3"></div>
                  <div className="flex flex-col gap-2.5 mt-2 text-sm text-[#1A1A1A]">
                    <div className="flex justify-between">
                      <span className="text-[#666666] font-semibold">{t('seller.bankName')}:</span>
                      <span className="font-bold">State Bank of India</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] font-semibold">{t('seller.holderName')}:</span>
                      <span className="font-bold">{displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] font-semibold">{t('seller.accNumber')}:</span>
                      <span className="font-mono font-bold">•••• •••• 4321</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] font-semibold">{t('seller.ifscCode')}:</span>
                      <span className="font-mono font-bold">SBIN0002819</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => toast.success("Feature to edit bank account requires re-verifying password")}
                  className="w-full text-center py-2.5 border border-[#E5DCD0] rounded-xl text-xs font-bold text-[#666666] hover:bg-[#FFF0EB] transition-colors cursor-pointer"
                >
                  Change Bank Details
                </button>
              </div>

              {/* Statistics */}
              <div className="karigar-card bg-white p-6 shadow-md col-span-1 flex flex-col justify-between border border-[#E5DCD0]/40">
                <div>
                  <h4 className="text-lg font-bold text-[#8B3A1A] font-serif">{t('seller.lifetimeOverview')}</h4>
                  <div className="h-0.5 bg-[#E5DCD0]/50 my-3"></div>
                  <div className="flex flex-col gap-4 mt-4">
                    <div>
                      <span className="text-xs font-semibold text-[#666666] uppercase">Total Craft Sold</span>
                      <p className="text-2xl font-bold text-[#1A1A1A] mt-0.5">24 Items</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#666666] uppercase">Total Lifetime Sales</span>
                      <p className="text-2xl font-bold text-[#2D5A3D] mt-0.5">₹32,450</p>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#8B3A1A]/80 font-bold italic">
                  *Platform fee is flat 0% for rural artisans.
                </span>
              </div>
            </div>

            {/* Payout Logs Table */}
            <div className="karigar-card bg-white p-6 shadow-md mt-4 border border-[#E5DCD0]/40">
              <h4 className="text-xl font-bold text-[#1A1A1A] font-serif">{t('seller.withdrawHistory')}</h4>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#E5DCD0] text-[#666666]">
                      <th className="py-3 font-semibold">Transaction ID</th>
                      <th className="py-3 font-semibold">Date</th>
                      <th className="py-3 font-semibold">Details / Bank</th>
                      <th className="py-3 font-semibold">Amount</th>
                      <th className="py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalHistory.map(txn => (
                      <tr key={txn.id} className="border-b border-[#E5DCD0]/40 hover:bg-[#FDFBF9] transition-colors">
                        <td className="py-4 font-mono font-bold text-[#8B3A1A]">{txn.id}</td>
                        <td className="py-4 text-[#666666] font-semibold">{txn.date}</td>
                        <td className="py-4 font-bold text-[#1A1A1A]">Payout to {txn.bank}</td>
                        <td className="py-4 font-bold text-red-600">- ₹{txn.amount.toLocaleString('en-IN')}</td>
                        <td className="py-4">
                          <span className="bg-emerald-50 text-[#2D5A3D] text-xs font-extrabold px-2.5 py-1 rounded-full border border-[#2D5A3D]/10">
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b border-[#E5DCD0]/40">
                      <td className="py-4 font-mono font-bold text-[#8B3A1A]">SALE-1021</td>
                      <td className="py-4 text-[#666666] font-semibold">May 20, 2026</td>
                      <td className="py-4 font-bold text-[#1A1A1A]">Order #1021 Earning</td>
                      <td className="py-4 font-bold text-emerald-600">+ ₹1,400</td>
                      <td className="py-4">
                        <span className="bg-emerald-50 text-[#2D5A3D] text-xs font-extrabold px-2.5 py-1 rounded-full border border-[#2D5A3D]/10">
                          Success
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 font-mono font-bold text-[#8B3A1A]">SALE-1018</td>
                      <td className="py-4 text-[#666666] font-semibold">May 15, 2026</td>
                      <td className="py-4 font-bold text-[#1A1A1A]">Order #1018 Earning</td>
                      <td className="py-4 font-bold text-emerald-600">+ ₹2,050</td>
                      <td className="py-4">
                        <span className="bg-emerald-50 text-[#2D5A3D] text-xs font-extrabold px-2.5 py-1 rounded-full border border-[#2D5A3D]/10">
                          Success
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: SIKHO (LEARNING PORTAL) */}
        {activeTab === 'sikho' && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-bold text-[#8B3A1A] font-serif">{t('seller.sikhoTitle')}</h2>
              <p className="text-[#666666] text-sm">{t('seller.sikhoSub')}</p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Course 1 */}
              <div className="karigar-card bg-white p-5 flex flex-col justify-between gap-4 border border-[#E5DCD0]/40">
                <div 
                  onClick={() => setPlayingCourse({
                    title: 'Taking Beautiful Craft Photos',
                    desc: 'Learn how to use direct morning sunlight to make your terracotta pots glow like gold. A simple mobile phone photo guide.',
                    videoImg: '/images/earthen-sanctuary-vase.png'
                  })}
                  className="video-thumbnail-container h-52 bg-amber-50"
                >
                  <img 
                    src="/images/earthen-sanctuary-vase.png" 
                    alt="Photography Course" 
                    className="w-full h-full object-cover opacity-90 blur-[1px]"
                  />
                  <div className="video-play-btn shadow-md">
                    <FiPlay className="ml-1 text-2xl" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white font-mono text-xs px-2 py-0.5 rounded">
                    10 Mins
                  </span>
                </div>
                <div>
                  <span className="text-[#8B3A1A] font-bold text-xs uppercase tracking-wider">{t('seller.lessonPhotography')}</span>
                  <h4 className="text-xl font-bold text-[#1A1A1A] leading-snug mt-1">Taking Beautiful Craft Photos</h4>
                  <p className="text-sm text-[#666666] mt-1.5">Use sunlight and natural backdrops to attract customer orders.</p>
                </div>
              </div>

              {/* Course 2 */}
              <div className="karigar-card bg-white p-5 flex flex-col justify-between gap-4 border border-[#E5DCD0]/40">
                <div 
                  onClick={() => setPlayingCourse({
                    title: 'Packing Fragile Clay Items Safely',
                    desc: 'A step-by-step masterclass on folding newspapers, using dried straw padding, and packing clay water pitchers safely to ship across India.',
                    videoImg: '/images/terracotta-uru.png'
                  })}
                  className="video-thumbnail-container h-52 bg-amber-50"
                >
                  <img 
                    src="/images/terracotta-uru.png" 
                    alt="Packaging Course" 
                    className="w-full h-full object-cover opacity-90 blur-[1px]"
                  />
                  <div className="video-play-btn shadow-md">
                    <FiPlay className="ml-1 text-2xl" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white font-mono text-xs px-2 py-0.5 rounded">
                    8 Mins
                  </span>
                </div>
                <div>
                  <span className="text-[#8B3A1A] font-bold text-xs uppercase tracking-wider">{t('seller.lessonLogistics')}</span>
                  <h4 className="text-xl font-bold text-[#1A1A1A] leading-snug mt-1">Packing Fragile Clay Items Safely</h4>
                  <p className="text-sm text-[#666666] mt-1.5">Learn professional wood straw packing to prevent broken shipments.</p>
                </div>
              </div>

              {/* Course 3 */}
              <div className="karigar-card bg-white p-5 flex flex-col justify-between gap-4 border border-[#E5DCD0]/40">
                <div 
                  onClick={() => setPlayingCourse({
                    title: 'Understanding India Post & Shipping',
                    desc: 'Audio-guided walkthrough on filling India Post forms, creating delivery labels, and registering packages at the nearest village post office.',
                    videoImg: '/images/heritage-pitcher.png'
                  })}
                  className="video-thumbnail-container h-52 bg-amber-50"
                >
                  <img 
                    src="/images/heritage-pitcher.png" 
                    alt="Courier Course" 
                    className="w-full h-full object-cover opacity-90 blur-[1px]"
                  />
                  <div className="video-play-btn shadow-md">
                    <FiPlay className="ml-1 text-2xl" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white font-mono text-xs px-2 py-0.5 rounded">
                    5 Mins • Audio
                  </span>
                </div>
                <div>
                  <span className="text-[#8B3A1A] font-bold text-xs uppercase tracking-wider">{t('seller.lessonCourier')}</span>
                  <h4 className="text-xl font-bold text-[#1A1A1A] leading-snug mt-1">Understanding India Post & Shipping</h4>
                  <p className="text-sm text-[#666666] mt-1.5">How to send packages directly to city buyers from your village post office.</p>
                </div>
              </div>

              {/* Course 4 */}
              <div className="karigar-card bg-white p-5 flex flex-col justify-between gap-4 border border-[#E5DCD0]/40">
                <div 
                  onClick={() => setPlayingCourse({
                    title: 'Fair Pricing & Material Costs',
                    desc: 'Learn how to calculate clay soil costs, fuel for pit firing, design hours, and platform value to set profitable craft prices.',
                    videoImg: '/images/jaipur-blue-platter.png'
                  })}
                  className="video-thumbnail-container h-52 bg-amber-50"
                >
                  <img 
                    src="/images/jaipur-blue-platter.png" 
                    alt="Pricing Course" 
                    className="w-full h-full object-cover opacity-90 blur-[1px]"
                  />
                  <div className="video-play-btn shadow-md">
                    <FiPlay className="ml-1 text-2xl" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white font-mono text-xs px-2 py-0.5 rounded">
                    12 Mins
                  </span>
                </div>
                <div>
                  <span className="text-[#8B3A1A] font-bold text-xs uppercase tracking-wider">{t('seller.lessonBusiness')}</span>
                  <h4 className="text-xl font-bold text-[#1A1A1A] leading-snug mt-1">Fair Pricing & Material Costs</h4>
                  <p className="text-sm text-[#666666] mt-1.5">Calculate costs and hours of handcraft work to ensure steady household profit.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM TAB BAR (TOUCH CONVENIENT) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FDF8F4] border-t border-[#E5DCD0]/60 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="max-w-[768px] mx-auto flex justify-between items-center py-2.5 px-6">
          
          {/* Tab: Overview */}
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'text-[#8B3A1A]' : 'text-[#666666] hover:text-[#8B3A1A]'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span>{t('seller.overview')}</span>
          </button>

          {/* Tab: Bazaar */}
          <button 
            onClick={() => setActiveTab('bazaar')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 text-xs font-bold transition-all ${
              activeTab === 'bazaar' ? 'text-[#8B3A1A]' : 'text-[#666666] hover:text-[#8B3A1A]'
            }`}
          >
            <span className="text-lg">🏪</span>
            <span>{t('seller.bazaar')}</span>
          </button>

          {/* Tab: Orders */}
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'text-[#8B3A1A]' : 'text-[#666666] hover:text-[#8B3A1A]'
            }`}
          >
            <span className="text-lg">🛍️</span>
            <span>{t('seller.orders')}</span>
          </button>

          {/* Tab: Earnings */}
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 text-xs font-bold transition-all ${
              activeTab === 'earnings' ? 'text-[#8B3A1A]' : 'text-[#666666] hover:text-[#8B3A1A]'
            }`}
          >
            <span className="text-lg">💰</span>
            <span>{t('seller.earnings')}</span>
          </button>

          {/* Tab: Sikho */}
          <button 
            onClick={() => setActiveTab('sikho')}
            className={`flex flex-col items-center gap-1 flex-1 py-1 text-xs font-bold transition-all ${
              activeTab === 'sikho' ? 'text-[#8B3A1A]' : 'text-[#666666] hover:text-[#8B3A1A]'
            }`}
          >
            <span className="text-lg">📖</span>
            <span>{t('seller.sikho')}</span>
          </button>

          {/* Tab: Saheli Chat / Redirects */}
          <Link 
            to="/artisans"
            className="flex flex-col items-center gap-1 flex-1 py-1 text-xs font-bold transition-all text-[#666666] hover:text-[#8B3A1A]"
          >
            <span className="text-lg">💬</span>
            <span>{t('seller.sisters')}</span>
          </Link>

        </div>
      </div>

      {/* MODAL: ADD PRODUCT FORM */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F5EDE3] border-2 border-[#E5DCD0] rounded-[24px] p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full border border-[#E5DCD0] bg-white flex items-center justify-center text-[#8B3A1A] hover:bg-[#FFF0EB] cursor-pointer shadow-sm"
              title="Close Modal"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#8B3A1A] mb-1">{t('seller.listNewCraft')}</h3>
            <p className="text-[#666666] text-sm mb-6">{t('seller.instantShow')}</p>

            <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-5">
              
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#8B3A1A]">{t('seller.craftName')}</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Clay Storage Matka"
                  className="karigar-input"
                  required
                />
              </div>

              {/* Row: Category & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#8B3A1A]">{t('seller.categoryLabel')}</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="karigar-input"
                  >
                    <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                    <option value="Hand-loom Textiles">Hand-loom Textiles</option>
                    <option value="Wooden Carvings">Wooden Carvings</option>
                    <option value="Metalwork (Dhokra)">Metalwork (Dhokra)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#8B3A1A]">{t('seller.priceLabel')}</label>
                  <input 
                    type="number" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. 1850"
                    className="karigar-input"
                    required
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#8B3A1A]">{t('seller.stockLabel')}</label>
                <input 
                  type="number" 
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="e.g. 10"
                  className="karigar-input"
                  required
                />
              </div>

              {/* Description & Voice Record */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#8B3A1A]">{t('seller.descriptionLabel')}</label>
                  <button 
                    type="button"
                    onClick={simulateVoiceRecord}
                    disabled={isRecordingDesc}
                    className={`flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isRecordingDesc ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'text-[#2D5A3D] border-[#2D5A3D]/30 hover:bg-[#EBF5EE]'
                    }`}
                  >
                    <FiMic className="w-3.5 h-3.5" />
                    {isRecordingDesc ? t('seller.recordingDesc') : t('seller.voiceDescBtn')}
                  </button>
                </div>
                <textarea 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Tell customers how you made this beautiful item..."
                  className="w-full px-5 py-4 border-2 border-[#E5DCD0] rounded-2xl bg-[#FDFCFB] font-sans focus:border-[#8B3A1A] focus:outline-none h-24 text-sm"
                />
              </div>

              {/* Craft Preselected Image Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#8B3A1A]">{t('seller.selectPicLabel')}</label>
                <div className="grid grid-cols-4 gap-3">
                  {CRAFT_IMAGES.map(img => (
                    <div 
                      key={img.path}
                      onClick={() => setSelectedImage(img.path)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer border-2 h-16 ${
                        selectedImage === img.path ? 'border-[#8B3A1A] ring-2 ring-[#8B3A1A]/10' : 'border-[#E5DCD0]'
                      }`}
                    >
                      <img src={img.path} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/40 text-center py-0.5">
                        <span className="text-[9px] text-white font-extrabold truncate block">{img.name}</span>
                      </div>
                      {selectedImage === img.path && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-[#8B3A1A] rounded-full flex items-center justify-center text-white">
                          <FiCheck className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddProductModal(false)}
                  className="px-6 py-3.5 rounded-full border-2 border-[#E5DCD0] bg-white font-semibold text-[#666666] hover:bg-[#FFF0EB] cursor-pointer"
                >
                  {t('seller.cancelBtn')}
                </button>
                <button 
                  type="submit"
                  className="karigar-btn-primary px-8 py-3.5 shadow-md cursor-pointer"
                >
                  {t('seller.addCraftSubmit')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: BANK WITHDRAW TRANSFERS */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F5EDE3] border-2 border-[#E5DCD0] rounded-[24px] p-6 md:p-8 w-full max-w-md shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
            
            {withdrawStep !== 2 && (
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border border-[#E5DCD0] bg-white flex items-center justify-center text-[#8B3A1A] hover:bg-[#FFF0EB] cursor-pointer shadow-sm"
                title="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}

            {/* STEP 1: VERIFICATION SCREEN */}
            {withdrawStep === 1 && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#2D5A3D] flex items-center justify-center text-3xl shadow-inner">
                  <FiDollarSign />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#8B3A1A]">{t('seller.payoutVerify')}</h3>
                <p className="text-sm text-[#666666] max-w-xs leading-relaxed">
                  You are transferring <strong>₹{earningsBalance.toLocaleString('en-IN')}</strong> directly to State Bank of India.
                </p>

                <div className="w-full bg-white border border-[#E5DCD0] rounded-2xl p-4 text-left text-sm mt-2 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">{t('seller.holderName')}:</span>
                    <strong className="text-[#1A1A1A]">{displayName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Account Info:</span>
                    <strong className="font-mono text-[#1A1A1A]">SBI •••• 4321</strong>
                  </div>
                  <div className="flex justify-between border-t border-[#E5DCD0]/40 pt-2 mt-1">
                    <span className="text-[#666666] font-bold">Transfer Amount:</span>
                    <strong className="text-lg text-[#2D5A3D]">₹{earningsBalance.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <button 
                  onClick={handleWithdrawConfirm}
                  className="karigar-btn-secondary w-full justify-center py-4 mt-4 shadow-md cursor-pointer text-base"
                >
                  {t('seller.confirmTrans')}
                </button>
              </div>
            )}

            {/* STEP 2: SECURE LOADING TRANSFER */}
            {withdrawStep === 2 && (
              <div className="flex flex-col items-center gap-5 py-8">
                <FiLoader className="w-14 h-14 text-[#8B3A1A] animate-spin" />
                <div>
                  <h4 className="font-bold text-lg text-[#1A1A1A] leading-snug">{t('seller.connectingSbi')}</h4>
                  <p className="text-xs text-[#666666] mt-1 italic animate-pulse">State Bank of India से जुड़ रहे हैं...</p>
                </div>
                <div className="w-full max-w-[200px] h-1.5 bg-[#E2D7CB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B3A1A] rounded-full animate-[loadingBar_3s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS OVERLAY */}
            {withdrawStep === 3 && (
              <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg">
                  <FiCheck className="stroke-[3]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2D5A3D]">{t('seller.transSuccessful')}</h3>
                <p className="text-sm text-[#1A1A1A] max-w-xs leading-relaxed">
                  Money sent. Your bank will send SMS verification shortly.
                </p>
                <div className="w-full bg-[#EBF5EE] text-[#2D5A3D] text-xs font-bold p-3.5 rounded-xl border border-[#2D5A3D]/10 font-mono mt-2">
                  {t('seller.sbiRef')}: SBIN{Math.floor(1000000000 + Math.random() * 9000000000)}
                </div>

                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="karigar-btn-primary w-full justify-center py-3.5 mt-4 shadow-md cursor-pointer"
                >
                  {t('seller.doneBtn')}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: SIKHO MASTERCLASS VIDEO PLAYER */}
      {playingCourse && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] text-white border border-white/10 rounded-[24px] p-5 w-full max-w-4xl shadow-2xl relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setPlayingCourse(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer shadow-md"
              title="Close Player"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl md:text-2xl font-bold font-serif text-[#F5EDE3] leading-snug pr-12">{playingCourse.title}</h3>
            
            {/* Faux Interactive Video Screen */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              
              <img 
                src={playingCourse.videoImg} 
                alt="Video Poster" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                  lowInternetMode ? 'opacity-20 grayscale blur-[2px]' : 'opacity-60'
                }`}
              />

              {/* Low Internet Message */}
              {lowInternetMode ? (
                <div className="relative flex flex-col items-center gap-3 text-center max-w-md p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 z-20">
                  <FiVolume2 className="w-12 h-12 text-[#D4AF37] animate-bounce" />
                  <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-extrabold">{t('seller.lowInternet')}</span>
                  <p className="text-sm text-gray-200">
                    {t('seller.lowInternetSub')}
                  </p>
                </div>
              ) : (
                <div className="relative flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform z-10">
                  <div className="w-16 h-16 rounded-full bg-[#8B3A1A] text-white flex items-center justify-center text-3xl shadow-lg ring-8 ring-[#8B3A1A]/30">
                    <FiPlay className="ml-1" />
                  </div>
                  <span className="text-xs font-bold tracking-wide uppercase mt-1">Tap to Play Video</span>
                </div>
              )}

              {/* Video Timeline controls */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 flex flex-col gap-2 z-10">
                <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer relative">
                  <div className="h-full bg-[#8B3A1A] rounded-full" style={{ width: '15%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-3 h-3 bg-white border border-[#8B3A1A] rounded-full shadow-md"></div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-300">
                  <div className="flex items-center gap-4">
                    <button className="text-base text-white hover:text-[#8B3A1A] transition-colors"><FiPlay /></button>
                    <button className="text-base text-white hover:text-[#8B3A1A] transition-colors"><FiVolume2 /></button>
                    <span>01:15 / 10:00</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">HD 1080p</span>
                    <span className="bg-[#2D5A3D] text-white px-2 py-0.5 rounded text-[10px] font-bold">Auto Dialect</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Information & Dialect Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-4 rounded-xl">
              <div className="max-w-xl">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {playingCourse.desc}
                </p>
              </div>

              {/* Low internet toggle & Mark Complete button */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={lowInternetMode}
                    onChange={(e) => {
                      setLowInternetMode(e.target.checked);
                      if (e.target.checked) {
                        toast.success("Low internet audio mode activated!");
                      } else {
                        toast.success("Standard video streaming active.");
                      }
                    }}
                    className="accent-[#8B3A1A] rounded"
                  />
                  <span>Low Internet (धीमा इंटरनेट)</span>
                </label>

                <button 
                  onClick={() => {
                    toast.success("Lesson marked as completed! 10 XP points earned!");
                    setPlayingCourse(null);
                  }}
                  className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#22452E] text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {t('seller.markDone')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </SellerLayout>
  );
};

export default Dashboard;
