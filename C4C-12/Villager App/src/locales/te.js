/**
 * src/locales/te.js
 * Telugu localization strings for the GraamSehat Villager App.
 */

export default {
  common: {
    appName: 'గ్రామసేహత్',
    tagline: 'మీ ఆరోగ్యం, మీ చేతుల్లో',
    getStarted: 'ప్రారంభించండి',
    continue: 'కొనసాగించండి',
    goBack: 'వెనుకకు వెళ్ళండి',
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం',
    save: 'సేవ్ చేయి',
    cancel: 'రద్దు చేయి',
    success: 'విజయం',
    warning: 'హెచ్చరిక',
    days: 'రోజులు',
    today: 'నేడు',
    relationSelf: 'స్వంతం',
    statusPending: 'పెండింగ్',
    statusApproved: 'ఆమోదించబడింది',
    confirm: 'ధృవీకరించండి'
  },
  welcome: {
    selectLanguage: 'భాషను ఎంచుకోండి / Select Language'
  },
  login: {
    headline: 'మీ ఆరోగ్య ఐడిని నమోదు చేయండి',
    subheadline: 'దయచేసి మీ 6-అంకెల ప్రత్యేక ఆరోగ్య ఐడిని క్రింద నమోదు చేయండి.',
    invalidHealthId: 'చెల్లని ఆరోగ్య ఐడి. అంకెలను సరిచూసుకుని మళ్ళీ ప్రయత్నించండి.',
    checkingRecord: 'మీ ఆరోగ్య రికార్డును తనిఖీ చేస్తున్నాము...'
  },
  otp: {
    title: 'కోడ్ ధృవీకరించండి',
    sentTo: 'OTP +91-XXXXXXX{phone} కు పంపబడింది (సిమ్యులేషన్)',
    wrongOtp: 'తప్పు OTP',
    resend: 'OTP ని మళ్ళీ పంపండి',
    resendIn: '{seconds} సెకన్లలో మళ్ళీ పంపండి',
    verifyBtn: 'ధృవీకరించి లాగిన్ అవ్వండి'
  },
  notRegistered: {
    warning: 'ఆరోగ్య ఐడి నమోదు కాలేదు',
    explanation: 'మీ ఆరోగ్య ఐడి ఇంకా మా సిస్టమ్‌లో నమోదు కాలేదు.',
    subtext: 'మీ అభ్యర్థన మీ ప్రాంత ఆశా కార్యకర్తకు స్వయంచాలకంగా పంపబడింది. మీ ఆరోగ్య రికార్డులను నమోదు చేయడానికి వారు త్వరలోనే మిమ్మల్ని సంప్రదిస్తారు.',
    goBack: 'లాగిన్‌కు తిరిగి వెళ్ళండి'
  },
  dashboard: {
    greeting: 'నమస్కారం,',
    riskTitle: 'ప్రమాద తీవ్రత',
    riskGreen: 'మీ ఆరోగ్యం బాగుంది',
    riskYellow: 'కొద్దిగా శ్రద్ధ అవసరం',
    riskRed: 'వెంటనే చర్యలు చేపట్టాలి',
    lastChecked: 'చివరి సారి పరీక్షించింది: {date}',
    riskScore: 'రిస్క్ స్కోరు',
    
    // Quick Metrics
    metricBp: 'చివరి రక్తపోటు',
    metricSugar: 'రక్తంలో చక్కెర',
    metricSugarNormal: 'సాధారణం',
    metricSugarHigh: 'ఎక్కువ',
    metricCheckup: 'తదుపరి పరీక్ష',
    metricCheckupDays: '{days} రోజుల తర్వాత',
    metricCheckupOverdue: 'గడువు ముగిసింది!',
    metricMeds: 'నేటి మందులు',
    metricMedsCount: '{count} నేడు',

    // Sections
    docNoteTitle: 'వైద్యుల సలహా',
    readFullNote: 'పూర్తి సలహా చదవండి',
    quickActions: 'త్వరిత చర్యలు',

    // Quick Actions buttons
    actionBook: 'పరీక్ష బుక్ చేయి',
    actionMeds: 'మందుల రికార్డు',
    actionShare: 'రిపోర్ట్ షేర్ చేయి',
    actionEmergency: 'అత్యవసరం',
    actionEducation: 'ఆరోగ్య విద్య'
  },
  history: {
    title: 'ఆరోగ్య చరిత్ర',
    subtitle: 'అన్ని పరీక్షల కాలక్రమ పట్టిక',
    conductedBy: 'ఆశా కార్యకర్త: {name}',
    viewDetails: 'వివరాలు చూడండి',
    hideDetails: 'వివరాలు దాచండి',
    emptyState: 'ఇంకా ఎలాంటి పరీక్షల రికార్డులు లేవు. మీ ఆశా కార్యకర్త త్వరలోనే మిమ్మల్ని పరీక్షిస్తారు.',
    scoreLabel: 'IDRS మధుమేహం రిస్క్ స్కోరు',
    bpLabel: 'రక్తపోటు',
    glucoseLabel: 'రక్తంలో చక్కెర',
    breakdownTitle: 'IDRS రిస్క్ విభజన'
  },
  presentation: {
    title: 'వైద్య మార్గదర్శకత్వం',
    adviceHeader: 'వైద్యుల సలహా వివరాలు',
    explanation: 'మీ ఆరోగ్య పరిస్థితిని అర్థం చేసుకోండి:',
    whatThisMeans: 'ఇది మీకు ఏం సూచిస్తుంది:',
    actionsChecklist: 'తీసుకోవలసిన జాగ్రత్తలు:',
    nextApptReminder: 'గుర్తుంచుకోండి: మీ తదుపరి పరీక్ష {days} రోజుల్లో నిర్ణయించబడింది. దయచేసి మీ ఆరోగ్యాన్ని క్రమం తప్పకుండా చూసుకోండి.',
    shareNote: 'ఈ సలహాను షేర్ చేయండి'
  },
  appointment: {
    title: 'అపాయింట్‌మెంట్‌లు',
    countdown: 'మీ తదుపరి పరీక్షకు {days} రోజులు ఉన్నాయి',
    overdueAlert: 'మీ పరీక్ష గడువు దాటిపోయింది! దయచేసి వెంటనే మీ ఆశా కార్యకర్తను సంప్రదించండి.',
    progressBar: 'చివరి పరీక్ష నుండి గడిచిన సమయం',
    ashaCardTitle: 'మీ ఆశా కార్యకర్త',
    callAsha: 'ఆశా కార్యకర్తకు కాల్ చేయి',
    setReminder: 'రిమైండర్ సెట్ చేయి',
    reminderSuccess: 'ఈ ఫోన్‌లో రిమైండర్ నోటిఫికేషన్‌లు సక్రియం చేయబడ్డాయి!',
    reminderFailed: 'రిమైండర్ నోటిఫికేషన్‌లను సక్రియం చేయడం సాధ్యపడలేదు. అనుమతులు తనిఖీ చేయండి.'
  },
  medicine: {
    title: 'మందుల పట్టిక',
    streakCounter: '{count} రోజుల పరంపర!',
    streakTag: 'ప్రతిరోజూ మందులు వాడడం వల్ల మీరు ఆరోగ్యంగా ఉంటారు.',
    frequency: 'ఫ్రీక్వెన్సీ',
    dosage: 'మోతాదు',
    nextDue: 'తదుపరి సమయం',
    markTaken: 'వేసుకున్నట్లు గుర్తించు',
    alreadyTaken: 'ఈ రోజు వేసుకున్నారు',
    modalTitle: 'ఈ మందు గురించి',
    modalClose: 'మూసివేయి'
  },
  family: {
    title: 'కుటుంబ ఖాతాలు',
    subtitle: 'ప్రొఫైల్స్ మార్చండి లేదా కుటుంబ సభ్యులను జోడించండి',
    addMemberBtn: 'కుటుంబ సభ్యుడిని జోడించు',
    relationTitle: 'సంబంధం',
    switchMember: 'ప్రొఫైల్ మార్చు'
  },
  addFamily: {
    title: 'కుటుంబ సభ్యుడిని లింక్ చేయి',
    enterUid: 'కుటుంబ సభ్యుడి ఆరోగ్య ఐడి నమోదు చేయి',
    explain: 'మీ కుటుంబ సభ్యుడి ఖాతాను ఈ పరికరానికి లింక్ చేయడానికి వారి 6-అంకెల ఆరోగ్య ఐడిని నమోదు చేయండి.',
    successLink: 'కుటుంబ సభ్యుడు విజయవంతంగా లింక్ చేయబడ్డారు!'
  },
  education: {
    title: 'ఆరోగ్య విద్య',
    subtitle: 'ఆరోగ్యంగా ఉండే విధానం నేర్చుకోండి',
    categories: {
      Diabetes: 'మధుమేహం',
      'Blood Pressure': 'రక్తపోటు',
      Diet: 'ఆహార నియమాలు',
      Exercise: 'వ్యాయామం',
      Medicines: 'మందులు'
    },
    readMore: 'పూర్తి వ్యాసం చదవండి',
    relatedArticles: 'సంబంధిత వ్యాసాలు'
  },
  share: {
    title: 'ఆరోగ్య రిపోర్ట్ షేర్ చేయి',
    explanation: 'వైద్యుడికి చూపించడానికి లేదా కుటుంబ సభ్యులతో పంచుకోవడానికి మీ ఆరోగ్య నివేదికను సృష్టించవచ్చు.',
    whatsappBtn: 'వాట్సాప్ ద్వారా షేర్ చేయి',
    copyBtn: 'క్లిప్‌బోర్డ్‌కు కాపీ చేయి',
    pdfBtn: 'PDF డౌన్‌లోడ్ చేయి',
    copiedText: 'నివేదిక క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!'
  },
  emergency: {
    title: 'అత్యవసర SOS',
    sosExplanation: 'అత్యవసర వైద్య పరిస్థితిలో మీ సమీప ప్రాథమిక ఆరోగ్య కేంద్రాన్ని పిలవడానికి క్రింది ఎరుపు బటన్ నొక్కండి.',
    sosBtn: 'అత్యవసర SOS కాల్ చేయి',
    nearestHospital: 'సమీప ఆసుపత్రి / ఆరోగ్య కేంద్రం',
    distance: 'దూరం',
    phone: 'ఫోన్ నెంబర్',
    address: 'చిరునామా',
    contactList: 'అత్యవసర సంప్రదింపుల జాబితా'
  },
  settings: {
    title: 'సెట్టింగ్స్',
    language: 'యాప్ భాష',
    notifications: 'నోటిఫికేషన్ సెట్టింగ్స్',
    notifMeds: 'మందుల రిమైండర్లు',
    notifAppt: 'పరీక్ష అలర్ట్‌లు',
    accountInfo: 'ఖాతా సమాచారం',
    uidLabel: 'ఆరోగ్య ఐడి (UID)',
    phoneLabel: 'నమోదిత ఫోన్',
    familyCount: 'లింక్ చేయబడిన కుటుంబ సభ్యులు',
    clearBtn: 'డేటాను తుడిచివేసి లాగౌట్ అవ్వండి',
    clearWarning: 'ఇది ఈ ఫోన్‌లోని అన్ని ఆఫ్‌లైన్ రికార్డులను తొలగిస్తుంది. ఖాయమేనా?',
    version: 'యాప్ వెర్షన్'
  }
};
