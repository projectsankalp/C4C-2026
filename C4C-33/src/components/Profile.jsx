import React, { useState } from 'react';
import { 
  Bell, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Lock, 
  HelpCircle, 
  ShieldCheck, 
  Trash2, 
  LogOut, 
  ChevronRight, 
  Edit2, 
  X, 
  Check, 
  Plus,
  ArrowLeft
} from 'lucide-react';

export default function Profile({ userAccount, onUpdateUser, onLogout, onBackClick }) {
  const [activeSubView, setActiveSubView] = useState(null); // null, 'orders', 'address', 'cards', 'password', 'support', 'privacy'
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Dynamic Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userAccount?.name || 'Elara Voss');
  const [editEmail, setEditEmail] = useState(userAccount?.email || 'elaravoss@gmail.com');

  // Address edit state
  const [address, setAddress] = useState({
    street: '12th Main Road, Sector 4, HSR Layout',
    city: 'Bangalore',
    state: 'Karnataka',
    zip: '560102'
  });

  // Credit Cards state
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', number: '•••• •••• •••• 4820', expiry: '08/29', holder: 'ELARA VOSS' }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: 'ELARA VOSS' });

  // Password state
  const [passwordState, setPasswordState] = useState({ current: '', new: '', confirm: '' });

  // Mock Purchase Orders
  const [orders, setOrders] = useState([
    { id: 'ORD-89312', date: 'May 25, 2026', item: 'Imperial Cobalt Ceramic Guldasta', price: '₹12,500', status: 'In Transit', craft: 'Jaipur Blue Pottery' },
    { id: 'ORD-76124', date: 'May 12, 2026', item: 'Royal Gopuram Mulberry Silk Saree', price: '₹84,000', status: 'Delivered', craft: 'Kanjivaram Silk Weaving' }
  ]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    onUpdateUser({ ...userAccount, name: editName, email: editEmail });
    setIsEditingProfile(false);
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newCard.number || !newCard.expiry) return;
    setCards([...cards, {
      id: Date.now(),
      type: newCard.number.startsWith('5') ? 'Mastercard' : 'Visa',
      number: `•••• •••• •••• ${newCard.number.slice(-4)}`,
      expiry: newCard.expiry,
      holder: newCard.holder.toUpperCase()
    }]);
    setShowAddCard(false);
    setNewCard({ number: '', expiry: '', holder: 'ELARA VOSS' });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordState.new !== passwordState.confirm) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswordState({ current: '', new: '', confirm: '' });
    setActiveSubView(null);
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans text-left pb-16 animate-fade-in">
      
      {/* Subview Rendering */}
      {activeSubView === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSubView(null)} className="p-2 rounded-full hover:bg-stone-100 border border-stone-200/80 active:scale-95 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">My Direct Orders</h3>
          </div>
          
          <div className="space-y-3.5 pt-2">
            {orders.map((order) => (
              <div key={order.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-stone-400 font-bold">{order.id}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    order.status === 'Delivered' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' 
                      : 'bg-amber-50 text-amber-700 border-amber-200/50'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">{order.item}</h4>
                  <p className="text-[9px] text-stone-400 font-bold mt-0.5">{order.craft} • {order.date}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-200/40">
                  <span className="text-[9px] text-stone-400 font-bold">You Paid Artisan:</span>
                  <span className="text-xs font-mono font-black text-stone-900">{order.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubView === 'address' && (
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSubView(null)} className="p-2 rounded-full hover:bg-stone-100 border border-stone-200/80 active:scale-95 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Shipping Address</h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert("Shipping address saved!"); setActiveSubView(null); }} className="space-y-4 pt-2">
            <div>
              <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Street Address</label>
              <input 
                required 
                type="text" 
                value={address.street} 
                onChange={(e) => setAddress({...address, street: e.target.value})}
                className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">City</label>
                <input 
                  required 
                  type="text" 
                  value={address.city} 
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
                />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">State</label>
                <input 
                  required 
                  type="text" 
                  value={address.state} 
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Postal Code</label>
              <input 
                required 
                type="text" 
                value={address.zip} 
                onChange={(e) => setAddress({...address, zip: e.target.value})}
                className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all shadow-inner" 
              />
            </div>
            <button type="submit" className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-md transition-all active:scale-98">
              Save Address
            </button>
          </form>
        </div>
      )}

      {activeSubView === 'cards' && (
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveSubView(null)} className="p-2 rounded-full hover:bg-stone-100 border border-stone-200/80 active:scale-95 shadow-sm">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">My Cards</h3>
            </div>
            <button onClick={() => setShowAddCard(!showAddCard)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full border border-stone-200 text-stone-800 transition-colors shadow-sm active:scale-90">
              {showAddCard ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAddCard ? (
            <form onSubmit={handleAddCardSubmit} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 text-left space-y-4 animate-slide-up">
              <h4 className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">Add New Card</h4>
              <div>
                <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Card Number</label>
                <input 
                  required 
                  type="text" 
                  maxLength="16"
                  placeholder="4111 2222 3333 4444"
                  value={newCard.number} 
                  onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                  className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-400 transition-all shadow-inner" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Expiry Date</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="MM/YY"
                    maxLength="5"
                    value={newCard.expiry} 
                    onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-400 transition-all shadow-inner" 
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">CVV</label>
                  <input 
                    required 
                    type="password" 
                    maxLength="3"
                    placeholder="•••"
                    className="w-full p-3 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-400 transition-all shadow-inner" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-98">
                Link New Card
              </button>
            </form>
          ) : (
            <div className="space-y-4 pt-2">
              {cards.map((card) => (
                <div key={card.id} className="relative h-44 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 text-white shadow-xl overflow-hidden flex flex-col justify-between border border-stone-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-extrabold text-stone-400">Direct Buyer Ledger Card</span>
                      <h4 className="text-base font-bold tracking-widest mt-1 font-mono">{card.number}</h4>
                    </div>
                    <span className="text-xs font-extrabold italic bg-white/10 px-2.5 py-0.5 rounded border border-white/10">{card.type}</span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[7px] uppercase tracking-wider text-stone-400 font-bold">Card Holder</span>
                      <p className="text-[11px] font-bold tracking-wide font-sans">{card.holder}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[7px] uppercase tracking-wider text-stone-400 font-bold">Expires</span>
                      <p className="text-[11px] font-mono font-bold">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubView === 'password' && (
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSubView(null)} className="p-2 rounded-full hover:bg-stone-100 border border-stone-200/80 active:scale-95 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Current Password</label>
              <input 
                required 
                type="password" 
                value={passwordState.current}
                onChange={(e) => setPasswordState({...passwordState, current: e.target.value})}
                placeholder="••••••••"
                className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all shadow-inner" 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">New Password</label>
              <input 
                required 
                type="password" 
                value={passwordState.new}
                onChange={(e) => setPasswordState({...passwordState, new: e.target.value})}
                placeholder="••••••••"
                className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all shadow-inner" 
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-stone-500 tracking-widest block mb-1">Confirm New Password</label>
              <input 
                required 
                type="password" 
                value={passwordState.confirm}
                onChange={(e) => setPasswordState({...passwordState, confirm: e.target.value})}
                placeholder="••••••••"
                className="w-full p-3.5 bg-stone-50/70 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all shadow-inner" 
              />
            </div>
            <button type="submit" className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-md transition-all active:scale-98">
              Update Password
            </button>
          </form>
        </div>
      )}

      {activeSubView === 'support' && (
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSubView(null)} className="p-2 rounded-full hover:bg-stone-100 border border-stone-200/80 active:scale-95 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Help & Support</h3>
          </div>

          <div className="space-y-4 pt-2">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <h4 className="text-xs font-bold text-stone-850">How do direct payments reach the artisans?</h4>
              <p className="text-[11px] text-stone-500 font-medium leading-relaxed mt-1">We route all funds directly to the verified UPI bank ledgers of rural artisan clusters, completely eliminating wholesale middleman cuts.</p>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <h4 className="text-xs font-bold text-stone-850">What is the blockchain provenance lookup?</h4>
              <p className="text-[11px] text-stone-500 font-medium leading-relaxed mt-1">Each mastercraft has a unique cryptographic hash registered on Ethereum. You can audit this registry in real-time under item details.</p>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <a href="mailto:support@haathse.org" className="block w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-center font-bold rounded-full text-xs uppercase tracking-widest shadow-md transition-all">
                Contact Support Team
              </a>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'privacy' && (
        <div className="bg-white rounded-3xl border border-stone-200/50 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSubView(null)} className="p-2 rounded-full hover:bg-stone-100 border border-stone-200/80 active:scale-95 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Privacy Policy</h3>
          </div>

          <div className="space-y-3.5 text-xs text-stone-600 font-medium leading-relaxed pt-2">
            <p>At **HaathSe**, we secure buyer and seller data using strict modern cryptography:</p>
            <ul className="list-disc pl-4 space-y-2">
              <li>Direct artisan bank mappings are secured inside private ledgers.</li>
              <li>Order logistics tracking registers only regional ZIP details on public blockchain trackers.</li>
              <li>We never share your transaction histories or credit cards with third-party aggregators.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Profile View matching mockup structure */}
      {!activeSubView && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-white p-4.5 rounded-3xl border border-stone-200/50 shadow-sm relative">
            <button 
              onClick={onBackClick}
              className="absolute top-4.5 left-4 p-2.5 rounded-full hover:bg-stone-50 text-stone-900 border border-stone-200 hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="title-serif text-lg font-bold text-stone-900 tracking-wide mx-auto font-sans leading-none pt-2.5">My Profile</h2>
          </div>

          {/* Profile User Header Card */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={userAccount?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"} 
                alt="Profile Avatar" 
                className="w-16 h-16 rounded-full object-cover border border-stone-200"
              />
              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-2 text-left">
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="p-1 px-2 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-stone-400"
                  />
                  <input 
                    type="email" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)} 
                    className="p-1 px-2 border border-stone-300 rounded-lg text-[10px] focus:outline-none focus:border-stone-400 block"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="p-1 bg-stone-900 text-white rounded hover:bg-stone-800"><Check className="w-3 h-3" /></button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="p-1 bg-stone-200 text-stone-800 rounded hover:bg-stone-350"><X className="w-3 h-3" /></button>
                  </div>
                </form>
              ) : (
                <div className="text-left">
                  <h3 className="font-sans font-extrabold text-stone-900 text-sm leading-none">{userAccount?.name || 'Elara Voss'}</h3>
                  <p className="text-[10px] text-stone-400 font-semibold mt-1">{userAccount?.email || 'elaravoss@gmail.com'}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="p-2.5 rounded-full bg-stone-50 border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors shadow-sm active:scale-90"
              title="Edit Profile"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Menu group 1 matching mockup */}
          <div className="bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden divide-y divide-stone-100">
            {/* Notifications toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <Bell className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">Notifications</span>
              </div>
              <button 
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  alert(`Notifications ${!notificationsEnabled ? 'Enabled' : 'Disabled'}`);
                }}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 focus:outline-none ${
                  notificationsEnabled ? 'bg-[#1C1917]' : 'bg-stone-200'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-md transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* My Orders */}
            <button 
              onClick={() => setActiveSubView('orders')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <ShoppingBag className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">My Orders</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Shipping Address */}
            <button 
              onClick={() => setActiveSubView('address')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <MapPin className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">Shipping Address</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* My Cards */}
            <button 
              onClick={() => setActiveSubView('cards')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <CreditCard className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">My Cards</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {/* Menu group 2 matching mockup */}
          <div className="bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden divide-y divide-stone-100">
            {/* Change Password */}
            <button 
              onClick={() => setActiveSubView('password')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <Lock className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Help & Support */}
            <button 
              onClick={() => setActiveSubView('support')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <HelpCircle className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Privacy Policy */}
            <button 
              onClick={() => setActiveSubView('privacy')}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <ShieldCheck className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            {/* Delete Account */}
            <button 
              onClick={() => {
                if (confirm("Are you absolutely sure you want to delete your buyer account? This action is irreversible.")) {
                  alert("Account deleted.");
                  onLogout();
                }
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-red-50/20 transition-colors focus:outline-none group/del"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100 group-hover/del:bg-red-50 group-hover/del:border-red-100">
                  <Trash2 className="w-4 h-4 text-stone-600 group-hover/del:text-red-500" />
                </div>
                <span className="text-xs font-semibold text-stone-800 group-hover/del:text-red-500">Delete Account</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover/del:text-red-400" />
            </button>

            {/* Logout */}
            <button 
              onClick={onLogout}
              className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-50 rounded-full border border-stone-100">
                  <LogOut className="w-4 h-4 text-stone-600" />
                </div>
                <span className="text-xs font-semibold text-stone-800">Logout</span>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
