import React, { useState } from 'react';
import { MapPin, Award, Users, TrendingUp } from 'lucide-react';
import { artisans } from '../data/mockData';
import { translateField } from '../utils/translator';

export default function CustomMap({ language }) {
  const [selectedCluster, setSelectedCluster] = useState(artisans[0]);

  // Visual layout coordinate offsets for our India map canvas
  const clusters = [
    {
      id: "art-1", // Jaipur
      x: "30%",
      y: "40%",
      artisan: artisans[0],
      stat: "₹1.42 Cr Sales",
      growth: "+180%"
    },
    {
      id: "art-2", // Kanchipuram
      x: "38%",
      y: "85%",
      artisan: artisans[1],
      stat: "₹1.68 Cr Sales",
      growth: "+135%"
    },
    {
      id: "art-3", // Bastar
      x: "55%",
      y: "62%",
      artisan: artisans[2],
      stat: "₹48 L Sales",
      growth: "+220%"
    },
    {
      id: "art-4", // Srinagar
      x: "28%",
      y: "12%",
      artisan: artisans[3],
      stat: "₹70 L Sales",
      growth: "+150%"
    }
  ];

  // Static Map Translations
  const translateMapKey = (key) => {
    const dict = {
      active_cluster_badge: { EN: "Active Cluster", HI: "सक्रिय क्लस्टर", TA: "செயலில் உள்ள தொகுதி" },
      interactive_ref: { EN: "Interactive Georeference", HI: "इंटरैक्टिव भू-संदर्भ", TA: "நேரடி புவிசார் குறிப்பு" },
      active_title: { EN: "Active Artisanal Craft Clusters", HI: "सक्रिय कारीगर हस्तशिल्प क्लस्टर", TA: "செயலில் உள்ள கைவினை தொகுப்புகள்" },
      weavers_lbl: { EN: "Weavers", HI: "बुनकर", TA: "நெசவாளர்கள்" },
      growth_lbl: { EN: "Growth", HI: "वृद्धि", TA: "வளர்ச்சி" },
      trace_lbl: { EN: "Traceability", HI: "ट्रेसेबिलिटी", TA: "கண்காணிப்பு" },
      master_craftsman: { EN: "Master Craftsman", HI: "मास्टर शिल्पकार", TA: "முதன்மை கைவினைஞர்" },
      exp_years: { EN: "yrs experience", HI: "वर्ष का अनुभव", TA: "வருட அனுபவம்" }
    };
    if (!dict[key]) return key;
    return dict[key][language] || dict[key]['EN'] || key;
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-ivory p-6 md:p-10 rounded-3xl border border-gold-500/10 shadow-premium">
      
      {/* Map graphic panel */}
      <div className="lg:col-span-7 bg-charcoal-900 rounded-2xl relative overflow-hidden aspect-[4/5] md:aspect-square flex items-center justify-center glow-border-dark border border-white/5 shadow-luxury">
        <div className="absolute inset-0 opacity-10 bg-grid" style={{
          backgroundImage: "radial-gradient(circle, rgba(197, 168, 128, 0.15) 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }} />
        
        <div className="absolute w-[80%] h-[85%] opacity-20 border border-gold-500/10 rounded-full filter blur-xl bg-gold-500/5 animate-pulse-subtle" />
        
        <svg viewBox="0 0 400 500" className="w-[85%] h-[85%] text-gold-500/10 absolute opacity-30 select-none pointer-events-none" fill="currentColor">
          <path d="M 120 40 Q 150 10 180 30 T 220 50 T 260 90 T 220 150 T 250 200 T 290 230 T 320 280 T 290 340 T 210 380 T 170 420 T 160 480 T 145 420 T 120 380 T 110 320 T 80 280 T 60 220 T 80 180 T 100 130 Z" />
        </svg>

        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" fill="none">
          {clusters.map((c, i) => (
            i < clusters.length - 1 && (
              <line
                key={`line-${i}`}
                x1={c.x}
                y1={c.y}
                x2={clusters[i+1].x}
                y2={clusters[i+1].y}
                stroke="#C5A880"
                strokeWidth="1"
                strokeDasharray="4 6"
                className="animate-pulse"
              />
            )
          ))}
        </svg>

        {/* Pin nodes */}
        {clusters.map((cluster) => {
          const isActive = selectedCluster.id === cluster.artisan.id;
          return (
            <button
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster.artisan)}
              style={{ left: cluster.x, top: cluster.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 focus:outline-none"
            >
              <span className={`absolute -inset-4 rounded-full border border-terracotta-500/40 ${
                isActive ? 'animate-ping opacity-75 scale-125' : 'scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700'
              }`} />
              
              <span className={`absolute -inset-2 rounded-full ${
                isActive ? 'bg-terracotta/20 animate-pulse' : 'bg-gold-500/10'
              }`} />
              
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-500 ${
                isActive 
                  ? 'bg-terracotta border-ivory scale-110 shadow-glow-terracotta' 
                  : 'bg-charcoal-900 border-gold-500/40 hover:border-terracotta hover:scale-105'
              }`}>
                <MapPin className={`w-2.5 h-2.5 ${isActive ? 'text-ivory' : 'text-gold-500'}`} />
              </div>

              <div className="absolute top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 w-28 text-center z-20">
                <div className="bg-charcoal px-2.5 py-1 rounded-md text-[9px] font-sans tracking-wider text-ivory/90 uppercase border border-white/10 shadow-premium">
                  {cluster.artisan.village}
                </div>
              </div>
            </button>
          );
        })}

        <div className="absolute bottom-6 left-6 text-left z-10">
          <p className="text-[10px] uppercase tracking-widest text-gold-500/60 font-semibold mb-1">
            {translateMapKey("interactive_ref")}
          </p>
          <p className="text-xs text-white/50">
            {translateMapKey("active_title")}
          </p>
        </div>
      </div>

      {/* Detail panel */}
      <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-8 text-left">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-terracotta font-bold px-3 py-1 rounded bg-terracotta/10 border border-terracotta/20 inline-block mb-4">
            {translateMapKey("active_cluster_badge")}
          </span>
          <h3 className="title-serif text-3xl md:text-4xl text-charcoal font-semibold mb-2">
            {selectedCluster.village}
          </h3>
          <p className="text-xs uppercase tracking-widest text-gold-600 font-semibold mb-6">
            {selectedCluster.district}, {selectedCluster.state}
          </p>

          <p className="text-xs text-charcoal-700/80 leading-relaxed font-sans font-light mb-8">
            {translateField(selectedCluster, 'about', language)}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-charcoal-50 rounded-xl border border-gold-500/10">
              <div className="flex items-center gap-1 text-gold-600 mb-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {translateMapKey("weavers_lbl")}
                </span>
              </div>
              <p className="text-lg font-bold text-charcoal tracking-tight">
                {selectedCluster.id === "art-1" ? "140+" : selectedCluster.id === "art-2" ? "410+" : selectedCluster.id === "art-3" ? "210+" : "300+"}
              </p>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-xl border border-gold-500/10">
              <div className="flex items-center gap-1 text-terracotta mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {translateMapKey("growth_lbl")}
                </span>
              </div>
              <p className="text-lg font-bold text-terracotta tracking-tight">
                +{selectedCluster.incomeIncreasePercentage}%
              </p>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-xl border border-gold-500/10">
              <div className="flex items-center gap-1 text-gold-600 mb-1.5">
                <Award className="w-3.5 h-3.5" />
                <span className="text-[9px] uppercase tracking-wider font-bold">
                  {translateMapKey("trace_lbl")}
                </span>
              </div>
              <p className="text-lg font-bold text-charcoal tracking-tight">
                {selectedCluster.sustainabilityScore}%
              </p>
            </div>
          </div>

          <div className="border-l border-gold-500/30 pl-4 py-1 italic text-xs text-charcoal-700/60 leading-relaxed font-sans font-light">
            "{translateField(selectedCluster, 'heritageHistory', language)}"
          </div>
        </div>

        {/* Master craftsman */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gold-500/10 shadow-premium">
          <div className="flex items-center gap-3">
            <img 
              src={selectedCluster.avatar} 
              alt={selectedCluster.name} 
              className="w-12 h-12 rounded-full object-cover border border-gold-500/20"
            />
            <div>
              <p className="text-xs uppercase tracking-wider text-charcoal font-semibold">{selectedCluster.name}</p>
              <p className="text-[9px] text-charcoal-700/60 font-light mt-0.5">
                {translateMapKey("master_craftsman")} • {selectedCluster.experienceYears} {translateMapKey("exp_years")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[8px] uppercase tracking-wider text-gold-600 bg-gold-100 border border-gold-500/20 px-2 py-0.5 rounded-full font-bold">
              KritiCam Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
