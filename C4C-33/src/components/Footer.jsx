import React from 'react';
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { t } from '../utils/translator';

export default function Footer({ setActiveScreen, language }) {
  // Simple footer dictionary
  const getFooterText = (key) => {
    const dict = {
      footer_desc: {
        EN: "Connecting centuries-old Indian craftsmanship with the luxury global buyer market. Powered by zero-touch voice AI and cryptographic provenance certificate auditing.",
        HI: "सदियों पुराने भारतीय शिल्प कौशल को वैश्विक लक्जरी खरीदार बाजार से जोड़ना। वॉयस एआई और क्रिप्टोग्राफिक ब्लॉकचेन प्रमाण पत्र द्वारा संचालित।",
        TA: "பல நூற்றாண்டுகள் பழமையான கைவினைத்திறனை உலகளாவிய ஆடம்பர வாங்குபவர் சந்தையுடன் இணைக்கிறது. குரல் AI மற்றும் பிளாக்செயின் சான்றளிப்பு மூலம் இயக்கப்படுகிறது."
      },
      footer_curation_title: {
        EN: "Luxury Curation Updates",
        HI: "लक्जरी संग्रह अपडेट",
        TA: "ஆடம்பர தொகுப்பு செய்திகள்"
      },
      footer_curation_desc: {
        EN: "Receive exclusive updates on newly onboarded artisan collections and custom commissioned work.",
        HI: "नवनियुक्त कारीगरों के संग्रह और कस्टम कलाकृतियों पर विशेष अपडेट प्राप्त करें।",
        TA: "புதிதாக சேர்க்கப்பட்ட கைவினைஞர்களின் தயாரிப்புகள் பற்றிய செய்திகளைப் பெறவும்."
      },
      footer_exhibitions: {
        EN: "Exhibitions",
        HI: "प्रदर्शनी",
        TA: "காட்சிகள்"
      },
      footer_clusters: {
        EN: "Active Clusters",
        HI: "सक्रिय क्लस्टर",
        TA: "செயலில் உள்ள தொகுப்புகள்"
      }
    };
    if (!dict[key]) return key;
    return dict[key][language] || dict[key]['EN'] || key;
  };

  return (
    <footer className="bg-charcoal text-ivory/80 pt-20 pb-12 border-t border-gold-500/10 text-left font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ivory flex items-center justify-center text-charcoal text-xs font-semibold">
              ह
            </div>
            <span className="title-serif text-2xl text-ivory tracking-wide font-medium">HaathSe</span>
          </div>
          <p className="text-xs text-ivory/50 leading-relaxed font-sans font-light">
            {getFooterText("footer_desc")}
          </p>
          <div className="flex gap-4">
            <span className="text-[9px] tracking-widest text-gold-500 uppercase font-semibold border border-gold-500/20 px-2.5 py-1 rounded">
              KritiCam™ Audited
            </span>
            <span className="text-[9px] tracking-widest text-terracotta-500 uppercase font-semibold border border-terracotta/20 px-2.5 py-1 rounded">
              Fair Trade
            </span>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ivory font-semibold mb-6">
            {getFooterText("footer_exhibitions")}
          </h4>
          <ul className="space-y-3.5 text-xs text-ivory/60 font-sans font-light">
            <li>
              <button onClick={() => setActiveScreen('marketplace')} className="hover:text-gold-500 transition-colors">
                {t("nav_marketplace", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveScreen('landing')} className="hover:text-gold-500 transition-colors">
                {t("nav_curation", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveScreen('whatsapp')} className="hover:text-gold-500 transition-colors">
                {t("nav_artisan_hub", language)}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveScreen('dashboard')} className="hover:text-gold-500 transition-colors">
                {t("nav_impact", language)}
              </button>
            </li>
          </ul>
        </div>

        {/* Craft Clusters */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ivory font-semibold mb-6">
            {getFooterText("footer_clusters")}
          </h4>
          <ul className="space-y-3.5 text-xs text-ivory/60 font-sans font-light">
            <li className="flex justify-between items-center">
              <span>Kot Jewar, Rajasthan</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gold-500 uppercase">Blue Pottery</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Kanchipuram, Tamil Nadu</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gold-500 uppercase">Silk Weave</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Kondagaon, Chhattisgarh</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gold-500 uppercase">Dhokra Metal</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Ganderbal, Kashmir</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gold-500 uppercase">Kani Pashmina</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ivory font-semibold mb-6">
            {getFooterText("footer_curation_title")}
          </h4>
          <p className="text-xs text-ivory/50 mb-4 font-sans font-light text-left">
            {getFooterText("footer_curation_desc")}
          </p>
          <div className="flex border-b border-ivory/20 pb-2">
            <input 
              type="email" 
              placeholder="curator@gallery.com" 
              className="bg-transparent text-xs text-ivory w-full focus:outline-none placeholder-ivory/30 font-sans font-light"
            />
            <button className="text-gold-500 hover:text-gold-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center gap-6 text-[10px] text-ivory/40 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
            KritiCam AI-Audited Listings
          </span>
          <span>•</span>
          <span>Secured on Ethereum Ledger</span>
          <span>•</span>
          <span>Zero-Middlemen Protocol</span>
        </div>

        {/* Copyright */}
        <div className="text-[10px] text-ivory/40 font-sans font-light flex items-center gap-1">
          <span>© {new Date().getFullYear()} HaathSe. Built with</span>
          <Heart className="w-3 h-3 text-terracotta fill-terracotta animate-pulse" />
          <span>for Rural Indian Artisans. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}
