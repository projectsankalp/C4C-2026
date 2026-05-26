import React, { useState, useEffect, useRef } from 'react';
import { Image, Mic, CheckCheck, Sparkles, Volume2, ArrowRight, Play, Pause, Loader2, Zap, Languages } from 'lucide-react';
import { artisans, products } from '../data/mockData';
import { uploadCraftImage, mapBackendProductToUI } from '../services/kriticamApi';
import { t, translateField, speakText } from '../utils/translator';

export default function WhatsAppMock({ onUploadComplete, language = 'HI', setLanguage }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      textHI: "नमस्ते! हाथसे डिजिटल असिस्टेंट में आपका स्वागत है। अपनी कलाकृति बेचने के लिए फोटो भेजें या नीचे माइक दबाकर बोलें।",
      textEN: "Namaste! Welcome to HaathSe Assistant. Upload a photo of your craft or hold the mic button to speak.",
      time: "12:30 PM"
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedProduct, setUploadedProduct] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [isLiveUploading, setIsLiveUploading] = useState(false); // Real API upload state
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const speakInstructions = () => {
    const text = language === 'HI' 
      ? "नमस्ते! अपनी कलाकृति बेचने के लिए, 'अपलोड कलाकृति फोटो' बटन दबाएं और एक सुंदर फोटो चुनें। या फिर नीचे दिए गए डेमो कलाकृतियों में से किसी एक को चुनकर प्रक्रिया का अनुभव करें।"
      : "Hello! To sell your artwork, press the 'Upload Real Craft Photo' button and select a beautiful photo. Or, select one of the demo crafts below to experience the onboarding flow.";
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'HI' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Simulated recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // Play voice transcript snippet aloud
  const handlePlayVoice = (msg) => {
    if (playingVoiceId === msg.id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }
    
    setPlayingVoiceId(msg.id);
    speakText(
      msg.transcriptRaw,
      msg.artisanLang, 
      () => setPlayingVoiceId(msg.id),
      () => setPlayingVoiceId(null)
    );
  };

  // Play text message aloud
  const handlePlayTextMsg = (msg) => {
    if (playingVoiceId === msg.id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    const textToSpeak = msg.sender === 'system'
      ? (language === 'HI' ? msg.textHI : msg.textEN) 
      : msg.text;

    setPlayingVoiceId(msg.id);
    speakText(
      textToSpeak,
      language,
      () => setPlayingVoiceId(msg.id),
      () => setPlayingVoiceId(null)
    );
  };

  // Simulate Artisan uploading selected craft preset
  const triggerSimulation = (selectedProdId) => {
    const prod = products.find(p => p.id === selectedProdId) || products[0];
    const artisan = artisans.find(a => a.id === prod.artisanId);
    setUploadedProduct(prod);

    // Cancel active playback
    window.speechSynthesis.cancel();
    setPlayingVoiceId(null);

    // 1. Artisan uploads image
    addMessage({
      id: Date.now() + 1,
      sender: "artisan",
      mediaUrl: prod.image,
      caption: `भेजा गया फोटो: ${translateField(prod, 'craft', 'HI')}`,
      captionEn: `Sent photo: ${translateField(prod, 'craft', 'EN')}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // 2. Start recording voice note after 1.2s
    setTimeout(() => {
      setIsRecording(true);
      
      setTimeout(() => {
        setIsRecording(false);
        
        // Detect artisan's default regional language
        const artisanLang = 
          prod.id === "prod-1" ? "HI" : 
          prod.id === "prod-2" ? "TA" : 
          prod.id === "prod-3" ? "HI" : 
          prod.id === "prod-5" ? "KN" : "EN";
        const voiceText = translateField(artisan, 'voiceTranscript', artisanLang);

        // Add voice note message
        addMessage({
          id: Date.now() + 2,
          sender: "artisan",
          isVoiceNote: true,
          voiceDuration: "0:05",
          transcriptRaw: voiceText,
          transcriptEn: translateField(artisan, 'voiceTranscript', 'EN'),
          artisanLang: artisanLang,
          artisanName: artisan.name,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // 3. AI responds
        setTimeout(() => {
          setIsTyping(true);
          
          setTimeout(() => {
            setIsTyping(false);
            
            const craftText = translateField(prod, 'craft', language);
            const statusText = translateField(prod, 'authenticityStatus', language);

            const aiResponseDict = {
              EN: `KritiCam AI identified your craft: ${craftText}! ✨\n\n• Artisan: ${artisan.name}\n• Location: ${artisan.village}, ${artisan.state}\n• Estimated Value: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• Integrity: ${prod.kritiCamScore}%\n• Status: ${statusText}\n\nWhisper AI translated the dialect voice note. Listing details generated. Ready to publish?`,
              HI: `KritiCam AI ने कलाकृति पहचान ली है: ${craftText}! ✨\n\n• कारीगर: ${artisan.name}\n• स्थान: ${artisan.village}, ${artisan.state}\n• अनुमानित मूल्य: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• शुद्धता: ${prod.kritiCamScore}%\n• स्थिति: ${statusText}\n\nविस्पर एआई ने आपकी बोली का अनुवाद कर दिया है। उत्पाद सूची तैयार है। क्या आप इसे प्रकाशित करना चाहते हैं?`,
              TA: `கிருடிகேம் AI உங்கள் தயாரிப்பை அடையாளம் கண்டுள்ளது: ${craftText}! ✨\n\n• கைவினைஞர்: ${artisan.name}\n• இடம்: ${artisan.village}, ${artisan.state}\n• மதிப்பு: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• நம்பகத்தன்மை: ${prod.kritiCamScore}%\n• நிலை: ${statusText}\n\nவிஸ்பர் AI உங்கள் வட்டாரப் பேச்சு மொழியை மொழிபெயர்த்துள்ளது. விவரங்கள் தயாராக உள்ளன. வெளியிடலாமா?`,
              BN: `কৃতি ক্যাম AI আপনার শিল্প সনাক্ত করেছে: ${craftText}! ✨\n\n• কারিগর: ${artisan.name}\n• স্থান: ${artisan.village}, ${artisan.state}\n• আনুমানিক মূল্য: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• শুদ্ধতা: ${prod.kritiCamScore}%\n• অবস্থা: ${statusText}\n\nহুইস্পার এআই উপভাষার ভয়েস নোট অনুবাদ করেছে। বিবরণ প্রস্তুত। প্রকাশ করতে চান?`,
              KN: `ಕೃಟಿಕಾಮ್ ಎಐ ನಿಮ್ಮ ಕಲಾಕೃತಿಯನ್ನು ಗುರುತಿಸಿದೆ: ${craftText}! ✨\n\n• ಕುಶಲಕರ್ಮಿ: ${artisan.name}\n• ಸ್ಥಳ: ${artisan.village}, ${artisan.state}\n• ಅಂದಾಜು ಮೌಲ್ಯ: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• ನಿಖರತೆ: ${prod.kritiCamScore}%\n• ಸ್ಥಿತಿ: ${statusText}\n\nವಿಸ್ಪರ್ ಎಐ ಪ್ರಾದೇಶಿಕ ಧ್ವನಿಯನ್ನು ಭಾಷಾಂತರಿಸಿದೆ. ವಿವರಗಳು ಸಿದ್ಧವಾಗಿವೆ. ಪ್ರಕಟಿಸಲು ಸಿದ್ಧವೇ?`,
              MR: `क्रिटिकॅम एआय ने तुमची कलाकृती ओळखली आहे: ${craftText}! ✨\n\n• कारागीर: ${artisan.name}\n• ठिकाण: ${artisan.village}, ${artisan.state}\n• अंदाजे किंमत: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• शुद्धता: ${prod.kritiCamScore}%\n• स्थिती: ${statusText}\n\nविस्पर एआय ने बोली भाषेचे भाषांतर केले आहे. उत्पादन सूची तयार आहे. प्रकाशित करू इच्छिता?`,
              TE: `కృతిక్యామ్ AI మీ కళను గుర్తించింది: ${craftText}! ✨\n\n• కళాకారుడు: ${artisan.name}\n• ప్రాంతం: ${artisan.village}, ${artisan.state}\n• అంచనా విలువ: ₹${prod.priceINR.toLocaleString()} ($${prod.priceUSD})\n• ఖచ్చితత్వం: ${prod.kritiCamScore}%\n• స్థితి: ${statusText}\n\nవిస్పర్ AI మీ స్థానిక సంభాషణను అనువదించింది. వివరాలు సిద్ధంగా ఉన్నాయి. ప్రచురించడానికి సిద్ధమా?`
            };

            const aiResponseText = aiResponseDict[language] || aiResponseDict['EN'];

            addMessage({
              id: Date.now() + 3,
              sender: "ai",
              text: aiResponseText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              showActionBtn: true
            });
          }, 3200);

        }, 1500);

      }, 3000);
    }, 1200);
  };

  const handlePublishClick = () => {
    // Stop synthesis playbacks
    window.speechSynthesis.cancel();
    setPlayingVoiceId(null);
    if (onUploadComplete && uploadedProduct) {
      onUploadComplete(uploadedProduct);
    }
  };

  // ─── REAL BACKEND UPLOAD ─────────────────────────────────────────────────────
  // Direct file picker connection for real-time live uploads
  const handleRealFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setIsLiveUploading(true);

    addMessage({
      id: Date.now() + 1,
      sender: "artisan",
      mediaUrl: previewUrl,
      caption: `भेजा गया फोटो: ${file.name}`,
      captionEn: `Sent photo: ${file.name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    const typingTimeout = setTimeout(() => setIsTyping(true), 800);

    try {
      // Hits GPT-4o Vision directly in FastAPI
      const result = await uploadCraftImage(file);
      const backendProduct = result.product;
      const uiProduct = mapBackendProductToUI(backendProduct);
      setUploadedProduct(uiProduct);
      setIsTyping(false);

      addMessage({
        id: Date.now() + 2,
        sender: "ai",
        text: `KritiCam AI ने कलाकृति पहचान ली है: ${backendProduct.craft_style}! ✨\n\n• शैली: ${backendProduct.craft_style}\n• क्षेत्र: ${backendProduct.heritage_region}\n• अनुमानित मूल्य: ₹${backendProduct.fair_price_inr?.toLocaleString()} ($${backendProduct.fair_price_usd})\n• शुद्धता स्कोर: ${backendProduct.craftsmanship_score}%\n\nप्रमाण-पत्र तैयार है। क्या आप इसे बाजार में प्रकाशित करना चाहते हैं?`,
        textEn: `KritiCam AI identified your craft: ${backendProduct.craft_style}! ✨\n\n• Style: ${backendProduct.craft_style}\n• Region: ${backendProduct.heritage_region}\n• Estimated Value: ₹${backendProduct.fair_price_inr?.toLocaleString()} ($${backendProduct.fair_price_usd})\n• Authenticity: ${backendProduct.craftsmanship_score}%\n\nProvenance certificate generated. Ready to publish?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showActionBtn: true,
        isRealResult: true,
      });

    } catch (err) {
      setIsTyping(false);
      addMessage({
        id: Date.now() + 3,
        sender: "ai",
        text: `Backend connection error. Running in demo mode.\n\nError: ${err.message}`,
        textEn: `Backend connection error. Running in demo mode.\n\nError: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      clearTimeout(typingTimeout);
      setIsLiveUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-ivory p-4 md:p-8 rounded-3xl border border-gold-500/10 shadow-premium">
      
      {/* Simulation Controls Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-charcoal rounded-2xl border border-white/5 text-ivory text-left relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-grid" />
        
        <div className="space-y-6 relative z-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold px-2.5 py-1 rounded bg-white/5 border border-white/10">
                ऑडियो निर्देश / Voice Guide
              </span>
              <button 
                onClick={speakInstructions}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-[10px] font-semibold text-gold-400 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                title="Hear Instructions / निर्देश सुनें"
              >
                <Volume2 className="w-3.5 h-3.5 animate-pulse-subtle" />
                <span>सुनें / Listen</span>
              </button>
            </div>
            <h3 className="title-serif text-3xl font-medium mb-3 text-white">
              Artisan Studio
            </h3>
            <p className="text-xs text-ivory/50 leading-relaxed font-sans font-light mb-6">
              अपनी कलाकृति का फोटो अपलोड करें और तुरंत वैश्विक बाजार में प्रवेश करें।
              (Upload a photo of your craft to instantly analyze and register it on the global luxury marketplace).
            </p>
          </div>

          {/* LIVE UPLOAD — Real GPT-4o Demo */}
          <div className="p-4 rounded-xl border border-terracotta/30 bg-terracotta/5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-terracotta font-semibold flex items-center gap-1.5">
              <Zap className="w-3 h-3 animate-pulse" />
              Live AI Upload (Real Backend)
            </p>
            <p className="text-[9px] text-ivory/40 leading-relaxed font-sans">
              Upload any craft photo to trigger the real GPT-4o Vision pipeline.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              id="live-craft-upload"
              onChange={handleRealFileUpload}
              disabled={isLiveUploading || isTyping}
            />
            <label
              htmlFor="live-craft-upload"
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer border ${
                isLiveUploading || isTyping
                  ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10 text-ivory/50'
                  : 'bg-terracotta text-ivory border-terracotta hover:bg-terracotta/90 shadow-glow-terracotta'
              }`}
            >
              {isLiveUploading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running GPT-4o...</>
              ) : (
                <><Zap className="w-3.5 h-3.5" /> Upload Real Craft Photo</>
              )}
            </label>
          </div>

          {/* Preset trigger panels */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-gold-500 font-semibold mb-1">Simulate Artisan Upload</p>
            
            {products.map((prod) => {
              const art = artisans.find(a => a.id === prod.artisanId);
              const isSelected = uploadedProduct?.id === prod.id;
              
              return (
                <button
                  key={prod.id}
                  onClick={() => triggerSimulation(prod.id)}
                  disabled={isRecording || isTyping || isLiveUploading}
                  className={`w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group text-left relative ${
                    isSelected ? 'border-terracotta bg-white/10 shadow-[0_0_12px_rgba(212,91,52,0.35)]' : 'border-white/10 hover:bg-white/10 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={prod.image} 
                      alt={translateField(prod, 'name', language)} 
                      className="w-10 h-10 rounded-lg object-cover border border-white/15"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-semibold text-white tracking-wide">
                          {translateField(prod, 'craft', language)}
                        </h5>
                        {prod.id === 'prod-5' && (
                          <span className="bg-terracotta text-white text-[7px] uppercase tracking-widest px-1.5 py-0.2 rounded font-bold border border-white/10 shadow-premium animate-pulse">
                            Demo Target
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-ivory/50">
                        {art?.name} ({art?.village})
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gold-500 group-hover:translate-x-1 transition-transform animate-pulse-subtle" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Information badges */}
        <div className="mt-8 pt-6 border-t border-white/10 text-[10px] text-ivory/40 space-y-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-gold-400" />
            <span>Dialect audio translation detects regional accents</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>KritiCam scans fabric density & geometry parameters</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Interface Panel */}
      <div className="lg:col-span-7 flex flex-col h-[580px] bg-[#000000] rounded-2xl overflow-hidden border border-white/10 shadow-luxury animate-fade-in">
        
        {/* Chat Header */}
        <div className="bg-[#09090B] text-white p-4 flex justify-between items-center shadow-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white border border-white/10 relative">
              ह
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold tracking-wide">HaathSe AI Audit</h4>
              <p className="text-[9px] text-zinc-400">Online • Active Assistant</p>
            </div>
          </div>
          
          {/* Lang Selector */}
          <button 
            onClick={() => setLanguage && setLanguage(language === 'HI' ? 'EN' : 'HI')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-800 text-[10px] font-semibold text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{language === 'HI' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>

        {/* Chat Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-grid" style={{
          backgroundColor: '#000000'
        }}>
          {messages.map((msg) => {
            const isSelf = msg.sender === "artisan";
            const isSystem = msg.sender === "system";
            const isAI = msg.sender === "ai";

            return (
              <div 
                key={msg.id} 
                className={`flex ${isSelf ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-premium relative text-left ${
                    isSelf 
                      ? 'bg-zinc-800 text-white rounded-tr-none border border-zinc-700' 
                      : isAI 
                        ? 'bg-zinc-900 text-white rounded-tl-none border border-zinc-800'
                        : 'bg-zinc-900 text-white rounded-tl-none border border-zinc-800'
                  }`}
                >
                  {/* Image/Video attachments */}
                  {msg.mediaUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-white/5 bg-zinc-950 max-w-[240px]">
                      <img src={msg.mediaUrl} alt="Uploaded Media" className="w-full object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700" />
                      {msg.caption && (
                        <p className="p-2 bg-zinc-900 text-white text-[10px] border-t border-zinc-800 leading-tight">
                          {language === 'HI' ? msg.caption : msg.captionEn}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voice Note controls */}
                  {msg.isVoiceNote && (
                    <div className="space-y-2 min-w-[210px]">
                      <div className="flex items-center gap-3.5 py-1">
                        <button 
                          onClick={() => handlePlayVoice(msg)}
                          className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors border border-zinc-700 cursor-pointer"
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-3.5 h-3.5 fill-white" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          )}
                        </button>
                        
                        {/* Interactive Waveform SVG */}
                        <div className="flex-1 flex items-end gap-0.5 h-6">
                          {[30, 60, 85, 45, 75, 95, 35, 65, 85, 55, 45, 65, 30, 75, 40].map((h, i) => (
                            <span 
                              key={i} 
                              style={{ 
                                height: `${h}%`,
                                animationDelay: `${i * 35}ms`
                              }} 
                              className={`flex-1 bg-white rounded-full min-w-[2.5px] transition-all duration-300 ${
                                playingVoiceId === msg.id ? 'animate-waveform-bar' : ''
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-semibold">{msg.voiceDuration}</span>
                      </div>

                      {/* Transcribed Text Panel showing Translation process */}
                      {msg.transcriptRaw && (
                        <div className="p-2.5 bg-zinc-950 rounded-xl text-[10px] space-y-1.5 border border-zinc-800">
                          <p className="text-[8px] uppercase tracking-widest font-bold text-white">
                            Dialect Whisper Transcribe ({msg.artisanLang})
                          </p>
                          <p className="italic text-zinc-400">"{msg.transcriptRaw}"</p>
                          
                          {msg.artisanLang !== 'EN' && (
                            <div className="pt-1.5 border-t border-zinc-800">
                              <p className="text-[8px] uppercase tracking-widest font-bold text-white">
                                AI Translation (English Catalog Copy)
                              </p>
                              <p className="text-zinc-300">"{msg.transcriptEn}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard Text Message */}
                  {!msg.isVoiceNote && !msg.mediaUrl && (
                    <div className="space-y-2">
                      <p className="whitespace-pre-line leading-relaxed font-sans font-light">
                        {isSystem 
                          ? (language === 'HI' ? (msg.textHI || msg.text) : (msg.textEN || msg.textEn || msg.text))
                          : msg.text}
                      </p>
                      
                      {/* Audio voice guide reading for zero-literacy */}
                      {(isAI || isSystem) && (
                        <button 
                          onClick={() => handlePlayTextMsg(msg)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-semibold transition-all border cursor-pointer ${
                            playingVoiceId === msg.id 
                              ? 'bg-zinc-800 border-zinc-700 text-white shadow-premium animate-pulse' 
                              : 'bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause className="w-2.5 h-2.5 fill-white" />
                          ) : (
                            <Volume2 className="w-2.5 h-2.5" />
                          )}
                          <span>{playingVoiceId === msg.id ? 'Stop Guide' : 'Voice Guide'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Message footer info */}
                  <div className="flex justify-end items-center gap-1.5 mt-1.5 text-[9px] opacity-60">
                    <span>{msg.time}</span>
                    {isSelf && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
                  </div>

                  {/* Onboarding listing published triggers */}
                  {isAI && msg.showActionBtn && (
                    <div className="mt-4 space-y-2">
                      {msg.isRealResult && (
                        <div className="flex items-center gap-1.5 text-[9px] text-yellow-500 font-semibold uppercase tracking-wider">
                          <Zap className="w-3 h-3" /> Live GPT-4o Result
                        </div>
                      )}
                      <button
                        onClick={handlePublishClick}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-zinc-200 transition-all duration-300 shadow shadow-white/10"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                        Review AI Audit Listing
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 text-white rounded-2xl rounded-tl-none p-3.5 text-xs shadow-premium flex items-center gap-1.5 border border-zinc-800">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] text-zinc-400 ml-1 tracking-wider uppercase font-semibold">KritiCam AI is analyzing...</span>
              </div>
            </div>
          )}

          {/* Recording Overlay */}
          {isRecording && (
            <div className="flex justify-end animate-slide-up">
              <div className="bg-red-950 text-red-200 border border-red-900 rounded-2xl rounded-tr-none p-3.5 text-xs shadow-premium min-w-[200px] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold">Recording Voice...</span>
                </div>
                <span className="font-mono text-xs">0:0{recordingSeconds}</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Area (Mock Icons) */}
        <div className="bg-[#09090B] p-3.5 flex items-center gap-3.5 border-t border-white/5">
          {/* Zero-literacy Big Photo Button — now also triggers file picker */}
          <button 
            disabled={isRecording || isTyping || isLiveUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-zinc-700 hover:bg-zinc-700 transition-colors shadow-premium disabled:opacity-40 cursor-pointer"
            title="Upload Real Craft Image (Live AI)"
          >
            {isLiveUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Image className="w-4 h-4" />
            )}
          </button>

          {/* Text input (disabled in simulator, prompt driven) */}
          <div className="flex-1 bg-zinc-950 rounded-full px-4 py-2 border border-zinc-800 text-xs text-zinc-500 font-light select-none text-left">
            {language === 'HI' ? 'ऑटोमेटिक वॉयस मोड सक्रिय...' : 'Automatic voice mode active...'}
          </div>

          {/* Pulsing Mic */}
          <button 
            disabled={isTyping || isLiveUploading}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white border transition-all duration-300 shadow-luxury cursor-pointer ${
              isRecording 
                ? 'bg-red-600 border-red-500 scale-110 animate-pulse' 
                : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:scale-105'
            }`}
            title="Hold to Record Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
