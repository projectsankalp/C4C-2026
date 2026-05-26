import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../../styles/artisans.css';
import { useLanguage } from '../../context/LanguageContext';

// Room database with mock participant arrays and pre-populated codes
const INITIAL_ROOMS = {
  'pottery-help': {
    name: 'Pottery Help',
    icon: 'potted_plant',
    description: 'Solving wheel-throwing challenges together',
    activeCount: 12,
    code: '1234',
    participants: [
      { name: 'Radha M.', isSpeaking: true, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhv24OrCZTog5IHmEdtnhupk9ecHTkmN585kF-0_TuqciePmlXlXTLT9g4em5dXEbqNCI0g0Vr9c58z3HthVKpe-bmlJjaNqlo_vfalJSnMM3oiV3fsbHUKYP2-htqf1KITIlI7BJyEtTlKwlzikw7xSAW3JoGn6bMcCZQHHJdYAYTZspghYWwahP7tQC--xHp9a6Qav98tf2LlPzX1IaFnaOv5rHanvGuc5VDRSRoi-_rAcDLtBCuSm4j3cunoaQ7NzvXBwNcZaQ_' },
      { name: 'Arjun K.', isSpeaking: false, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqaTu5WOzcY5Ip-ms5RMdySRzlKZmwIDymjIEP6fzFIuAhH8ZaRmQNbuulWmpHhHRy1FF5DrmGNi3mlFOeHlO_Wi3zjdqzWeAwrXeTH4OJlztR2vSrU_NLAwtk1ldMOoZpP3IEXKUMPZbjYKRqQf7pqPrBdsR9GKk0bVDZl_4sS22SV8BlYmKGFmIrTjZ-3ZU_SKaomABB99KZCYF1Fpn5b1Dm9BMFxcSbaWB2awy3upjNebHw5xOfIxVGr_ZbRdVCQ5-AXHq_lRAf' },
      { name: 'Meera S.', isSpeaking: false, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN4HhWBa8kV8LLQmUw80gc2Al2fQFujXYApcjviK2aMl4jaxA2cYocfM2U342B8jDIlbkkwtfRLWqw2L_JarPjcdijUpnS9DWSVYsWx6QwW7ujr5TAiYsqJiqwaYGlzgcEp1iveCSQa69NA5yV6Ezq3CI7caB5tenf9pycZHOkiqKiPIXIYCn5dKUFIbBM_8cBQpbwyBojH7MmKM_XImBDGBM_QVzswyYcplN6O88fffeYjgV5J1_MT491M7OhW0Z7sgfZpbNJdlBG' },
      { name: 'Vikram R.', isSpeaking: false, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGYQxpzy2vgBWONloDOnAmPLLLfHOMn5eNMpJKtQWt-1addi3MSnRJ17FZaoD0GWYmBkROyRtQrqAjFWbcpAHniC1f-58h3fNOnhyaXAbQeOeBw9Hh4dJF9s3qF0pB42ZmGPL0A7U2d-7RtSGtr3JzBW174Un_P8pkf5YBzj6DsSUQVMTQx2KzVRrPX5wr4sRqiDUp3cwkNbuRpNHUC5W1-zp6DBBxttwvSsMFAzfZE1wpQgyW9Jc5yiJLuKZR1IABMAI5NqF_4Wq' }
    ]
  },
  'textile-learning': {
    name: 'Textile Learning',
    icon: 'texture',
    description: 'Exploring handloom weave structures and yarn properties',
    activeCount: 4,
    code: '4321',
    participants: [
      { name: 'Savita B.', isSpeaking: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop' },
      { name: 'Devendra P.', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop' },
      { name: 'Priya J.', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop' }
    ]
  },
  'local-crafts-karnataka': {
    name: 'Local Crafts Karnataka',
    icon: 'location_on',
    description: 'Discussing sandalwood carvings & Bidriware traditions',
    activeCount: 8,
    code: '5678',
    participants: [
      { name: 'Basavaraj S.', isSpeaking: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
      { name: 'ashley king', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop' },
      { name: 'Chandru K.', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
      { name: 'raechel.', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop' }
    ]
  },
  'dyeing-techniques': {
    name: 'Dyeing Techniques',
    icon: 'palette',
    description: 'Indigo fermentation and natural vegetable dye recipes',
    activeCount: 6,
    code: '8765',
    participants: [
      { name: 'ava.', isSpeaking: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
      { name: 'Aslam F.', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop' },
      { name: 'Zarina S.', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=150&auto=format&fit=crop' }
    ]
  }
};

const TIPS = [
  "Soak your clay for 24 hours for better plasticity.",
  "Always dry handloom silk textiles in shaded, cool air rather than direct sunlight.",
  "Fermenting natural indigo dyes requires keeping a stable temperature around 25-30°C.",
  "Sandalwood carvings should be wrapped in natural muslin cloth to preserve scent."
];

const Artisans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    return (roomParam && INITIAL_ROOMS[roomParam]) ? roomParam : null;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  // Modal & Input States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicInput, setTopicInput] = useState('');

  // Reset topic editor when changing rooms
  useEffect(() => {
    setIsEditingTopic(false);
  }, [activeRoomId]);

  // Active room data pointer
  const activeRoom = rooms[activeRoomId] || rooms['pottery-help'];

  // Sync activeRoomId with URL search params
  useEffect(() => {
    if (activeRoomId) {
      navigate(`/artisans?room=${activeRoomId}`, { replace: true });
    } else {
      navigate('/artisans', { replace: true });
    }
  }, [activeRoomId, navigate]);

  // Change tips on a timer
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 15000);
    return () => clearInterval(tipInterval);
  }, []);

  // Mic/Push-To-Talk Toggle Handlers
  const handlePttDown = (e) => {
    e.preventDefault();
    if (isMuted) {
      toast.error("Please unmute your microphone first!");
      return;
    }
    setIsSpeaking(true);
  };

  const handlePttUp = () => {
    setIsSpeaking(false);
  };

  const handleMuteToggle = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        setIsSpeaking(false);
        toast.success("Microphone muted");
      } else {
        toast.success("Microphone active");
      }
      return next;
    });
  };

  // Submit Room Creation (with code generation)
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!roomNameInput.trim()) {
      toast.error("Please enter a room name.");
      return;
    }

    const slug = roomNameInput.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `room-${Date.now()}`;
    if (rooms[slug]) {
      toast.error("A room with that name already exists!");
      return;
    }

    // Generate random 4-digit code
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newRoom = {
      name: roomNameInput.trim(),
      icon: 'forum',
      description: 'Community-led craft dialogue',
      activeCount: 1,
      code: generatedCode,
      participants: [
        { name: 'You', isSpeaking: false, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150' }
      ]
    };

    setRooms(prev => ({
      ...prev,
      [slug]: newRoom
    }));

    setActiveRoomId(slug);
    setRoomNameInput('');
    setShowCreateModal(false);

    toast.success(`Room "${newRoom.name}" created! Code: ${generatedCode}`, {
      duration: 6000,
      icon: '🎉'
    });
  };

  // Submit Room Join (checks input codes)
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const code = roomCodeInput.trim();
    if (!code || code.length !== 4 || isNaN(code)) {
      toast.error("Please enter a valid 4-digit code.");
      return;
    }

    // Search room database
    const matchingRoomEntry = Object.entries(rooms).find(([id, r]) => r.code === code);

    if (matchingRoomEntry) {
      const [id, room] = matchingRoomEntry;
      setActiveRoomId(id);
      toast.success(`Connected to "${room.name}"!`);
      setShowJoinModal(false);
      setRoomCodeInput('');
    } else {
      toast.error("No active room found with this code. Try default code 1234.");
    }
  };

  const handleLeaveRoom = () => {
    toast.success(`You have left the "${activeRoom.name}" room.`);
    setActiveRoomId(null);
  };

  const handleInvite = () => {
    const dummyUrl = `${window.location.origin}/artisans?room=${activeRoomId}`;
    navigator.clipboard.writeText(dummyUrl).then(() => {
      toast.success(`Invite link copied! Room Code: ${activeRoom.code}`);
    }).catch(() => {
      toast.error("Failed to copy link.");
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden relative w-full" style={{ height: 'calc(100vh - 80px)', backgroundColor: 'var(--secondary-cream)' }}>
      {/* Grain Overlay */}
      <div className="fixed inset-0 custom-grain z-50"></div>

      {/* Left Sidebar: Voice Rooms */}
      <aside className="w-80 bg-surface-container-low border-r border-outline-variant p-6 flex flex-col gap-6 overflow-y-auto z-10 shrink-0">
        <div className="mb-1">
          <h2 className="font-headline-md text-headline-md text-on-surface-variant font-bold">{t('artisans.liveRooms')}</h2>
          <div className="h-1 w-12 bg-primary mt-2 rounded-full"></div>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-col gap-3 mb-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-3 py-3.5 px-4 bg-primary-container text-on-primary-container rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-left w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">add_circle</span>
            <span className="font-semibold text-[15px] leading-none">{t('artisans.createRoom')}</span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center gap-3 py-3.5 px-4 bg-transparent border-2 border-primary text-primary rounded-xl transition-all hover:bg-primary/5 text-left w-full cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px] leading-none">vpn_key</span>
            <span className="font-semibold text-[15px] leading-none">{t('artisans.joinRoom')}</span>
          </button>
        </div>

        {/* Dynamic Rooms List */}
        <div className="flex flex-col gap-3">
          {Object.entries(rooms).map(([id, room]) => {
            const isActive = id === activeRoomId;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveRoomId(id);
                  toast.success(`Switched to room: ${room.name}`);
                }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left border cursor-pointer ${isActive
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-md'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border-outline-variant'
                  }`}
              >
                <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-primary/10'}`}>
                  <span className={`material-symbols-outlined text-[28px] leading-none ${isActive ? 'text-white' : 'text-primary'}`}>
                    {room.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold block text-[17px] leading-snug truncate">{room.name}</span>
                  <span className={`text-sm block mt-1 font-bold ${isActive ? 'text-white/90' : 'text-primary'}`}>
                    {room.activeCount} {t('artisans.activeLabel')} • Code: {room.code}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tip of the Day Box */}
        <div className="mt-auto pt-4">
          <div className="bg-secondary-container/20 p-4 rounded-xl border border-secondary/20">
            <p className="text-[13px] text-secondary font-bold uppercase tracking-wider mb-2">{t('artisans.tipOfDay')}</p>
            <p className="font-body-md text-on-surface-variant italic text-base leading-relaxed">
              "{TIPS[tipIndex]}"
            </p>
          </div>
        </div>
      </aside>

      {/* Main Room Area */}
      {!activeRoomId ? (
        /* LOBBY VIEW */
        <section className="flex-1 flex flex-col justify-center items-center bg-surface relative p-10 z-10 overflow-y-auto">
          {/* Subtle Decorative Backdrop Motifs */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-64 decorative-mandala opacity-5 pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-0 w-32 h-64 decorative-mandala opacity-5 pointer-events-none"></div>

          <div className="max-w-xl text-center flex flex-col items-center gap-6 bg-white/60 p-8 rounded-2xl border border-outline-variant/60 shadow-xl backdrop-blur-md relative">
            <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center text-primary mb-2 ring-8 ring-primary/5">
              <span className="material-symbols-outlined text-[48px]">forum</span>
            </div>

            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold">{t('artisans.hearthTitle')}</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex flex-col items-center justify-center p-6 bg-primary-container text-on-primary-container rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer border border-transparent"
              >
                <span className="material-symbols-outlined text-[36px] mb-2">add_circle</span>
                <span className="font-bold text-[16px] leading-none">{t('artisans.createRoom')}</span>
                <span className="text-sm text-on-primary-container/90 text-center mt-2 leading-relaxed">{t('artisans.createRoomSub')}</span>
              </button>

              <button
                onClick={() => setShowJoinModal(true)}
                className="flex flex-col items-center justify-center p-6 bg-white border border-outline-variant text-primary rounded-xl transition-all hover:scale-[1.02] hover:bg-primary/5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[36px] mb-2">vpn_key</span>
                <span className="font-bold text-[16px] text-on-surface leading-none">{t('artisans.joinRoom')}</span>
                <span className="text-sm text-on-surface-variant text-center mt-2 leading-relaxed">{t('artisans.joinRoomSub')}</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ACTIVE ROOM VIEW */
        <section className="flex-1 flex flex-col bg-surface relative overflow-hidden">
          {/* Room Header - Aligns with 40px Navbar Padding */}
          <div className="px-10 py-6 border-b border-outline-variant bg-white/50 backdrop-blur-sm flex justify-between items-center z-10 shrink-0">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary font-bold">{activeRoom.name}</h1>
              <p className="text-lg text-primary font-bold mt-1.5">{activeRoom.activeCount} {t('artisans.activeLabel')}</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest leading-none">{t('artisans.liveNow')}</span>
            </div>
          </div>

          {/* Participant Grid */}
          <div className="flex-1 overflow-y-auto p-10 z-10">
            {/* Topic Description Card */}
            <div className="mb-8 p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[28px]">{activeRoom.icon}</span>
              </div>
              
              {isEditingTopic ? (
                <div className="flex-1">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-primary/80 block mb-1">{t('artisans.editTopic')}</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-on-surface outline-none text-sm font-semibold"
                      autoFocus
                      required
                    />
                    <button
                      onClick={() => {
                        if (topicInput.trim()) {
                          setRooms(prev => ({
                            ...prev,
                            [activeRoomId]: {
                              ...prev[activeRoomId],
                              description: topicInput.trim()
                            }
                          }));
                          setIsEditingTopic(false);
                          toast.success("Discussion topic updated!");
                        } else {
                          toast.error("Please enter a valid topic description.");
                        }
                      }}
                      className="px-3.5 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:brightness-95 transition-all shadow-md cursor-pointer shrink-0"
                    >
                      {t('artisans.save')}
                    </button>
                    <button
                      onClick={() => setIsEditingTopic(false)}
                      className="px-3.5 py-1.5 bg-white border border-outline-variant text-on-surface-variant font-bold text-xs rounded-lg hover:bg-surface-container-low transition-all cursor-pointer shrink-0"
                    >
                      {t('artisans.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex justify-between items-center gap-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-primary/80 block mb-0.5">{t('artisans.currentTopic')}</span>
                    <p className="text-on-surface font-semibold text-lg leading-relaxed">{activeRoom.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTopicInput(activeRoom.description);
                      setIsEditingTopic(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-outline-variant hover:border-primary/40 text-on-surface-variant hover:text-primary rounded-lg font-bold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
                    title={t('artisans.editTopic')}
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">edit</span>
                    <span>{t('artisans.editTopicBtn')}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">

              {/* Active speaking state */}
              {isSpeaking && (
                <div className="flex flex-col items-center text-center group">
                  <div className="relative mb-5">
                    <img
                      alt="You"
                      className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover speaking-glow border-4 border-white shadow-xl"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"
                    />
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-primary text-white px-3.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 whitespace-nowrap z-30">
                      <span className="material-symbols-outlined text-[12px] leading-none">graphic_eq</span>
                      {t('artisans.speaking')}
                    </div>
                  </div>
                  <span className="font-semibold text-on-surface text-base">{t('artisans.youArtisan')}</span>
                </div>
              )}

              {/* Speaking Participant from DB (Radha M. or Savita B.) */}
              {activeRoom.participants.map((person, idx) => {
                // Hide speaking if client is speaking to preserve visual priority
                const shouldShowAsSpeaking = person.isSpeaking && !isSpeaking;
                return (
                  <div key={idx} className={`flex flex-col items-center text-center group ${shouldShowAsSpeaking ? '' : 'opacity-85 hover:opacity-100 transition-opacity'}`}>
                    <div className="relative mb-5">
                      <img
                        alt={person.name}
                        className={`w-32 h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-[0_12px_24px_rgba(192,77,41,0.12)] transition-all duration-300 ${shouldShowAsSpeaking ? 'speaking-glow' : 'grayscale-[10%] group-hover:grayscale-0'}`}
                        src={person.avatar}
                      />
                      {shouldShowAsSpeaking && (
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-primary text-white px-3.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 whitespace-nowrap z-30">
                          <span className="material-symbols-outlined text-[12px] leading-none">graphic_eq</span>
                          {t('artisans.speaking')}
                        </div>
                      )}
                    </div>
                    <span className={`font-semibold text-base ${shouldShowAsSpeaking ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {person.name}
                    </span>
                  </div>
                );
              })}

              {/* Invite Button */}
              <div className="flex flex-col items-center text-center group cursor-pointer" onClick={handleInvite}>
                <div className="w-32 h-32 md:w-36 md:h-36 mb-5 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low text-outline group-hover:bg-surface-container-high transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[36px] leading-none">person_add</span>
                </div>
                <span className="font-semibold text-outline text-base">{t('artisans.invite')}</span>
              </div>

            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="bg-surface-container-highest px-10 py-6 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-outline-variant z-20 shrink-0">

            {/* Mute/Unmute Toggle */}
            <div className="flex gap-4 items-center min-w-[200px]">
              <button
                onClick={handleMuteToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md group border-2 cursor-pointer ${isMuted
                  ? 'bg-error text-white border-error shadow-red-200'
                  : 'bg-surface-container-low border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                <span className="material-symbols-outlined text-[28px] leading-none">
                  {isMuted ? 'mic_off' : 'mic'}
                </span>
              </button>
              <span className="font-semibold text-on-surface-variant hidden lg:block text-sm">
                {isMuted ? t('artisans.muted') : t('artisans.micActive')}
              </span>
            </div>

            {/* Push to Talk Button & Absolute Floating Label */}
            <div className="relative flex flex-col items-center">
              {/* Floating Pill */}
              <div className={`absolute -top-14 font-bold tracking-[0.2em] uppercase text-[9px] px-3.5 py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 border whitespace-nowrap ${isSpeaking
                ? 'text-error bg-red-50 border-red-200 animate-pulse'
                : 'text-primary bg-white/95 border-outline-variant/40'
                }`}>
                {isSpeaking ? t('artisans.youAreSpeaking') : t('artisans.holdToSpeak')}
              </div>

              {/* PTT Button */}
              <button
                onMouseDown={handlePttDown}
                onMouseUp={handlePttUp}
                onTouchStart={handlePttDown}
                onTouchEnd={handlePttUp}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ring-8 ring-primary/5 cursor-pointer ${isSpeaking
                  ? 'bg-primary text-white scale-105 ring-primary/20'
                  : 'bg-primary-container text-on-primary-container'
                  }`}
                id="ptt-button"
              >
                <span className="material-symbols-outlined text-[36px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mic
                </span>
              </button>
            </div>

            {/* Right Action buttons */}
            <div className="flex gap-4 items-center min-w-[200px] justify-end">
              <button
                onClick={() => toast.success("Raised hand to speak!")}
                className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:brightness-95 transition-all duration-300 shadow-md border border-secondary/20 cursor-pointer"
                title="Raise Hand"
              >
                <span className="material-symbols-outlined text-[28px] leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                  back_hand
                </span>
              </button>
              <button
                onClick={handleLeaveRoom}
                className="px-6 h-14 rounded-full bg-error text-white flex items-center justify-center gap-2 hover:brightness-90 transition-all duration-300 shadow-lg font-semibold text-sm cursor-pointer"
                title="Leave Room"
              >
                <span className="material-symbols-outlined text-[20px] leading-none">logout</span>
                <span>{t('artisans.leave')}</span>
              </button>
            </div>

          </div>

          {/* Subtle Decorative Backdrop Motifs */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-64 decorative-mandala opacity-5 pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-0 w-32 h-64 decorative-mandala opacity-5 pointer-events-none"></div>
        </section>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-headline-md text-headline-md text-primary font-bold mb-1">{t('artisans.createLiveRoom')}</h3>
            <p className="text-on-surface-variant text-sm mb-5 leading-relaxed">
              {t('artisans.createRoomDesc')}
            </p>

            <form onSubmit={handleCreateSubmit}>
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-outline text-left">{t('artisans.roomName')}</label>
                <input
                  type="text"
                  placeholder="e.g. Weaving Circle"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface outline-none text-sm transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setRoomNameInput(''); }}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  {t('artisans.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:brightness-95 transition-all shadow-md cursor-pointer"
                >
                  {t('artisans.createRoom')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-headline-md text-headline-md text-primary font-bold mb-1">{t('artisans.joinLiveRoom')}</h3>
            <p className="text-on-surface-variant text-sm mb-5 leading-relaxed">
              {t('artisans.joinRoomDesc')}
            </p>

            <form onSubmit={handleJoinSubmit}>
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-outline text-left">4-Digit Code</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.replace(/\D/g, ''))} // only allow digits
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-on-surface outline-none text-center font-mono text-lg tracking-widest transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowJoinModal(false); setRoomCodeInput(''); }}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  {t('artisans.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:brightness-95 transition-all shadow-md cursor-pointer"
                >
                  {t('artisans.joinRoom')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Artisans;
