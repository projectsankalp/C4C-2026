/**
 * src/locales/en.js
 * English localization strings for the GraamSehat Villager App.
 */

export default {
  common: {
    appName: 'GraamSehat',
    tagline: 'Your Health, In Your Hands',
    getStarted: 'Get Started',
    continue: 'Continue',
    goBack: 'Go Back',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    success: 'Success',
    warning: 'Warning',
    days: 'days',
    today: 'today',
    relationSelf: 'Self',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    confirm: 'Confirm'
  },
  welcome: {
    selectLanguage: 'Select Language / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ'
  },
  login: {
    headline: 'Enter your Health ID',
    subheadline: 'Please enter your 6-digit unique Health ID below.',
    invalidHealthId: 'Invalid Health ID. Check digits and try again.',
    checkingRecord: 'Checking your health record...'
  },
  otp: {
    title: 'Verify Code',
    sentTo: 'OTP sent to +91-XXXXXXX{phone} (simulation)',
    wrongOtp: 'Incorrect OTP',
    resend: 'Resend OTP',
    resendIn: 'Resend in {seconds}s',
    verifyBtn: 'Verify & Login'
  },
  notRegistered: {
    warning: 'Health ID Not Registered',
    explanation: 'Your Health ID is not registered in our system yet.',
    subtext: 'Your request has been automatically sent to the local ASHA worker for your area. They will visit you soon to register your health records.',
    goBack: 'Go Back to Login'
  },
  dashboard: {
    greeting: 'Namaste,',
    riskTitle: 'Risk Level',
    riskGreen: 'Your health looks good',
    riskYellow: 'Some attention needed',
    riskRed: 'Immediate action required',
    lastChecked: 'Last checked: {date}',
    riskScore: 'Risk Score',
    
    // Quick Metrics
    metricBp: 'Last Blood Pressure',
    metricSugar: 'Blood Glucose',
    metricSugarNormal: 'Normal',
    metricSugarHigh: 'High',
    metricCheckup: 'Next Checkup',
    metricCheckupDays: '{days} days away',
    metricCheckupOverdue: 'Overdue!',
    metricMeds: 'Medicines Due',
    metricMedsCount: '{count} today',

    // Sections
    docNoteTitle: 'Doctor\'s Advice Note',
    readFullNote: 'Read full advice note',
    quickActions: 'Quick Actions',

    // Quick Actions buttons
    actionBook: 'Book Visit',
    actionMeds: 'Medicine Log',
    actionShare: 'Share Report',
    actionEmergency: 'Emergency',
    actionEducation: 'Education'
  },
  history: {
    title: 'Health History',
    subtitle: 'Timeline of all screening sessions',
    conductedBy: 'ASHA Worker: {name}',
    viewDetails: 'View details',
    hideDetails: 'Hide details',
    emptyState: 'No screening records yet. Your ASHA worker will screen you soon.',
    scoreLabel: 'IDRS Diabetes Risk Score',
    bpLabel: 'Blood Pressure',
    glucoseLabel: 'Blood Glucose',
    breakdownTitle: 'IDRS Risk Breakdown'
  },
  presentation: {
    title: 'Clinical Guidance',
    adviceHeader: 'Doctor\'s Advice Details',
    explanation: 'Understanding your condition:',
    whatThisMeans: 'What this means for you:',
    actionsChecklist: 'Actions to take:',
    nextApptReminder: 'Remember: Your next clinical checkup is scheduled in {days} days. Please monitor your health accordingly.',
    shareNote: 'Share this advice'
  },
  appointment: {
    title: 'Appointments',
    countdown: '{days} days until your next checkup',
    overdueAlert: 'Your checkup is OVERDUE! Please contact your ASHA worker immediately.',
    progressBar: 'Time since last screening',
    ashaCardTitle: 'Your ASHA Worker',
    callAsha: 'Call ASHA Worker',
    setReminder: 'Set Phone Reminder',
    reminderSuccess: 'Reminder notifications enabled on this phone!',
    reminderFailed: 'Could not enable reminder notifications. Check permissions.'
  },
  medicine: {
    title: 'Medicine Schedule',
    streakCounter: '{count} Day Streak!',
    streakTag: 'Taking medicines daily helps keep you healthy.',
    frequency: 'Frequency',
    dosage: 'Dose',
    nextDue: 'Next Due',
    markTaken: 'Mark as Taken',
    alreadyTaken: 'Taken today',
    modalTitle: 'About this medicine',
    modalClose: 'Close'
  },
  family: {
    title: 'Family Accounts',
    subtitle: 'Switch profiles or link family members',
    addMemberBtn: 'Add Family Member',
    relationTitle: 'Relation',
    switchMember: 'Switch to profile'
  },
  addFamily: {
    title: 'Link Family Member',
    enterUid: 'Enter Family Member Health ID',
    explain: 'Enter the 6-digit Health ID of your family member to link their account to this device.',
    successLink: 'Family member linked successfully!'
  },
  education: {
    title: 'Health Education',
    subtitle: 'Learn how to stay healthy',
    categories: {
      Diabetes: 'Diabetes',
      'Blood Pressure': 'Blood Pressure',
      Diet: 'Diet',
      Exercise: 'Exercise',
      Medicines: 'Medicines'
    },
    readMore: 'Read Full Article',
    relatedArticles: 'Related Articles'
  },
  share: {
    title: 'Share Health Summary',
    explanation: 'You can generate a summary report of your health readings to show a doctor or share with family.',
    whatsappBtn: 'Share via WhatsApp',
    copyBtn: 'Copy to Clipboard',
    pdfBtn: 'Download as PDF',
    copiedText: 'Report copied to clipboard!'
  },
  emergency: {
    title: 'Emergency SOS',
    sosExplanation: 'Press the red button below in case of medical emergency to call your nearest Primary Health Centre.',
    sosBtn: 'Call Emergency SOS',
    nearestHospital: 'Nearest Hospital / Health Post',
    distance: 'Distance',
    phone: 'Phone',
    address: 'Address',
    contactList: 'Emergency Contact List'
  },
  settings: {
    title: 'Settings',
    language: 'App Language',
    notifications: 'Notification Settings',
    notifMeds: 'Medicine Reminders',
    notifAppt: 'Appointment Alerts',
    accountInfo: 'Account Information',
    uidLabel: 'Health ID (UID)',
    phoneLabel: 'Registered Phone',
    familyCount: 'Linked Family Members',
    clearBtn: 'Clear Local Data & Logout',
    clearWarning: 'This will delete all offline records on this device. Are you sure?',
    version: 'App Version'
  }
};
