import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'kn';

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Login Page
  'web3_credentialing': {
    en: 'Web3 credentialing for artisans',
    hi: 'कारीगरों के लिए Web3 क्रेडेंशियल',
    kn: 'ಕುಶಲಕರ್ಮಿಗಳಿಗೆ Web3 ರುಜುವಾತುಗಳು',
  },
  'welcome': {
    en: 'Welcome',
    hi: 'स्वागत है',
    kn: 'ಸ್ವಾಗತ',
  },
  'back': {
    en: 'back.',
    hi: 'वापस।',
    kn: 'ಮರಳಿ.',
  },
  'sign_in_continue': {
    en: 'Sign in to continue your journey',
    hi: 'अपनी यात्रा जारी रखने के लिए साइन इन करें',
    kn: 'ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
  },
  'phone_number': {
    en: 'Phone number',
    hi: 'फ़ोन नंबर',
    kn: 'ಫೋನ್ ಸಂಖ್ಯೆ',
  },
  'send_otp': {
    en: 'Send OTP',
    hi: 'OTP भेजें',
    kn: 'OTP ಕಳುಹಿಸಿ',
  },
  'enter_otp': {
    en: 'Enter OTP sent to',
    hi: 'पर भेजे गए OTP को दर्ज करें',
    kn: 'ಗೆ ಕಳುಹಿಸಲಾದ OTP ನಮೂದಿಸಿ',
  },
  'verify_continue': {
    en: 'Verify & continue',
    hi: 'सत्यापित करें और जारी रखें',
    kn: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮುಂದುವರಿಸಿ',
  },
  'change_phone': {
    en: 'Change phone number',
    hi: 'फ़ोन नंबर बदलें',
    kn: 'ಫೋನ್ ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ',
  },
  'artisan': {
    en: 'Artisan',
    hi: 'कारीगर',
    kn: 'ಕುಶಲಕರ್ಮಿ',
  },
  'nss_validator': {
    en: 'NSS Validator',
    hi: 'NSS वैलिडेटर',
    kn: 'NSS ಮೌಲ್ಯಮಾಪಕ',
  },
  'blockchain_verified': {
    en: 'Blockchain-verified credentials for rural artisans',
    hi: 'ग्रामीण कारीगरों के लिए ब्लॉकचेन-सत्यापित क्रेडेंशियल',
    kn: 'ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿಗಳಿಗೆ ಬ್ಲಾಕ್‌ಚೈನ್-ಪರಿಶೀಲಿಸಿದ ರುಜುವಾತುಗಳು',
  },
  // Top Navigation
  'upload': {
    en: 'Upload',
    hi: 'अपलोड करें',
    kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
  },
  'profile': {
    en: 'Profile',
    hi: 'प्रोफ़ाइल',
    kn: 'ಪ್ರೊಫೈಲ್',
  },
  'logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
    kn: 'ಲಾಗ್ ಔಟ್',
  },
  // Hub Page
  'step_1_proof': {
    en: 'Step 1 · Proof of skill',
    hi: 'चरण 1 · कौशल का प्रमाण',
    kn: 'ಹಂತ 1 · ಕೌಶಲ್ಯದ ಪುರಾವೆ',
  },
  'show_us_what': {
    en: 'Show us what',
    hi: 'हमें दिखाएं कि',
    kn: 'ನಮಗೆ ತೋರಿಸಿ',
  },
  'you_can_do': {
    en: 'you can do.',
    hi: 'आप क्या कर सकते हैं।',
    kn: 'ನೀವು ಏನು ಮಾಡಬಹುದು.',
  },
  'record_video_desc': {
    en: 'Record a short video of your craft. A validator will review it and mint your verified credential.',
    hi: 'अपने शिल्प का एक छोटा वीडियो रिकॉर्ड करें। एक वैलिडेटर इसकी समीक्षा करेगा और आपका क्रेडेंशियल बनाएगा।',
    kn: 'ನಿಮ್ಮ ಕರಕುಶಲತೆಯ ಸಣ್ಣ ವೀಡಿಯೊವನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ. ಮೌಲ್ಯಮಾಪಕರು ಅದನ್ನು ಪರಿಶೀಲಿಸುತ್ತಾರೆ ಮತ್ತು ನಿಮ್ಮ ರುಜುವಾತು ನೀಡುತ್ತಾರೆ.',
  },
  'select_skill': {
    en: 'Select your skill',
    hi: 'अपना कौशल चुनें',
    kn: 'ನಿಮ್ಮ ಕೌಶಲ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  },
  'choose_skill': {
    en: 'Choose a skill...',
    hi: 'एक कौशल चुनें...',
    kn: 'ಒಂದು ಕೌಶಲ್ಯವನ್ನು ಆರಿಸಿ...',
  },
  'video_proof': {
    en: 'Video proof',
    hi: 'वीडियो प्रमाण',
    kn: 'ವೀಡಿಯೊ ಪುರಾವೆ',
  },
  'drop_video_here': {
    en: 'Drop a video here',
    hi: 'वीडियो यहाँ छोड़ें',
    kn: 'ವೀಡಿಯೊವನ್ನು ಇಲ್ಲಿ ಬಿಡಿ',
  },
  'tap_to_record': {
    en: 'or tap to record / select a file',
    hi: 'या रिकॉर्ड करने / फ़ाइल चुनने के लिए टैप करें',
    kn: 'ಅಥವಾ ರೆಕಾರ್ಡ್ ಮಾಡಲು / ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
  },
  'submit_for_validation': {
    en: 'Submit for validation',
    hi: 'सत्यापन के लिए सबमिट करें',
    kn: 'ಮೌಲ್ಯೀಕರಣಕ್ಕಾಗಿ ಸಲ್ಲಿಸಿ',
  },
  'submission_reviewed': {
    en: 'Your submission will be reviewed by an NSS validator',
    hi: 'आपकी प्रस्तुति की समीक्षा एक NSS वैलिडेटर द्वारा की जाएगी',
    kn: 'ನಿಮ್ಮ ಸಲ್ಲಿಕೆಯನ್ನು NSS ಮೌಲ್ಯಮಾಪಕರು ಪರಿಶೀಲಿಸುತ್ತಾರೆ',
  },
  'tailoring': {
    en: 'Tailoring',
    hi: 'सिलाई',
    kn: 'ಹೊಲಿಗೆ',
  },
  'handicrafts': {
    en: 'Handicrafts',
    hi: 'हस्तशिल्प',
    kn: 'ಕರಕುಶಲ ವಸ್ತುಗಳು',
  },
  'food_prep': {
    en: 'Food Prep',
    hi: 'भोजन की तैयारी',
    kn: 'ಆಹಾರ ತಯಾರಿಕೆ',
  },
  'beauty': {
    en: 'Beauty',
    hi: 'सौंदर्य',
    kn: 'ಸೌಂದರ್ಯ',
  },
  'domestic_work': {
    en: 'Domestic Work',
    hi: 'घरेलू काम',
    kn: 'ಮನೆ ಕೆಲಸ',
  },
  'manufacturing': {
    en: 'Manufacturing',
    hi: 'निर्माण',
    kn: 'ತಯಾರಿಕೆ',
  },
  // Profile Page
  'expert': {
    en: 'Expert',
    hi: 'विशेषज्ञ',
    kn: 'ತಜ್ಞ',
  },
  'my_profile': {
    en: 'My Profile',
    hi: 'मेरी प्रोफ़ाइल',
    kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
  },
  'verified_creds_desc': {
    en: 'Your verified credentials and unlocked opportunities',
    hi: 'आपके सत्यापित क्रेडेंशियल और अनलॉक किए गए अवसर',
    kn: 'ನಿಮ್ಮ ಪರಿಶೀಲಿಸಿದ ರುಜುವಾತುಗಳು ಮತ್ತು ಅನ್‌ಲಾಕ್ ಮಾಡಲಾದ ಅವಕಾಶಗಳು',
  },
  'master_tailor': {
    en: 'Master Tailor',
    hi: 'मास्टर दर्जी',
    kn: 'ಮಾಸ್ಟರ್ ಟೈಲರ್',
  },
  'certified_credential': {
    en: 'Certified credential',
    hi: 'प्रमाणित क्रेडेंशियल',
    kn: 'ಪ್ರಮಾಣೀಕೃತ ರುಜುವಾತು',
  },
  'skill_score': {
    en: 'Skill score',
    hi: 'कौशल स्कोर',
    kn: 'ಕೌಶಲ್ಯ ಸ್ಕೋರ್',
  },
  'issued': {
    en: 'Issued',
    hi: 'जारी किया गया',
    kn: 'ನೀಡಲಾಗಿದೆ',
  },
  'certificate_id': {
    en: 'Certificate ID',
    hi: 'प्रमाणपत्र ID',
    kn: 'ಪ್ರಮಾಣಪತ್ರ ID',
  },
  'qr_code': {
    en: 'QR Code',
    hi: 'QR कोड',
    kn: 'QR ಕೋಡ್',
  },
  'hide_jobs': {
    en: 'Hide jobs',
    hi: 'नौकरियां छिपाएं',
    kn: 'ಉದ್ಯೋಗಗಳನ್ನು ಮರೆಮಾಡಿ',
  },
  'view_unlocked_jobs': {
    en: 'View unlocked jobs',
    hi: 'अनलॉक की गई नौकरियां देखें',
    kn: 'ಅನ್‌ಲಾಕ್ ಮಾಡಲಾದ ಉದ್ಯೋಗಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
  },
  'unlocked_local_jobs': {
    en: 'Unlocked local jobs',
    hi: 'अनलॉक की गई स्थानीय नौकरियां',
    kn: 'ಅನ್‌ಲಾಕ್ ಮಾಡಲಾದ ಸ್ಥಳೀಯ ಉದ್ಯೋಗಗಳು',
  },
  'apply': {
    en: 'Apply',
    hi: 'आवेदन करें',
    kn: 'ಅನ್ವಯಿಸು',
  },
  'certificates': {
    en: 'Certificates',
    hi: 'प्रमाणपत्र',
    kn: 'ಪ್ರಮಾಣಪತ್ರಗಳು',
  },
  'jobs_unlocked': {
    en: 'Jobs unlocked',
    hi: 'नौकरियां अनलॉक',
    kn: 'ಉದ್ಯೋಗಗಳು ಅನ್‌ಲಾಕ್ ಆಗಿವೆ',
  },
  // Jobs mock
  'senior_stitcher': {
    en: 'Senior Stitcher',
    hi: 'वरिष्ठ सिलाईकर्मी',
    kn: 'ಹಿರಿಯ ಹೊಲಿಗೆಗಾರ',
  },
  'pattern_designer': {
    en: 'Pattern Designer',
    hi: 'पैटर्न डिज़ाइनर',
    kn: 'ವಿನ್ಯಾಸಕಾರ',
  },
  'tailoring_instructor': {
    en: 'Tailoring Instructor',
    hi: 'सिलाई प्रशिक्षक',
    kn: 'ಹೊಲಿಗೆ ಬೋಧಕ',
  },
  'local_boutique': {
    en: 'Local Boutique',
    hi: 'स्थानीय बुटीक',
    kn: 'ಸ್ಥಳೀಯ ಅಂಗಡಿ',
  },
  'fashion_coop': {
    en: 'Fashion Co-op',
    hi: 'फैशन को-ऑप',
    kn: 'ಫ್ಯಾಷನ್ ಸಹಕಾರ',
  },
  'skill_center': {
    en: 'Skill Center',
    hi: 'कौशल केंद्र',
    kn: 'ಕೌಶಲ್ಯ ಕೇಂದ್ರ',
  },
  'downtown': {
    en: 'Downtown',
    hi: 'शहर का केंद्र',
    kn: 'ಡೌನ್ಟೌನ್',
  },
  'market_district': {
    en: 'Market District',
    hi: 'बाज़ार क्षेत्र',
    kn: 'ಮಾರುಕಟ್ಟೆ ಜಿಲ್ಲೆ',
  },
  'community_hub': {
    en: 'Community Hub',
    hi: 'सामुदायिक केंद्र',
    kn: 'ಸಮುದಾಯ ಕೇಂದ್ರ',
  },
  // Hub Form
  'applying_for_myself': {
    en: 'Applying for myself',
    hi: 'अपने लिए आवेदन कर रही हूँ',
    kn: 'ನನಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತಿದ್ದೇನೆ',
  },
  'applying_for_someone_else': {
    en: 'Applying for someone else',
    hi: 'किसी और के लिए आवेदन कर रही हूँ',
    kn: 'ಬೇರೆಯವರಿಗಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸುತ್ತಿದ್ದೇನೆ',
  },
  'your_name': {
    en: 'Your Name',
    hi: 'आपका नाम',
    kn: 'ನಿಮ್ಮ ಹೆಸರು',
  },
  'candidate_name': {
    en: 'Candidate Name',
    hi: 'उम्मीदवार का नाम',
    kn: 'ಅಭ್ಯರ್ಥಿಯ ಹೆಸರು',
  },
  'eg_your_name': {
    en: 'e.g. Your Name',
    hi: 'उदा. आपका नाम',
    kn: 'ಉದಾ. ನಿಮ್ಮ ಹೆಸರು',
  },
  'eg_radhika': {
    en: 'e.g. Radhika Sharma',
    hi: 'उदा. राधिका शर्मा',
    kn: 'ಉದಾ. ರಾಧಿಕಾ ಶರ್ಮಾ',
  },
  'your_phone': {
    en: 'Your Phone',
    hi: 'आपका फोन',
    kn: 'ನಿಮ್ಮ ಫೋನ್',
  },
  'candidate_phone': {
    en: 'Candidate Phone',
    hi: 'उम्मीदवार का फोन',
    kn: 'ಅಭ್ಯರ್ಥಿಯ ಫೋನ್',
  },
  'your_location': {
    en: 'Your Location (City)',
    hi: 'आपका स्थान (शहर)',
    kn: 'ನಿಮ್ಮ ಸ್ಥಳ (ನಗರ)',
  },
  'candidate_location': {
    en: 'Candidate Location (City)',
    hi: 'उम्मीदवार का स्थान (शहर)',
    kn: 'ಅಭ್ಯರ್ಥಿಯ ಸ್ಥಳ (ನಗರ)',
  },
  'eg_bangalore': {
    en: 'e.g. Bangalore',
    hi: 'उदा. बैंगलोर',
    kn: 'ಉದಾ. ಬೆಂಗಳೂರು',
  },
  // Admin Page
  'review_score_mint': {
    en: 'Review. Score.',
    hi: 'समीक्षा करें। स्कोर दें।',
    kn: 'ಪರಿಶೀಲಿಸಿ. ಅಂಕ ನೀಡಿ.',
  },
  'mint_with_care': {
    en: 'Mint with care.',
    hi: 'सावधानी से मिंट करें।',
    kn: 'ಎಚ್ಚರಿಕೆಯಿಂದ ಮುದ್ರಿಸಿ.',
  },
  'admin_hero_desc': {
    en: 'Every certificate you mint unlocks real work for a rural artisan. Take a moment with each one.',
    hi: 'आपके द्वारा मिंट किया गया प्रत्येक प्रमाणपत्र एक ग्रामीण कारीगर के लिए वास्तविक काम खोलता है। हर एक के साथ कुछ समय निकालें।',
    kn: 'ನೀವು ಮುದ್ರಿಸುವ ಪ್ರತಿಯೊಂದು ಪ್ರಮಾಣಪತ್ರವು ಗ್ರಾಮೀಣ ಕುಶಲಕರ್ಮಿಗೆ ನೈಜ ಕೆಲಸವನ್ನು ತೆರೆಯುತ್ತದೆ. ಪ್ರತಿಯೊಂದರೊಂದಿಗೂ ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ.',
  },
  'approved': {
    en: 'Approved',
    hi: 'स्वीकृत',
    kn: 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
  },
  'pending': {
    en: 'Pending',
    hi: 'लंबित',
    kn: 'ಬಾಕಿ ಉಳಿದಿದೆ',
  },
  'rejected': {
    en: 'Rejected',
    hi: 'अस्वीकृत',
    kn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  },
  'total_reviews': {
    en: 'Total Reviews',
    hi: 'कुल समीक्षाएं',
    kn: 'ಒಟ್ಟು ವಿಮರ್ಶೆಗಳು',
  },
  'pending_review': {
    en: 'Pending review',
    hi: 'लंबित समीक्षा',
    kn: 'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ',
  },
  'submissions_waiting': {
    en: 'Submissions waiting on a validator',
    hi: 'एक वैलिडेटर की प्रतीक्षा में प्रस्तुतियाँ',
    kn: 'ಮೌಲ್ಯಮಾಪಕರಿಗಾಗಿ ಕಾಯುತ್ತಿರುವ ಸಲ್ಲಿಕೆಗಳು',
  },
  'open': {
    en: 'open',
    hi: 'खुला',
    kn: 'ತೆರೆದಿದೆ',
  },
  'review': {
    en: 'Review',
    hi: 'समीक्षा करें',
    kn: 'ಪರಿಶೀಲಿಸಿ',
  },
  'all_caught_up': {
    en: 'All caught up',
    hi: 'सब पूरा हो गया',
    kn: 'ಎಲ್ಲಾ ಪೂರ್ಣಗೊಂಡಿದೆ',
  },
  'no_pending_submissions': {
    en: 'No pending submissions right now',
    hi: 'अभी कोई लंबित प्रस्तुति नहीं है',
    kn: 'ಈಗ ಯಾವುದೇ ಬಾಕಿ ಸಲ್ಲಿಕೆಗಳಿಲ್ಲ',
  },
  'recently_approved': {
    en: 'Recently approved',
    hi: 'हाल ही में स्वीकृत',
    kn: 'ಇತ್ತೀಚೆಗೆ ಅನುಮೋದಿಸಲಾಗಿದೆ',
  },
  'back_to_dashboard': {
    en: 'Back to dashboard',
    hi: 'डैशबोर्ड पर वापस जाएं',
    kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
  },
  'reviewing': {
    en: 'Reviewing',
    hi: 'समीक्षा हो रही है',
    kn: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ',
  },
  'technical_skill_desc': {
    en: 'Technical skill demonstrated',
    hi: 'प्रदर्शित तकनीकी कौशल',
    kn: 'ಪ್ರದರ್ಶಿಸಲಾದ ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯ',
  },
  'professionalism': {
    en: 'Professionalism',
    hi: 'व्यावसायिकता',
    kn: 'ವೃತ್ತಿಪರತೆ',
  },
  'professionalism_desc': {
    en: 'Presentation and clarity',
    hi: 'प्रस्तुति और स्पष्टता',
    kn: 'ಪ್ರಸ್ತುತಿ ಮತ್ತು ಸ್ಪಷ್ಟತೆ',
  },
  'decline': {
    en: 'Decline',
    hi: 'अस्वीकार करें',
    kn: 'ತಿರಸ್ಕರಿಸಿ',
  },
  'accept_and_mint': {
    en: 'Accept & mint certificate',
    hi: 'स्वीकार करें और प्रमाणपत्र मिंट करें',
    kn: 'ಸ್ವೀಕರಿಸಿ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿ',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
