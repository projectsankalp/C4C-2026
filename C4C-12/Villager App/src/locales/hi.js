/**
 * src/locales/hi.js
 * Hindi localization strings for the GraamSehat Villager App.
 */

export default {
  common: {
    appName: 'ग्रामसेहत',
    tagline: 'आपका स्वास्थ्य, आपके हाथ',
    getStarted: 'शुरू करें',
    continue: 'आगे बढ़ें',
    goBack: 'पीछे जाएं',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    success: 'सफलता',
    warning: 'चेतावनी',
    days: 'दिन',
    today: 'आज',
    relationSelf: 'स्वयं',
    statusPending: 'लंबित',
    statusApproved: 'स्वीकृत',
    confirm: 'पुष्टि करें'
  },
  welcome: {
    selectLanguage: 'भाषा का चयन करें / Select Language'
  },
  login: {
    headline: 'अपना स्वास्थ्य आईडी दर्ज करें',
    subheadline: 'कृपया नीचे अपनी 6-अंकीय विशिष्ट स्वास्थ्य आईडी दर्ज करें।',
    invalidHealthId: 'अमान्य स्वास्थ्य आईडी। अंकों की जांच करें और पुनः प्रयास करें।',
    checkingRecord: 'आपके स्वास्थ्य रिकॉर्ड की जांच की जा रही है...'
  },
  otp: {
    title: 'कोड सत्यापित करें',
    sentTo: 'OTP +91-XXXXXXX{phone} पर भेजा गया है (सिमुलेशन)',
    wrongOtp: 'गलत OTP',
    resend: 'OTP पुनः भेजें',
    resendIn: '{seconds} सेकंड में पुनः भेजें',
    verifyBtn: 'सत्यापित करें और लॉगिन करें'
  },
  notRegistered: {
    warning: 'स्वास्थ्य आईडी पंजीकृत नहीं है',
    explanation: 'आपकी स्वास्थ्य आईडी अभी हमारे सिस्टम में पंजीकृत नहीं है।',
    subtext: 'आपका अनुरोध आपके क्षेत्र की आशा कार्यकर्ता को स्वचालित रूप से भेज दिया गया है। वे आपके स्वास्थ्य रिकॉर्ड को पंजीकृत करने के लिए जल्द ही आपसे संपर्क करेंगी।',
    goBack: 'लॉगिन पर वापस जाएं'
  },
  dashboard: {
    greeting: 'नमस्ते,',
    riskTitle: 'जोखिम स्तर',
    riskGreen: 'आपका स्वास्थ्य अच्छा लग रहा है',
    riskYellow: 'कुछ ध्यान देने की आवश्यकता है',
    riskRed: 'तत्काल कार्रवाई आवश्यक है',
    lastChecked: 'अंतिम जांच: {date}',
    riskScore: 'जोखिम स्कोर',
    
    // Quick Metrics
    metricBp: 'अंतिम रक्तचाप',
    metricSugar: 'ब्लड शुगर',
    metricSugarNormal: 'सामान्य',
    metricSugarHigh: 'उच्च',
    metricCheckup: 'अगली जांच',
    metricCheckupDays: '{days} दिन बाद',
    metricCheckupOverdue: 'समय समाप्त!',
    metricMeds: 'आज की दवाएं',
    metricMedsCount: '{count} आज',

    // Sections
    docNoteTitle: 'डॉक्टर की सलाह',
    readFullNote: 'पूरी सलाह पढ़ें',
    quickActions: 'त्वरित कार्रवाई',

    // Quick Actions buttons
    actionBook: 'जांच बुक करें',
    actionMeds: 'दवा लॉग',
    actionShare: 'रिपोर्ट साझा करें',
    actionEmergency: 'आपातकालीन',
    actionEducation: 'स्वास्थ्य शिक्षा'
  },
  history: {
    title: 'स्वास्थ्य इतिहास',
    subtitle: 'सभी जांच सत्रों की समय-सीमा',
    conductedBy: 'आशा कार्यकर्ता: {name}',
    viewDetails: 'विवरण देखें',
    hideDetails: 'विवरण छिपाएं',
    emptyState: 'अभी कोई जांच रिकॉर्ड नहीं है। आपकी आशा कार्यकर्ता जल्द ही आपकी जांच करेंगी।',
    scoreLabel: 'IDRS मधुमेह जोखिम स्कोर',
    bpLabel: 'रक्तचाप',
    glucoseLabel: 'ब्लड ग्लूकोज',
    breakdownTitle: 'IDRS जोखिम विवरण'
  },
  presentation: {
    title: 'चिकित्सकीय मार्गदर्शन',
    adviceHeader: 'डॉक्टर की सलाह का विवरण',
    explanation: 'अपनी स्वास्थ्य स्थिति को समझें:',
    whatThisMeans: 'आपके लिए इसका क्या अर्थ है:',
    actionsChecklist: 'की जाने वाली कार्रवाई:',
    nextApptReminder: 'याद रखें: आपकी अगली जांच {days} दिनों में निर्धारित है। कृपया अपने स्वास्थ्य की निगरानी रखें।',
    shareNote: 'यह सलाह साझा करें'
  },
  appointment: {
    title: 'अपॉइंटमेंट',
    countdown: 'आपकी अगली जांच में {days} दिन शेष हैं',
    overdueAlert: 'आपकी जांच का समय निकल चुका है! कृपया तुरंत अपनी आशा कार्यकर्ता से संपर्क करें।',
    progressBar: 'पिछली जांच से बीता समय',
    ashaCardTitle: 'आपकी आशा कार्यकर्ता',
    callAsha: 'आशा कार्यकर्ता को कॉल करें',
    setReminder: 'फ़ोन रिमाइंडर सेट करें',
    reminderSuccess: 'इस फ़ोन पर रिमाइंडर सूचनाएं सक्रिय कर दी गई हैं!',
    reminderFailed: 'रिमाइंडर सूचनाएं सक्रिय नहीं की जा सकीं। अनुमतियों की जांच करें।'
  },
  medicine: {
    title: 'दवा अनुसूची',
    streakCounter: '{count} दिन का सिलसिला!',
    streakTag: 'रोजाना दवाएं लेने से आप स्वस्थ रहते हैं।',
    frequency: 'आवृत्ति',
    dosage: 'खुराक',
    nextDue: 'अगला समय',
    markTaken: 'लिया गया चिह्नित करें',
    alreadyTaken: 'आज ले ली है',
    modalTitle: 'इस दवा के बारे में',
    modalClose: 'बंद करें'
  },
  family: {
    title: 'पारिवारिक खाते',
    subtitle: 'प्रोफ़ाइल बदलें या परिवार के सदस्यों को जोड़ें',
    addMemberBtn: 'परिवार के सदस्य को जोड़ें',
    relationTitle: 'संबंध',
    switchMember: 'प्रोफ़ाइल बदलें'
  },
  addFamily: {
    title: 'परिवार के सदस्य को जोड़ें',
    enterUid: 'परिवार के सदस्य की स्वास्थ्य आईडी दर्ज करें',
    explain: 'अपने परिवार के सदस्य के खाते को इस उपकरण से जोड़ने के लिए उनकी 6-अंकीय स्वास्थ्य आईडी दर्ज करें।',
    successLink: 'परिवार के सदस्य को सफलतापूर्वक जोड़ा गया!'
  },
  education: {
    title: 'स्वास्थ्य शिक्षा',
    subtitle: 'स्वस्थ रहने का तरीका जानें',
    categories: {
      Diabetes: 'मधुमेह',
      'Blood Pressure': 'रक्तचाप',
      Diet: 'खान-पान',
      Exercise: 'व्यायाम',
      Medicines: 'दवाएं'
    },
    readMore: 'पूरा लेख पढ़ें',
    relatedArticles: 'संबंधित लेख'
  },
  share: {
    title: 'स्वास्थ्य रिपोर्ट साझा करें',
    explanation: 'डॉक्टर को दिखाने या परिवार के साथ साझा करने के लिए स्वास्थ्य रिपोर्ट तैयार करें।',
    whatsappBtn: 'व्हाट्सएप पर साझा करें',
    copyBtn: 'क्लिपबोर्ड पर कॉपी करें',
    pdfBtn: 'PDF डाउनलोड करें',
    copiedText: 'रिपोर्ट क्लिपबोर्ड पर कॉपी कर दी गई है!'
  },
  emergency: {
    title: 'आपातकालीन SOS',
    sosExplanation: 'आपातकालीन चिकित्सा स्थिति में अपने निकटतम प्राथमिक स्वास्थ्य केंद्र को कॉल करने के लिए लाल बटन दबाएं।',
    sosBtn: 'आपातकालीन SOS कॉल करें',
    nearestHospital: 'निकटतम अस्पताल / स्वास्थ्य पोस्ट',
    distance: 'दूरी',
    phone: 'फ़ोन नंबर',
    address: 'पता',
    contactList: 'आपातकालीन संपर्कों की सूची'
  },
  settings: {
    title: 'सेटिंग्स',
    language: 'ऐप की भाषा',
    notifications: 'अधिसूचना सेटिंग्स',
    notifMeds: 'दवा अनुस्मारक',
    notifAppt: 'जांच अलर्ट',
    accountInfo: 'खाता विवरण',
    uidLabel: 'स्वास्थ्य आईडी (UID)',
    phoneLabel: 'पंजीकृत फ़ोन',
    familyCount: 'जुड़े हुए परिवार के सदस्य',
    clearBtn: 'डेटा हटाएं और लॉगआउट करें',
    clearWarning: 'यह इस फ़ोन के सभी ऑफ़लाइन रिकॉर्ड को हटा देगा। क्या आप सुनिश्चित हैं?',
    version: 'ऐप संस्करण'
  }
};
