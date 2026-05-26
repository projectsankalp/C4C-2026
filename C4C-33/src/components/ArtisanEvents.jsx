import React, { useState } from 'react';
import { MapPin, Calendar, Users, Award, ShieldCheck, Search, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import { artisans, products } from '../data/mockData';
import { translateField } from '../utils/translator';

export default function ArtisanEvents({ language, onProductSelect, setActiveScreen, setActiveProduct }) {
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [ticketPassBooked, setTicketPassBooked] = useState(false);

  const citiesList = ['Bangalore', 'New Delhi', 'Mumbai', 'Jaipur'];

  // Master events registry mapped to cities and categories
  const eventsData = [
    {
      id: "evt-1",
      city: "Bangalore",
      category: "Pottery",
      title: "Jaipur Blue Craft Live Show",
      venue: "Chitrakala Parishath, Bangalore",
      dates: "June 5-7",
      distance: "2.4 km",
      timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"],
      artisanId: "art-1",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
      description: "Witness the legendary master craft of Jaipur Blue pottery live. Master artisan Ram Dev Devangan will demonstrate traditional floral painting techniques on quartz-clay glaze."
    },
    {
      id: "evt-2",
      city: "Bangalore",
      category: "Pottery",
      title: "Rajasthan Heritage Craft Expo",
      venue: "Palace Grounds, Bangalore",
      dates: "June 12-15",
      distance: "5.1 km",
      timeSlots: ["12:00 PM - 2:00 PM", "4:00 PM - 6:00 PM"],
      artisanId: "art-1",
      image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80",
      description: "A state-sponsored grand exhibition highlighting clay-modeling and terracotta sculpting from remote desert clusters."
    },
    {
      id: "evt-3",
      city: "Bangalore",
      category: "Apparel",
      title: "National Silk Weaves Exhibition",
      venue: "Taj West End, Bangalore",
      dates: "June 3-5",
      distance: "1.8 km",
      timeSlots: ["10:30 AM - 12:30 PM", "2:30 PM - 4:30 PM"],
      artisanId: "art-2",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      description: "Direct-to-consumer silk weaves featuring handloom Gopurams, high-density silk borders, and certified authentic Zari weaving straight from Kanchipuram weaver families."
    },
    {
      id: "evt-4",
      city: "Bangalore",
      category: "Apparel",
      title: "Royal Heritage Handlooms Fair",
      venue: "Whitefield Club, Bangalore",
      dates: "June 18-20",
      distance: "12.0 km",
      timeSlots: ["11:00 AM - 1:00 PM", "5:00 PM - 7:00 PM"],
      artisanId: "art-2",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      description: "Experience the royal heritage textiles of Southern India. Meet master weavers and learn about organic dye processing."
    },
    {
      id: "evt-5",
      city: "Bangalore",
      category: "Wooden Art",
      title: "Sandalwood Craft Guild",
      venue: "Cauvery Emporium, MG Road, Bangalore",
      dates: "June 4",
      distance: "2.2 km",
      timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"],
      artisanId: "art-3",
      image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80",
      description: "A private guild gathering featuring intricate sandalwood miniature sculpture live carving by national awardees."
    },
    {
      id: "evt-6",
      city: "Bangalore",
      category: "Home Decor",
      title: "Tribal Art Live Workshop",
      venue: "IGNCA, Bangalore",
      dates: "June 6",
      distance: "3.5 km",
      timeSlots: ["11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM"],
      artisanId: "art-4",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
      description: "Discover Bastar Dhokra (lost-wax brass casting) and traditional tribal wall art directly from rural Chhattisgarh communities."
    },
    {
      id: "evt-7",
      city: "New Delhi",
      category: "Pottery",
      title: "Grand Blue Pottery Demonstration",
      venue: "Dilli Haat, INA, New Delhi",
      dates: "June 6-8",
      distance: "1.5 km",
      timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"],
      artisanId: "art-1",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
      description: "Jaipur master potters present active kiln firings and hand-painting exhibitions."
    },
    {
      id: "evt-8",
      city: "New Delhi",
      category: "Apparel",
      title: "Kanjivaram Silk Weaver Showcase",
      venue: "Pragati Maidan, New Delhi",
      dates: "June 4-6",
      distance: "3.1 km",
      timeSlots: ["10:30 AM - 12:30 PM", "2:30 PM - 4:30 PM"],
      artisanId: "art-2",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      description: "National awardee weaving showcase with absolute zero broker markup."
    },
    {
      id: "evt-9",
      city: "Mumbai",
      category: "Pottery",
      title: "Jaipur Traditional Pottery Live",
      venue: "Nehru Centre, Worli, Mumbai",
      dates: "June 8-10",
      distance: "2.8 km",
      timeSlots: ["11:00 AM - 1:00 PM", "3:00 PM - 5:00 PM"],
      artisanId: "art-1",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80",
      description: "Premium exhibition featuring floral turquoise patterns and decorative jars."
    },
    {
      id: "evt-10",
      city: "Jaipur",
      category: "Wooden Art",
      title: "Marwar Sandalwood & Rosewood Craft Guild",
      venue: "Albert Hall Museum Grounds, Jaipur",
      dates: "June 5",
      distance: "0.8 km",
      timeSlots: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"],
      artisanId: "art-3",
      image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=600&q=80",
      description: "Desert craft clusters showcase sandalwood carvings and heritage blocks."
    }
  ];

  // Filtering Logic
  const filteredEvents = eventsData.filter(evt => {
    const matchesCity = evt.city === selectedCity;
    const matchesCategory = activeCategory === 'All' || evt.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesCategory && matchesSearch;
  });

  const handleEventClick = (evt) => {
    setShowTicketModal(evt);
    setSelectedTimeSlot(evt.timeSlots[0]);
    setTicketPassBooked(false);
  };

  const handleArtisanRedirect = (artisanId) => {
    // Find a product from this artisan
    const artisanProduct = products.find(p => p.artisanId === artisanId);
    if (artisanProduct) {
      setActiveProduct(artisanProduct);
      setActiveScreen('product-detail');
      setShowTicketModal(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto text-left pb-16">
      
      {/* Top Brand Header matching layout style */}
      <div className="flex items-center justify-between bg-white p-4.5 rounded-3xl border border-stone-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1C1917] flex items-center justify-center text-white text-lg font-bold shadow-md">
            📍
          </div>
          <div>
            <h3 className="title-serif text-lg font-bold text-stone-900 leading-none">Heritage Map & Events</h3>
            <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mt-1">Exhibitions & Live Craft Melas Nearby</p>
          </div>
        </div>
        
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold text-[#854D0E] bg-amber-50 px-3 py-1 rounded-full border border-amber-200/40">
          📍 Nearby {selectedCity}
        </span>
      </div>

      {/* Dynamic Location Switcher Pills */}
      <div className="bg-white border border-stone-200/50 p-4 rounded-3xl shadow-sm space-y-2">
        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-extrabold block">Select Current Location</span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {citiesList.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border flex-shrink-0 ${
                selectedCity === city 
                  ? 'bg-stone-900 border-stone-900 text-white shadow' 
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
              }`}
            >
              📍 {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search exhibitions, craft forms, or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-12 py-3.5 bg-stone-100/60 border-none rounded-full text-xs font-semibold placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-200 transition-all shadow-inner"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-stone-700">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category circle selectors */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Pottery', 'Apparel', 'Wooden Art', 'Home Decor'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                activeCategory === cat 
                  ? 'bg-[#1C1917] text-white shadow' 
                  : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Active Map visual frame (Coherent coordinate pins for Bangalore etc) */}
      <div className="bg-charcoal-900 rounded-[2rem] p-6 text-white text-left relative overflow-hidden border border-white/5 shadow-luxury">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, rgba(197, 168, 128, 0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[8px] uppercase tracking-widest text-gold-500/70 font-extrabold">Active Georeference Map</span>
            <h4 className="title-serif text-lg font-bold text-white leading-none">Artisanal Craft Clusters in {selectedCity}</h4>
            <p className="text-[10px] text-white/50 leading-relaxed font-light mt-1">Real-time calculated distances are based on your profile address coordinates.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
              ● Live Local Connections
            </span>
          </div>
        </div>

        {/* Visual Map Grid Canvas */}
        <div className="h-28 bg-[#1e1c1a]/50 rounded-2xl border border-white/5 mt-4 relative flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" fill="none">
            <line x1="10%" y1="20%" x2="40%" y2="80%" stroke="#C5A880" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="40%" y1="80%" x2="80%" y2="40%" stroke="#C5A880" strokeWidth="1" strokeDasharray="4 6" />
          </svg>
          
          {/* Coordinates Pin representation */}
          <div className="absolute top-[35%] left-[25%] flex flex-col items-center gap-1 animate-pulse">
            <div className="w-3.5 h-3.5 bg-emerald-500 border border-white rounded-full flex items-center justify-center shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </div>
            <span className="text-[7px] text-white font-bold bg-[#1C1917] px-1 py-0.5 rounded border border-white/10 uppercase tracking-widest leading-none">YOUR LOCATION</span>
          </div>

          {filteredEvents.map((evt, idx) => {
            // Distribute pins
            const lefts = ['55%', '75%', '42%', '65%'];
            const tops = ['50%', '30%', '70%', '60%'];
            return (
              <div 
                key={evt.id}
                style={{ left: lefts[idx % 4], top: tops[idx % 4] }}
                className="absolute flex flex-col items-center gap-1 group"
              >
                <div className="w-3.5 h-3.5 bg-[#854D0E] border border-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-125 transition-all">
                  <MapPin className="w-2 h-2 text-[#FEF08A]" />
                </div>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#1C1917] px-2 py-0.5 rounded text-[7.5px] border border-white/15 text-white whitespace-nowrap z-25 transition-all font-bold uppercase tracking-wider shadow">
                  {evt.distance}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Events Listings Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Upcoming Local Shows ({filteredEvents.length})</h4>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((evt) => {
              const artisan = artisans.find(a => a.id === evt.artisanId) || artisans[0];
              return (
                <div 
                  key={evt.id} 
                  className="bg-white rounded-[2rem] border border-stone-200/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group"
                >
                  <div className="aspect-[16/10] overflow-hidden relative bg-stone-50">
                    <img 
                      src={evt.image} 
                      alt={evt.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Category Label badge */}
                    <span className="absolute top-4 left-4 text-[8px] uppercase tracking-wider font-extrabold text-[#854D0E] bg-amber-100 border border-amber-300/50 px-2 py-0.5 rounded-full shadow-sm">
                      {evt.category}
                    </span>

                    {/* Distance Badge */}
                    <span className="absolute top-4 right-4 text-[8px] uppercase tracking-wider font-extrabold text-stone-900 bg-white border border-stone-200 px-2 py-0.5 rounded-full shadow-sm">
                      📍 {evt.distance} away
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <p className="text-[10px] text-white/95 font-bold flex items-center gap-1">
                        <span>📅</span> {evt.dates}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-stone-900 text-sm leading-tight group-hover:text-[#854D0E] transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-bold leading-none">
                        🏢 {evt.venue}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    {/* Artisan details box inside card */}
                    <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-stone-200/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={artisan.avatar} 
                          alt={artisan.name} 
                          className="w-7 h-7 rounded-full object-cover border border-stone-200"
                        />
                        <div className="text-left">
                          <span className="text-[7px] uppercase tracking-wider text-stone-400 font-bold block leading-none">Master Craftsman</span>
                          <p className="text-[10px] font-bold text-stone-800 leading-none mt-0.5">{artisan.name}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleArtisanRedirect(evt.artisanId)}
                        className="text-[9px] font-bold text-stone-900 hover:underline flex items-center gap-0.5 border border-stone-300 rounded-lg px-2 py-1 bg-white hover:bg-stone-50"
                      >
                        View Art →
                      </button>
                    </div>

                    {/* Claim Pass Button */}
                    <button
                      onClick={() => handleEventClick(evt)}
                      className="w-full py-3 bg-[#1C1917] hover:bg-stone-850 text-white text-[9.5px] uppercase tracking-widest font-extrabold rounded-xl transition-all active:scale-98 text-center"
                    >
                      Claim Free Entry Pass
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200/60 p-8 text-center text-stone-500">
            <span className="text-2xl block mb-2">🏺</span>
            <p className="text-xs font-semibold text-stone-600">No events found matching your filter options.</p>
            <p className="text-[10px] text-stone-400 mt-1">Try changing your location, category, or search query.</p>
          </div>
        )}
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
                    🤝 <strong className="text-stone-900">Direct Connection Guarantee:</strong> Meet the artisans directly at the exhibition venue. 100% of purchase values made at the workshop reach the weaver's bank ledger directly. Zero platform markup.
                  </div>

                  {/* Booking Action */}
                  <button
                    onClick={() => setTicketPassBooked(true)}
                    className="w-full py-3 bg-[#1C1917] hover:bg-stone-855 text-white text-[10px] uppercase tracking-widest font-extrabold rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
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
                        <p className="text-[9px] font-bold text-[#854D0E] bg-amber-50 px-1.5 py-0.5 rounded uppercase">{showTicketModal.category}</p>
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
    </div>
  );
}
