import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, CheckCircle2, Sparkles, MapPin, ArrowRight, Zap, Play, Pause, Volume2 } from 'lucide-react';
import { artisans } from '../data/mockData';
import { t, translateField, speakText } from '../utils/translator';
import { subscribeToProducts, mapBackendProductToUI } from '../services/kriticamApi';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Marketplace({ onProductSelect, onBackClick, language, lowBandwidth, products }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState('authenticity'); // 'price-asc', 'price-desc', 'authenticity'
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  // Live items streamed in via Supabase Realtime during this session
  const [liveItems, setLiveItems] = useState([]);

  // ── Supabase Realtime subscription ──────────────────────────────────────
  // When FastAPI pipeline publishes a new product to Supabase, this fires
  // instantly and prepends it to the marketplace — zero reload needed.
  useEffect(() => {
    const unsubscribe = subscribeToProducts((newProduct) => {
      const uiProduct = mapBackendProductToUI(newProduct);
      setLiveItems(prev => [uiProduct, ...prev]);
    });
    return unsubscribe;
  }, []);

  const categories = ['All', 'Pottery', 'Apparel', 'Wooden Art', 'Home Decor', 'Paintings'];
  const states = ['All', 'Rajasthan', 'Tamil Nadu', 'Chhattisgarh', 'Jammu & Kashmir', 'Karnataka'];

  // Handle play voice snippet from card
  const handlePlayVoice = (e, prod) => {
    e.stopPropagation(); // Prevent card click
    
    if (playingVoiceId === prod.id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    const artisan = artisans.find(a => a.id === prod.artisanId);
    if (!artisan) return;

    // Detect artisan dialect language
    const artisanLang = 
      prod.id === "prod-1" ? "HI" : 
      prod.id === "prod-2" ? "TA" : 
      prod.id === "prod-3" ? "HI" : 
      prod.id === "prod-5" ? "KN" : "EN";
    const voiceText = translateField(artisan, 'voiceTranscript', artisanLang);

    setPlayingVoiceId(prod.id);
    speakText(
      voiceText,
      artisanLang,
      () => setPlayingVoiceId(prod.id),
      () => setPlayingVoiceId(null)
    );
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const artisan = artisans.find((a) => a.id === prod.artisanId);
        
        // Search Filter (checks multi-language fields)
        const matchesSearch = 
          translateField(prod, 'name', language).toLowerCase().includes(searchQuery.toLowerCase()) ||
          translateField(prod, 'craft', language).toLowerCase().includes(searchQuery.toLowerCase()) ||
          artisan?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artisan?.village.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category Filter
        const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;

        // State Filter
        const matchesState = selectedState === 'All' || artisan?.state === selectedState;

        return matchesSearch && matchesCategory && matchesState;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceINR - b.priceINR;
        if (sortBy === 'price-desc') return b.priceINR - a.priceINR;
        if (sortBy === 'authenticity') return b.kritiCamScore - a.kritiCamScore;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedState, sortBy, language]);

  return (
    <div className="w-full space-y-6 font-sans text-left max-w-3xl mx-auto pb-16">
      
      {/* Mobile Top Bar Search Header matching Screen 2 */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={onBackClick}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
          title="Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        
        {/* Search input with scan icon */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search crafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs focus:outline-none focus:border-blue-500 placeholder-slate-400 font-medium transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {/* Scan icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h3m-3 0H9m12 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </span>
        </div>
      </div>

      {/* Subtitle count matching Screen 2 */}
      <div className="px-1 text-left">
        <p className="text-[11px] text-slate-500 font-medium">
          <span className="font-bold text-slate-800">{filteredProducts.length} products</span> found in Heritage Catalog
        </p>
      </div>

      {/* Filter pills horizontal row matching Screen 2 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
        <button className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-semibold text-stone-700 flex items-center gap-1.5 focus:outline-none flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        {/* Selected Category Pill */}
        <button 
          onClick={() => setSelectedCategory(selectedCategory === 'All' ? 'Home Decor' : 'All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 focus:outline-none flex-shrink-0 transition-colors ${
            selectedCategory !== 'All' 
              ? 'bg-[#1C1917] text-white' 
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span>Category: {selectedCategory}</span>
          {selectedCategory !== 'All' && <span className="text-[10px]">✕</span>}
        </button>

        {/* Selected State Pill */}
        <button 
          onClick={() => setSelectedState(selectedState === 'All' ? 'Rajasthan' : 'All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 focus:outline-none flex-shrink-0 transition-colors ${
            selectedState !== 'All' 
              ? 'bg-[#1C1917] text-white' 
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <span>Region: {selectedState}</span>
          {selectedState !== 'All' && <span className="text-[10px]">✕</span>}
        </button>

        {/* Sort Pill */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 bg-white border border-stone-200 rounded-full text-xs font-semibold text-stone-600 focus:outline-none flex-shrink-0 cursor-pointer"
        >
          <option value="authenticity">★ KritiCam Audit</option>
          <option value="price-asc">₹ Price: Low to High</option>
          <option value="price-desc">₹ Price: High to Low</option>
        </select>
      </div>

      {/* 2-Column or 3-Column Responsive Product Grid matching Screen 2 */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => {
            const artisan = artisans.find((a) => a.id === prod.artisanId);
            
            return (
              <div
                key={prod.id}
                onClick={() => onProductSelect(prod)}
                className="group cursor-pointer bg-white rounded-3xl border border-stone-200/50 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between relative"
              >
                {/* Floating AI Scan Score Badge */}
                <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
                  <span className="flex items-center gap-0.5 bg-[#1C1917] text-white text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded-lg shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                    {prod.kritiCamScore}% AI
                  </span>
                </div>

                {/* Floating Heart / Fav Badge */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 text-red-500 hover:text-red-600 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>

                {/* Product Image */}
                <div className="aspect-[4/3] bg-stone-50 overflow-hidden relative border-b border-stone-100">
                  {lowBandwidth ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <p className="font-bold text-xs text-stone-800 truncate">{translateField(prod, 'name', language)}</p>
                    </div>
                  ) : (
                    <img 
                      src={prod.image} 
                      alt={translateField(prod, 'name', language)} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>

                {/* Info Text Area */}
                <div className="p-3 text-left space-y-1.5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="text-xs font-bold text-stone-850 truncate">
                      {translateField(prod, 'name', language)}
                    </h4>
                    <p className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">
                      {translateField(prod, 'craft', language)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-stone-50">
                    <div>
                      <p className="text-xs font-bold text-stone-900 font-mono">₹{prod.priceINR.toLocaleString()}</p>
                      <p className="text-[8px] text-stone-450 line-through">₹{Math.round(prod.priceINR * 1.2).toLocaleString()}</p>
                    </div>
                    {/* Add to Cart small black circle button matching mockups */}
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center group-hover:bg-[#1C1917] group-hover:text-white transition-colors duration-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">No products match your criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedState('All');
            }}
            className="px-5 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-800 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
