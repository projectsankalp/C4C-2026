import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Award, ShieldCheck, MapPin, Truck, Trees, Heart, Landmark, Check, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { artisans } from '../data/mockData';
import { t, translateField, speakText } from '../utils/translator';

export default function ProductDetail({ product, onBackClick, language, lowBandwidth, onAddToCart, wishlist, onToggleWishlist }) {
  const artisan = artisans.find(a => a.id === product.artisanId) || artisans[0];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isNarratingStory, setIsNarratingStory] = useState(false);
  const [isVerifyingCert, setIsVerifyingCert] = useState(false);
  const [certVerified, setCertVerified] = useState(false);
  const [verificationLogs, setVerificationLogs] = useState([]);
  const [certStep, setCertStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedUserLocation, setSelectedUserLocation] = useState('Bangalore');
  const [showTicketModal, setShowTicketModal] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [ticketPassBooked, setTicketPassBooked] = useState(false);

  const localExhibitionsData = {
    Bangalore: {
      pot: [
        { title: "Jaipur Blue Craft Live Show", venue: "Chitrakala Parishath, Bangalore", dates: "June 5-7", distance: "2.4 km", timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Rajasthan Heritage Craft Expo", venue: "Palace Grounds, Bangalore", dates: "June 12-15", distance: "5.1 km", timeSlots: ["12:00 PM - 2:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      app: [
        { title: "National Silk Weaves Exhibition", venue: "Taj West End, Bangalore", dates: "June 3-5", distance: "1.8 km", timeSlots: ["10:30 AM - 12:30 PM", "2:30 PM - 4:30 PM"] },
        { title: "Royal Heritage Handlooms Fair", venue: "Whitefield Club, Bangalore", dates: "June 18-20", distance: "12.0 km", timeSlots: ["11:00 AM - 1:00 PM", "5:00 PM - 7:00 PM"] }
      ],
      wood: [
        { title: "Sandalwood Craft Guild", venue: "Cauvery Emporium, MG Road, Bangalore", dates: "June 4", distance: "2.2 km", timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Shivamogga Carvers Collective", venue: "Lalbagh Exhibition Hall, Bangalore", dates: "June 14-16", distance: "4.0 km", timeSlots: ["1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      home: [
        { title: "Tribal Art Live Workshop", venue: "IGNCA, Bangalore", dates: "June 6", distance: "3.5 km", timeSlots: ["11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM"] },
        { title: "Dhokra & Terracotta Mela", venue: "HSR Layout Grounds, Bangalore", dates: "June 22-25", distance: "8.2 km", timeSlots: ["12:00 PM - 2:00 PM", "5:00 PM - 7:00 PM"] }
      ]
    },
    'New Delhi': {
      pot: [
        { title: "Grand Blue Pottery Demonstration", venue: "Dilli Haat, INA, New Delhi", dates: "June 6-8", distance: "1.5 km", timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Surajkund Crafts Heritage Mela", venue: "Surajkund Mela Grounds, Delhi NCR", dates: "June 15-22", distance: "14.5 km", timeSlots: ["12:00 PM - 2:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      app: [
        { title: "Kanjivaram Silk Weaver Showcase", venue: "Pragati Maidan, New Delhi", dates: "June 4-6", distance: "3.1 km", timeSlots: ["10:30 AM - 12:30 PM", "2:30 PM - 4:30 PM"] },
        { title: "North-East Handloom Expo", venue: "Crafts Museum, Pragati Maidan", dates: "June 19-21", distance: "3.5 km", timeSlots: ["11:00 AM - 1:00 PM", "5:00 PM - 7:00 PM"] }
      ],
      wood: [
        { title: "Saharanpur Woodcraft Live", venue: "Dilli Haat, Pitampura, New Delhi", dates: "June 7", distance: "9.2 km", timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Himalayan Woodcarvers Mela", venue: "Gandhi Darshan, Rajghat", dates: "June 16-18", distance: "4.8 km", timeSlots: ["1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      home: [
        { title: "Bastar Tribal Art Conclave", venue: "IGNCA, Janpath, New Delhi", dates: "June 8", distance: "1.2 km", timeSlots: ["11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM"] },
        { title: "Terracotta & Dhokra Craft Fair", venue: "Noida Stadium Grounds", dates: "June 25-28", distance: "16.0 km", timeSlots: ["12:00 PM - 2:00 PM", "5:00 PM - 7:00 PM"] }
      ]
    },
    Mumbai: {
      pot: [
        { title: "Jaipur Traditional Pottery Live", venue: "Nehru Centre, Worli, Mumbai", dates: "June 8-10", distance: "2.8 km", timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Western India Terracotta Expo", venue: "Nesco Exhibition Centre, Goregaon", dates: "June 18-20", distance: "9.5 km", timeSlots: ["12:00 PM - 2:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      app: [
        { title: "Mulberry & Zari Silk Exhibition", venue: "Taj Mahal Palace, Colaba, Mumbai", dates: "June 5-7", distance: "1.2 km", timeSlots: ["10:30 AM - 12:30 PM", "2:30 PM - 4:30 PM"] },
        { title: "Mumbai Handloom Weavers Conclave", venue: "SNDT Grounds, Juhu", dates: "June 20-22", distance: "8.4 km", timeSlots: ["11:00 AM - 1:00 PM", "5:00 PM - 7:00 PM"] }
      ],
      wood: [
        { title: "Deccan Sandalwood & Teak Fair", venue: "Jehangir Art Gallery, Kala Ghoda", dates: "June 6", distance: "0.5 km", timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Shivamogga Wood Carving Live", venue: "Coomaraswamy Hall, Fort", dates: "June 17-19", distance: "0.8 km", timeSlots: ["1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      home: [
        { title: "Indigenous Crafts Workshop", venue: "IIT Bombay Heritage Center, Powai", dates: "June 10", distance: "15.2 km", timeSlots: ["11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM"] },
        { title: "Metropolitan Tribal Art Fest", venue: "CIDCO Exhibition Centre, Vashi", dates: "June 27-30", distance: "22.5 km", timeSlots: ["12:00 PM - 2:00 PM", "5:00 PM - 7:00 PM"] }
      ]
    },
    Jaipur: {
      pot: [
        { title: "Clay Masters & Jaipur Blue Craft Expo", venue: "Jawahar Kala Kendra, Jaipur", dates: "June 4-6", distance: "1.1 km", timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Shekhawati Pottery & Terracotta Mela", venue: "Shilpgram, Jaipur", dates: "June 12-14", distance: "2.4 km", timeSlots: ["12:00 PM - 2:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      app: [
        { title: "Royal Rajputana Silk & Bandhani Weaves", venue: "Rambagh Palace, Jaipur", dates: "June 3-5", distance: "2.0 km", timeSlots: ["10:30 AM - 12:30 PM", "2:30 PM - 4:30 PM"] },
        { title: "Pink City Blockprint & Handloom Fair", venue: "Rajasthan Haat, Jaipur", dates: "June 16-18", distance: "3.5 km", timeSlots: ["11:00 AM - 1:00 PM", "5:00 PM - 7:00 PM"] }
      ],
      wood: [
        { title: "Marwar Sandalwood & Rosewood Craft Guild", venue: "Albert Hall Museum Grounds, Jaipur", dates: "June 5", distance: "0.8 km", timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"] },
        { title: "Desert Carvers Wood Art Exhibition", venue: "Urban Haat, Jaipur", dates: "June 13-15", distance: "3.6 km", timeSlots: ["1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"] }
      ],
      home: [
        { title: "Rajasthan Tribal & Folk Art Workshop", venue: "Jawahar Kala Kendra, Jaipur", dates: "June 7", distance: "1.1 km", timeSlots: ["11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM"] },
        { title: "Heritage Dhokra & Glasswork Mela", venue: "Jaipur Exhibition & Convention Centre", dates: "June 24-27", distance: "12.2 km", timeSlots: ["12:00 PM - 2:00 PM", "5:00 PM - 7:00 PM"] }
      ]
    }
  };

  const getCraftCategoryKey = () => {
    if (product.id.includes('pot')) return 'pot';
    if (product.id.includes('app')) return 'app';
    if (product.id.includes('wood')) return 'wood';
    if (product.id.includes('home')) return 'home';
    return null;
  };

  const activeCategoryKey = getCraftCategoryKey();
  const currentCityEvents = (activeCategoryKey && localExhibitionsData[selectedUserLocation]) 
    ? localExhibitionsData[selectedUserLocation][activeCategoryKey] 
    : [];

  // Auto-stop any voice playbacks when navigating away or product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setQuantity(1);
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setIsNarratingStory(false);
    setCertVerified(false);
    setShowTicketModal(null);
    setTicketPassBooked(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [product]);

  // Listen to original artisan dialect audio note
  const toggleDialectAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    
    setIsNarratingStory(false);
    setIsPlayingAudio(true);
    
    // Play the product-specific voice note transcript in the user's active language!
    const voiceText = translateField(product, 'voiceTranscript', language) || translateField(product, 'voiceTranscript', 'EN');

    speakText(
      voiceText, 
      language, 
      () => setIsPlayingAudio(true), 
      () => setIsPlayingAudio(false)
    );
  };

  // Narrate translated English/Hindi catalog narrative
  const toggleStoryNarration = () => {
    if (isNarratingStory) {
      window.speechSynthesis.cancel();
      setIsNarratingStory(false);
      return;
    }

    setIsPlayingAudio(false);
    setIsNarratingStory(true);
    
    const storyText = translateField(product, 'story', language);
    speakText(
      storyText,
      language,
      () => setIsNarratingStory(true),
      () => setIsNarratingStory(false)
    );
  };

  const handleVerifyCert = () => {
    if (certVerified) return;
    setIsVerifyingCert(true);
    setVerificationLogs([]);
    setCertStep(0);
  };

  // Simulated Ethereum ledger lookup sequence
  useEffect(() => {
    let timer;
    if (isVerifyingCert) {
      const logs = [
        "Connecting to Ethereum Mainnet Node...",
        `Resolving registry contract 0x47e1...78f579...`,
        `Downloading listing payload for ${product.id} (SHA-256)...`,
        `Validating scan integrity parameters (${product.kritiCamScore}% match)...`,
        `Verifying signature from master private key...`,
        "Registry Match CONFIRMED. Provenance certificate sealed!"
      ];
      
      const runStep = (step) => {
        if (step < logs.length) {
          setCertStep(step);
          setVerificationLogs(prev => [...prev, logs[step]]);
          timer = setTimeout(() => runStep(step + 1), 500);
        } else {
          setIsVerifyingCert(false);
          setCertVerified(true);
        }
      };
      
      runStep(0);
    }
    return () => clearTimeout(timer);
  }, [isVerifyingCert]);

  // Spec & Accordion states
  const [activeAccordion, setActiveAccordion] = useState('specs'); // 'specs', 'provenance', 'wages'

  return (
    <div className="w-full font-sans text-left max-w-md mx-auto pb-12 animate-fade-in relative">
      
      {/* TOP HEADER SECTION WITH SOLID CHARCOAL BACKDROP MATCHING SCREEN 1 */}
      <div className="bg-[#1C1917] rounded-b-[2.5rem] p-6 pb-24 text-white relative overflow-hidden shadow-lg">
        {/* Subtle decorative background wave */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,50 C30,80 70,20 100,50 L100,100 L0,100 Z" fill="currentColor"></path></svg>
        </div>

        {/* Minimal Header Actions */}
        <div className="flex items-center justify-between z-10 relative">
          <button 
            onClick={onBackClick}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white active:scale-95 shadow"
            title="Back to Catalog"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-stone-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            🏺 {translateField(product, 'craft', language)}
          </span>

          <button className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 shadow">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          </button>
        </div>

        {/* Product Details info (Title, Star Rating, Specs) */}
        <div className="mt-8 space-y-4 text-left z-10 relative pr-[42%]">
          <h2 className="title-serif text-2xl font-bold tracking-wide leading-tight text-white drop-shadow-sm">
            {translateField(product, 'name', language)}
          </h2>

          <div className="flex items-center gap-1.5 text-stone-300">
            <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span className="text-xs font-bold text-white">4.9</span>
            <span className="text-[10px] text-stone-400">({product.kritiCamScore}% Match)</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-white/10 text-xs font-medium text-stone-300">
            <p className="flex items-center gap-1"><span className="text-stone-400 font-bold">Origin:</span> <span className="truncate max-w-[120px]">{artisan.village}</span></p>
            <p className="flex items-center gap-1"><span className="text-stone-400 font-bold">Weight:</span> <span>{product.weight}</span></p>
            <p className="flex items-center gap-1"><span className="text-stone-400 font-bold">Size:</span> <span>{product.dimensions}</span></p>
          </div>
        </div>

        {/* FLOATING IMAGE ON THE RIGHT OVERLAPPING THE BOTTOM BORDER */}
        <div className="absolute right-4 bottom-[-16px] w-[42%] aspect-[3/4] bg-stone-100 rounded-3xl overflow-hidden shadow-2xl border border-stone-800/10 z-20 group">
          <img 
            src={product.images && product.images.length > 0 ? product.images[currentImageIndex] : product.image} 
            alt={translateField(product, 'name', language)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
              {product.images.slice(0, 3).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-1 h-1 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-2' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM WARM CREAM SHEET CONTAINING THE CONTENT */}
      <div className="bg-[#FAF8F5] -mt-8 rounded-t-[2.5rem] p-6 pt-12 space-y-6 relative z-10 border-t border-stone-200/40">
        
        {/* Heart icon overlapping the border on the left */}
        <button 
          onClick={() => onToggleWishlist(product)}
          className={`absolute top-[-22px] left-8 w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-[#FAF8F5] ${
            wishlist && wishlist.some(p => p.id === product.id) ? 'bg-red-500 text-white' : 'bg-[#1C1917] text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlist && wishlist.some(p => p.id === product.id) ? 'fill-current' : ''}`} />
        </button>

        {/* Description Section */}
        <div className="space-y-2 text-left">
          <h3 className="text-xs uppercase tracking-widest font-extrabold text-stone-400">Description</h3>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            {translateField(product, 'story', language)}
          </p>
        </div>

        {/* Quantity Select Block */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-stone-200/60 shadow-sm text-left">
          <div>
            <h4 className="text-xs font-bold text-stone-800">Quantity</h4>
            <p className="text-[10px] text-stone-400 font-medium">Add multiple items</p>
          </div>

          <div className="flex items-center gap-3.5 border border-stone-200/60 rounded-full px-3 py-1 bg-stone-50">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-stone-500 hover:bg-stone-200 active:scale-90 transition-all text-xs"
            >
              -
            </button>
            <span className="text-xs font-bold text-stone-900 font-mono w-4 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-stone-500 hover:bg-stone-200 active:scale-90 transition-all text-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Highly Interactive Voice Note Story Player */}
        <div className="bg-white border border-stone-200/60 p-4.5 rounded-3xl shadow-sm space-y-3.5">
          <div className="flex items-center gap-3">
            <img src={artisan.avatar} alt={artisan.name} className="w-10 h-10 rounded-full object-cover border border-stone-200/40" />
            <div className="text-left">
              <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">Village Owner Dialect Voice</span>
              <h4 className="font-bold text-stone-800 text-xs leading-none mt-0.5">{artisan.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60 shadow-inner">
            <button
              onClick={toggleDialectAudio}
              className={`p-2.5 rounded-full transition-all duration-300 text-white shadow active:scale-95 ${isPlayingAudio ? 'bg-red-500' : 'bg-stone-900 hover:bg-stone-800'}`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Simulated wave */}
            <div className="flex-1 flex items-end gap-0.5 h-6 px-1 overflow-hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => (
                <div 
                  key={bar} 
                  className={`w-1 rounded-t bg-stone-700 transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : 'opacity-30'}`}
                  style={{ 
                    height: isPlayingAudio ? `${30 + Math.sin(bar * 0.5) * 50}%` : `${15 + (bar % 3) * 6}%`,
                    maxHeight: '24px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Subtitle Transcript */}
          <div className="bg-stone-50 p-3 rounded-2xl text-left border border-stone-100">
            <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest leading-none mb-1">Transcript</p>
            <p className="text-[11px] font-semibold text-stone-600 leading-relaxed italic">
              "{translateField(product, 'voiceTranscript', language) || translateField(product, 'voiceTranscript', 'EN')}"
            </p>
          </div>
        </div>

        {/* Near-User Local Artisan Exhibitions & Live Workshops */}
        <div className="bg-white border border-stone-200/60 p-4.5 rounded-3xl shadow-sm space-y-3.5 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest font-bold text-stone-400">Exhibitions & Live Shows</span>
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-stone-800 text-xs leading-none mt-0.5">Meet {artisan.name} Nearby</h4>
              <span className="flex items-center gap-1 text-[8px] uppercase tracking-wider font-extrabold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                📍 {selectedUserLocation}, IN
              </span>
            </div>

            {/* Premium Location Switcher Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {['Bangalore', 'New Delhi', 'Mumbai', 'Jaipur'].map((city) => (
                <button
                  key={city}
                  onClick={() => { 
                    setSelectedUserLocation(city); 
                    setTicketPassBooked(false); 
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase transition-all duration-300 border ${
                    selectedUserLocation === city 
                      ? 'bg-stone-900 border-stone-900 text-white shadow-sm scale-102' 
                      : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {currentCityEvents.length > 0 ? (
              currentCityEvents.map((evt, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200/40 text-xs space-y-2 relative overflow-hidden group hover:border-[#854D0E]/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-stone-850 tracking-tight">{evt.title}</h5>
                    <span className="text-[8px] font-bold text-[#854D0E] bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full shrink-0">
                      {evt.distance} away
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium leading-tight">
                    {evt.venue} • <span className="font-bold text-stone-700">{evt.dates}</span>
                  </p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[8px] uppercase tracking-wider text-[#854D0E] font-extrabold bg-[#FEF08A]/30 px-1.5 py-0.5 rounded">
                      🤝 Weavers Direct
                    </span>
                    <button 
                      onClick={() => {
                        setShowTicketModal(evt);
                        setSelectedTimeSlot(evt.timeSlots[0]);
                        setTicketPassBooked(false);
                      }} 
                      className="text-[9px] font-bold text-stone-900 group-hover:underline flex items-center gap-0.5 text-stone-950 font-extrabold hover:text-[#854D0E] transition-colors"
                    >
                      🎟️ Get Free Pass →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/40 text-[10px] text-stone-500 text-center py-5">
                No upcoming local exhibitions scheduled for this craft cluster in {selectedUserLocation} yet. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* HIGH-FIDELITY B2C TICKET PASS MODAL */}
        {showTicketModal && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#FAF8F5] rounded-[2.5rem] border border-[#854D0E]/20 shadow-2xl max-w-sm w-full overflow-hidden relative animate-slide-up flex flex-col">
              
              {/* Gold Top Banner */}
              <div className="bg-gradient-to-r from-[#854D0E] to-[#A16207] px-6 py-4 text-white text-left relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[8px] font-black uppercase tracking-widest text-[#FEF08A]">HaathSe Heritage Pass</span>
                <h3 className="text-sm font-bold mt-0.5 leading-tight">{showTicketModal.title}</h3>
                <p className="text-[9px] text-[#FEF08A]/80 font-medium mt-1">Direct B2C Meet & Craft Demonstration</p>
                
                <button 
                  onClick={() => setShowTicketModal(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rotate-95" />
                </button>
              </div>

              {/* Ticket Body */}
              <div className="p-6 flex-1 text-left space-y-4">
                
                {!ticketPassBooked ? (
                  <>
                    {/* Pass Holder Info */}
                    <div className="bg-white p-3.5 rounded-2xl border border-stone-200/60 shadow-sm space-y-2">
                      <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block leading-none">Pass Holder</span>
                      <div className="flex items-center gap-2">
                        <img 
                          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" 
                          alt="Holder Avatar" 
                          className="w-7 h-7 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-stone-850">Elara Voss (You)</p>
                          <p className="text-[9px] text-stone-400 font-medium">📍 Bangalore Delivery Address</p>
                        </div>
                      </div>
                    </div>

                    {/* Venue & Details */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 text-stone-400 mt-0.5 flex items-center justify-center">📍</div>
                        <div>
                          <p className="font-bold text-stone-800 text-[11px] leading-tight">Exhibition Venue</p>
                          <p className="text-stone-500 text-[10px] leading-relaxed mt-0.5">{showTicketModal.venue}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs">
                        <div className="w-4 h-4 text-stone-400 mt-0.5 flex items-center justify-center">📅</div>
                        <div>
                          <p className="font-bold text-stone-800 text-[11px] leading-tight">Exhibition Dates</p>
                          <p className="text-[#854D0E] font-bold text-[10px] mt-0.5">{showTicketModal.dates}</p>
                        </div>
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[9px] uppercase tracking-wider text-stone-400 font-extrabold block">Select Preferred Time Slot</label>
                      <div className="grid grid-cols-2 gap-2">
                        {showTicketModal.timeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2 rounded-xl text-[9px] font-bold border transition-all text-center leading-tight ${
                              selectedTimeSlot === slot 
                                ? 'bg-stone-900 border-stone-900 text-white shadow-sm' 
                                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Direct-to-Artisan Guarantee Box */}
                    <div className="bg-[#FEF08A]/10 border border-[#854D0E]/20 p-3 rounded-2xl text-[9.5px] leading-normal text-stone-700 font-medium">
                      🤝 <strong className="text-stone-900">Direct Connection Guarantee:</strong> Meet {artisan.name} directly. 100% of purchase values made at the workshop reach the weaver's bank ledger directly. Zero platform markup.
                    </div>

                    {/* Booking Action */}
                    <button
                      onClick={() => setTicketPassBooked(true)}
                      className="w-full py-3 bg-[#1C1917] hover:bg-stone-850 text-white text-[10px] uppercase tracking-widest font-extrabold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                    >
                      <span>Claim Free Pass</span>
                      <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </>
                ) : (
                  // Confirmed Screen
                  <div className="space-y-4 py-2 text-center">
                    
                    {/* Success Icon */}
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-lg shadow-sm animate-pulse-subtle">
                      ✓
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">Pass Registered Successfully!</h4>
                      <p className="text-[10px] text-stone-500 font-medium mt-1 leading-normal">
                        Your free entry voucher for <strong className="text-stone-800">{showTicketModal.title}</strong> is locked.
                      </p>
                    </div>

                    {/* Dotted Tear-Off line simulation */}
                    <div className="border-t-2 border-dashed border-stone-300 my-2 relative">
                      <div className="absolute -left-8 -top-2 w-4 h-4 bg-stone-100 rounded-full border border-stone-200" />
                      <div className="absolute -right-8 -top-2 w-4 h-4 bg-stone-100 rounded-full border border-stone-200" />
                    </div>

                    {/* Digital Receipt Card */}
                    <div className="bg-white p-4.5 rounded-2xl border border-stone-200/60 shadow-sm space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-start text-left">
                        <div>
                          <span className="text-[7px] uppercase tracking-wider text-stone-400 font-bold">Ticket Registry Code</span>
                          <p className="font-mono text-[10px] font-extrabold text-stone-800 uppercase tracking-widest">HS-{Math.floor(100000 + Math.random() * 900000)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[7px] uppercase tracking-wider text-stone-400 font-bold">Category</span>
                          <p className="text-[9px] font-bold text-[#854D0E] bg-amber-50 px-1.5 py-0.5 rounded uppercase">{activeCategoryKey}</p>
                        </div>
                      </div>

                      <div className="text-left space-y-1 bg-[#FAF8F5] p-2.5 rounded-xl border border-stone-250/30">
                        <p className="text-[10px] text-stone-700 leading-tight font-bold">{showTicketModal.title}</p>
                        <p className="text-[9px] text-stone-400 font-semibold">{showTicketModal.venue}</p>
                        <p className="text-[9px] text-stone-500 font-extrabold mt-1">Slot: {selectedTimeSlot}</p>
                      </div>

                      {/* Custom SVG Barcode representation */}
                      <div className="space-y-1">
                        <div className="h-9 w-full flex items-center justify-between px-2 bg-stone-50 border border-stone-100 rounded">
                          {[2,1,3,1,2,4,1,2,3,1,2,1,4,2,1,3,2,1,2,3,1,4,1,2,3].map((w, i) => (
                            <div 
                              key={i} 
                              className="bg-stone-900 h-6" 
                              style={{ width: `${w * 1.5}px`, opacity: i % 3 === 0 ? 0.75 : 1 }} 
                            />
                          ))}
                        </div>
                        <span className="text-[7px] font-mono tracking-widest text-stone-400 leading-none block">HAATHSE*LEDGER*ENTRY*PASS</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          alert("📲 Pass barcode & location details pushed via WhatsApp message mock!");
                        }}
                        className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20ba56] text-white text-[9.5px] uppercase tracking-wider font-extrabold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>Send to WhatsApp</span>
                      </button>
                      <button
                        onClick={() => setShowTicketModal(null)}
                        className="py-2.5 px-4 bg-stone-200 hover:bg-stone-350 text-stone-700 text-[9.5px] uppercase tracking-wider font-bold rounded-xl transition-all active:scale-95"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Minimal Accordion details */}
        <div className="space-y-2 text-xs">
          {/* Item 1: Provenance */}
          <div className="border border-stone-200/60 rounded-3xl bg-white overflow-hidden shadow-sm">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'provenance' ? null : 'provenance')}
              className="w-full p-4 flex justify-between items-center text-stone-800 font-bold hover:bg-stone-50 transition-colors"
            >
              <span>Provenance registry</span>
              <span className="text-stone-400">{activeAccordion === 'provenance' ? '▼' : '▶'}</span>
            </button>
            
            {activeAccordion === 'provenance' && (
              <div className="px-4 pb-4 space-y-3 font-mono text-[9px] text-stone-600 border-t border-stone-100 pt-3">
                <p><strong>Ledger registry:</strong> 0x47e1...78f579</p>
                <p><strong>Registry Certificate:</strong> {product.id.toUpperCase()}</p>
                <button 
                  onClick={handleVerifyCert} 
                  disabled={isVerifyingCert}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-[9px] uppercase tracking-widest shadow"
                >
                  {isVerifyingCert ? 'Auditing ledger...' : certVerified ? '✓ Verified Ledger registry' : 'Verify Ledger registry'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Purchase Bar matching Screenshot 1 */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-stone-200/60 shadow-[0_10px_25px_-5px_rgba(120,113,108,0.15)] mt-4 text-left">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block leading-none">Price</span>
            <div className="flex items-start mt-1">
              <span className="text-[10px] font-bold text-stone-600 mr-0.5 mt-0.5">₹</span>
              <span className="text-lg font-mono font-black text-stone-900 leading-none">
                {(product.priceINR * quantity).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              for (let i = 0; i < quantity; i++) {
                onAddToCart(product);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-95"
          >
            <span>Buy Now</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}
