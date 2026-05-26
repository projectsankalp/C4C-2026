const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir);
}

const utilsDir = path.join(__dirname, 'utils');
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir);
}

const en = {
  "login": {
    "title": "ASHA+",
    "subtitle": "Empowering rural healthcare",
    "username": "Username",
    "password": "Password",
    "show": "Show",
    "hide": "Hide",
    "btn": "Login",
    "forgot": "Forgot Password?",
    "error_fill": "Please fill all fields",
    "error_conn": "Unable to connect to the server",
    "error_cred": "Invalid credentials"
  },
  "dashboard": {
    "greeting": "ASHA Worker",
    "dashboard": "Dashboard",
    "new_patient": "New Patient",
    "patient_list": "Patient List",
    "survey_forms": "Survey Forms",
    "visits": "Visits",
    "profile": "Profile",
    "sync": "Sync Data",
    "logout": "Logout",
    "health_summary": "Health Summary",
    "total_families": "Total Families",
    "high_risk": "High Risk",
    "quick_actions": "Quick Actions",
    "add_patient": "Add Patient",
    "start_survey": "Start Survey",
    "view_records": "View Records",
    "recent_activity": "Recent Activity",
    "activity_1": "Added new family in Sector 4",
    "activity_2": "Completed ANC visit for Priya"
  },
  "add_patient": {
    "title": "Add Patient",
    "full_name": "Full Name",
    "name_placeholder": "Enter patient name",
    "address": "Address",
    "house_no": "House No",
    "street_name": "Street Name",
    "village": "Village",
    "district": "District",
    "state": "State",
    "zip_code": "ZIP Code",
    "preview": "Full Address Preview",
    "gender": "Gender",
    "male": "Male",
    "female": "Female",
    "other": "Other",
    "dob": "Date of Birth",
    "dob_placeholder": "DD-MM-YYYY",
    "mobile": "Mobile Number",
    "mobile_placeholder": "Enter mobile number",
    "generate_id": "Generate Patient ID",
    "health_id": "Patient Health ID"
  },
  "patient_list": {
    "title": "Patient Details",
    "search_name": "Search by name",
    "search_village": "Search by village",
    "search_risk": "Search by risk",
    "filter_name": "Name",
    "filter_village": "Village",
    "filter_risk": "Risk",
    "loading": "Loading saved patients...",
    "no_patients": "No saved patients found.",
    "no_address": "No address saved",
    "show_card": "Show Card",
    "print_card": "Print Card",
    "card_title": "ASHA+",
    "card_subtitle": "Community Health Card",
    "verified": "ASHA Worker Verified"
  },
  "survey": {
    "title": "Health Survey",
    "scan_qr": "Scan QR Code",
    "health_id": "Patient Health ID",
    "health_id_placeholder": "Enter 14-digit Health ID",
    "scan_btn": "Scan Card",
    "info": "General Health Information",
    "bp": "Blood Pressure (mmHg)",
    "bp_placeholder": "E.g. 120/80",
    "sugar": "Blood Sugar (mg/dL)",
    "sugar_placeholder": "E.g. 110",
    "weight": "Weight (kg)",
    "weight_placeholder": "E.g. 65",
    "save": "Save Health Record"
  },
  "visits": {
    "title": "Field Visits",
    "schedule_title": "Schedule Visit",
    "select_patient": "Select Patient",
    "search_patients": "Search patients...",
    "no_found": "No patients found",
    "reason": "Visit Reason",
    "reason_placeholder": "E.g. Regular Checkup, ANC, Vaccination",
    "datetime": "Date & Time",
    "schedule_btn": "Schedule",
    "upcoming": "Upcoming Visits",
    "no_upcoming": "You have no upcoming visits scheduled."
  },
  "settings": {
    "personal_info": "Personal Information",
    "settings": "Settings",
    "dark_mode": "Dark Mode",
    "language": "Language",
    "notifications": "Notifications",
    "logout": "Logout",
    "sync_title": "Offline Sync",
    "pending": "records pending sync",
    "last_synced": "Last synced: 2 hours ago",
    "sync_now": "Sync Now"
  }
};

const ml = {
  "login": {
    "title": "ആശാ+",
    "subtitle": "ഗ്രാമീണ ആരോഗ്യ സംരക്ഷണം",
    "username": "ഉപയോക്തൃനാമം",
    "password": "പാസ്സ്‌വേർഡ്",
    "show": "കാണിക്കുക",
    "hide": "മറയ്ക്കുക",
    "btn": "ലോഗിൻ ചെയ്യുക",
    "forgot": "പാസ്‌വേഡ് മറന്നോ?",
    "error_fill": "എല്ലാ വിവരങ്ങളും നൽകുക",
    "error_conn": "സെർവറുമായി ബന്ധിപ്പിക്കാൻ കഴിയുന്നില്ല",
    "error_cred": "തെറ്റായ വിവരങ്ങൾ"
  },
  "dashboard": {
    "greeting": "ആശാ വർക്കർ",
    "dashboard": "ഡാഷ്ബോർഡ്",
    "new_patient": "പുതിയ രോഗി",
    "patient_list": "രോഗികളുടെ പട്ടിക",
    "survey_forms": "സർവേ ഫോമുകൾ",
    "visits": "സന്ദർശനങ്ങൾ",
    "profile": "പ്രൊഫൈൽ",
    "sync": "ഡാറ്റ സിങ്ക്",
    "logout": "പുറത്തുകടക്കുക",
    "health_summary": "ആരോഗ്യ സംഗ്രഹം",
    "total_families": "ആകെ കുടുംബങ്ങൾ",
    "high_risk": "ഉയർന്ന അപകടസാധ്യത",
    "quick_actions": "പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ",
    "add_patient": "രോഗിയെ ചേർക്കുക",
    "start_survey": "സർവേ ആരംഭിക്കുക",
    "view_records": "രേഖകൾ കാണുക",
    "recent_activity": "സമീപകാല പ്രവർത്തനങ്ങൾ",
    "activity_1": "സെക്ടർ 4-ൽ പുതിയ കുടുംബത്തെ ചേർത്തു",
    "activity_2": "പ്രിയയുടെ എഎൻസി സന്ദർശനം പൂർത്തിയായി"
  },
  "add_patient": {
    "title": "രോഗിയെ ചേർക്കുക",
    "full_name": "പൂർണ്ണ നാമം",
    "name_placeholder": "രോഗിയുടെ പേര് നൽകുക",
    "address": "വിലാസം",
    "house_no": "വീട്ടു നമ്പർ",
    "street_name": "തെരുവ്",
    "village": "ഗ്രാമം",
    "district": "ജില്ല",
    "state": "സംസ്ഥാനം",
    "zip_code": "പിൻ കോഡ്",
    "preview": "വിലാസം പ്രിവ്യൂ",
    "gender": "ലിംഗം",
    "male": "പുരുഷൻ",
    "female": "സ്ത്രീ",
    "other": "മറ്റുള്ളവ",
    "dob": "ജനനത്തീയതി",
    "dob_placeholder": "DD-MM-YYYY",
    "mobile": "മൊബൈൽ നമ്പർ",
    "mobile_placeholder": "മൊബൈൽ നമ്പർ നൽകുക",
    "generate_id": "രോഗി ഐഡി സൃഷ്ടിക്കുക",
    "health_id": "രോഗിയുടെ ഹെൽത്ത് ഐഡി"
  },
  "patient_list": {
    "title": "രോഗിയുടെ വിവരങ്ങൾ",
    "search_name": "പേര് ഉപയോഗിച്ച് തിരയുക",
    "search_village": "ഗ്രാമം ഉപയോഗിച്ച് തിരയുക",
    "search_risk": "അപകടസാധ്യത ഉപയോഗിച്ച് തിരയുക",
    "filter_name": "പേര്",
    "filter_village": "ഗ്രാമം",
    "filter_risk": "അപകടസാധ്യത",
    "loading": "രോഗികളെ ലോഡ് ചെയ്യുന്നു...",
    "no_patients": "സേവ് ചെയ്ത രോഗികളില്ല.",
    "no_address": "വിലാസം നൽകിയിട്ടില്ല",
    "show_card": "കാർഡ് കാണിക്കുക",
    "print_card": "കാർഡ് പ്രിൻ്റ് ചെയ്യുക",
    "card_title": "ആശാ+",
    "card_subtitle": "കമ്മ്യൂണിറ്റി ഹെൽത്ത് കാർഡ്",
    "verified": "ആശാ വർക്കർ പരിശോധിച്ചത്"
  },
  "survey": {
    "title": "ആരോഗ്യ സർവേ",
    "scan_qr": "QR കോഡ് സ്കാൻ ചെയ്യുക",
    "health_id": "രോഗിയുടെ ഹെൽത്ത് ഐഡി",
    "health_id_placeholder": "14 അക്ക ഹെൽത്ത് ഐഡി നൽകുക",
    "scan_btn": "കാർഡ് സ്കാൻ ചെയ്യുക",
    "info": "പൊതുവായ ആരോഗ്യ വിവരങ്ങൾ",
    "bp": "രക്തസമ്മർദ്ദം (mmHg)",
    "bp_placeholder": "ഉദാ: 120/80",
    "sugar": "രക്തത്തിലെ പഞ്ചസാര (mg/dL)",
    "sugar_placeholder": "ഉദാ: 110",
    "weight": "ഭാരം (kg)",
    "weight_placeholder": "ഉദാ: 65",
    "save": "ആരോഗ്യ രേഖ സംരക്ഷിക്കുക"
  },
  "visits": {
    "title": "ഫീൽഡ് സന്ദർശനങ്ങൾ",
    "schedule_title": "സന്ദർശനം ഷെഡ്യൂൾ ചെയ്യുക",
    "select_patient": "രോഗിയെ തിരഞ്ഞെടുക്കുക",
    "search_patients": "രോഗികളെ തിരയുക...",
    "no_found": "രോഗികളെ കണ്ടെത്തിയില്ല",
    "reason": "സന്ദർശന കാരണം",
    "reason_placeholder": "ഉദാ: പരിശോധന, പ്രതിരോധ കുത്തിവയ്പ്പ്",
    "datetime": "തീയതിയും സമയവും",
    "schedule_btn": "ഷെഡ്യൂൾ",
    "upcoming": "വരാനിരിക്കുന്ന സന്ദർശനങ്ങൾ",
    "no_upcoming": "വരാനിരിക്കുന്ന സന്ദർശനങ്ങൾ ഇല്ല."
  },
  "settings": {
    "personal_info": "വ്യക്തിഗത വിവരങ്ങൾ",
    "settings": "ക്രമീകരണങ്ങൾ",
    "dark_mode": "ഡാർക്ക് മോഡ്",
    "language": "ഭാഷ",
    "notifications": "അറിയിപ്പുകൾ",
    "logout": "പുറത്തുകടക്കുക",
    "sync_title": "ഓഫ്‌ലൈൻ സിങ്ക്",
    "pending": "രേഖകൾ സിങ്ക് ചെയ്യാൻ ബാക്കിയുണ്ട്",
    "last_synced": "അവസാനം സിങ്ക് ചെയ്തത്: 2 മണിക്കൂർ മുൻപ്",
    "sync_now": "ഇപ്പോൾ സിങ്ക് ചെയ്യുക"
  }
};

const kn = {
  "login": {
    "title": "ಆಶಾ+",
    "subtitle": "ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
    "username": "ಬಳಕೆದಾರ ಹೆಸರು",
    "password": "ಪಾಸ್ವರ್ಡ್",
    "show": "ತೋರಿಸು",
    "hide": "ಮರೆಮಾಡು",
    "btn": "ಲಾಗಿನ್",
    "forgot": "ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ?",
    "error_fill": "ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ",
    "error_conn": "ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ",
    "error_cred": "ತಪ್ಪಾದ ರುಜುವಾತುಗಳು"
  },
  "dashboard": {
    "greeting": "ಆಶಾ ಕಾರ್ಯಕರ್ತೆ",
    "dashboard": "ಡ್ಯಾಶ್ಬೋರ್ಡ್",
    "new_patient": "ಹೊಸ ರೋಗಿ",
    "patient_list": "ರೋಗಿಗಳ ಪಟ್ಟಿ",
    "survey_forms": "ಸಮೀಕ್ಷೆ ಫಾರ್ಮ್ಗಳು",
    "visits": "ಭೇಟಿಗಳು",
    "profile": "ಪ್ರೊಫೈಲ್",
    "sync": "ಡೇಟಾ ಸಿಂಕ್",
    "logout": "ಲಾಗೌಟ್",
    "health_summary": "ಆರೋಗ್ಯ ಸಾರಾಂಶ",
    "total_families": "ಒಟ್ಟು ಕುಟುಂಬಗಳು",
    "high_risk": "ಹೆಚ್ಚಿನ ಅಪಾಯ",
    "quick_actions": "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    "add_patient": "ರೋಗಿಯನ್ನು ಸೇರಿಸಿ",
    "start_survey": "ಸಮೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ",
    "view_records": "ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "recent_activity": "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು",
    "activity_1": "ಸೆಕ್ಟರ್ 4 ರಲ್ಲಿ ಹೊಸ ಕುಟುಂಬವನ್ನು ಸೇರಿಸಲಾಗಿದೆ",
    "activity_2": "ಪ್ರಿಯಾಗೆ ANC ಭೇಟಿ ಪೂರ್ಣಗೊಂಡಿದೆ"
  },
  "add_patient": {
    "title": "ರೋಗಿಯನ್ನು ಸೇರಿಸಿ",
    "full_name": "ಪೂರ್ಣ ಹೆಸರು",
    "name_placeholder": "ರೋಗಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "address": "ವಿಳಾಸ",
    "house_no": "ಮನೆ ಸಂಖ್ಯೆ",
    "street_name": "ರಸ್ತೆ ಹೆಸರು",
    "village": "ಗ್ರಾಮ",
    "district": "ಜಿಲ್ಲೆ",
    "state": "ರಾಜ್ಯ",
    "zip_code": "ಪಿನ್ ಕೋಡ್",
    "preview": "ವಿಳಾಸ ಮುನ್ನೋಟ",
    "gender": "ಲಿಂಗ",
    "male": "ಪುರುಷ",
    "female": "ಮಹಿಳೆ",
    "other": "ಇತರೆ",
    "dob": "ಹುಟ್ಟಿದ ದಿನಾಂಕ",
    "dob_placeholder": "DD-MM-YYYY",
    "mobile": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "mobile_placeholder": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ",
    "generate_id": "ರೋಗಿಯ ID ರಚಿಸಿ",
    "health_id": "ರೋಗಿಯ ಹೆಲ್ತ್ ಐಡಿ"
  },
  "patient_list": {
    "title": "ರೋಗಿಯ ವಿವರಗಳು",
    "search_name": "ಹೆಸರಿನಿಂದ ಹುಡುಕಿ",
    "search_village": "ಗ್ರಾಮದಿಂದ ಹುಡುಕಿ",
    "search_risk": "ಅಪಾಯದಿಂದ ಹುಡುಕಿ",
    "filter_name": "ಹೆಸರು",
    "filter_village": "ಗ್ರಾಮ",
    "filter_risk": "ಅಪಾಯ",
    "loading": "ರೋಗಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    "no_patients": "ಯಾವ ರೋಗಿಗಳೂ ಕಂಡುಬಂದಿಲ್ಲ.",
    "no_address": "ವಿಳಾಸವಿಲ್ಲ",
    "show_card": "ಕಾರ್ಡ್ ತೋರಿಸು",
    "print_card": "ಕಾರ್ಡ್ ಪ್ರಿಂಟ್ ಮಾಡಿ",
    "card_title": "ಆಶಾ+",
    "card_subtitle": "ಸಮುದಾಯ ಆರೋಗ್ಯ ಕಾರ್ಡ್",
    "verified": "ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಪರಿಶೀಲಿಸಿದ್ದಾರೆ"
  },
  "survey": {
    "title": "ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆ",
    "scan_qr": "QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "health_id": "ರೋಗಿಯ ಹೆಲ್ತ್ ಐಡಿ",
    "health_id_placeholder": "14-ಅಂಕಿಯ ಹೆಲ್ತ್ ಐಡಿ ನಮೂದಿಸಿ",
    "scan_btn": "ಕಾರ್ಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "info": "ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿ",
    "bp": "ರಕ್ತದೊತ್ತಡ (mmHg)",
    "bp_placeholder": "ಉದಾ: 120/80",
    "sugar": "ರಕ್ತದಲ್ಲಿನ ಸಕ್ಕರೆ (mg/dL)",
    "sugar_placeholder": "ಉದಾ: 110",
    "weight": "ತೂಕ (kg)",
    "weight_placeholder": "ಉದಾ: 65",
    "save": "ಆರೋಗ್ಯ ದಾಖಲೆಯನ್ನು ಉಳಿಸಿ"
  },
  "visits": {
    "title": "ಕ್ಷೇತ್ರ ಭೇಟಿಗಳು",
    "schedule_title": "ಭೇಟಿಯನ್ನು ನಿಗದಿಪಡಿಸಿ",
    "select_patient": "ರೋಗಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "search_patients": "ರೋಗಿಗಳನ್ನು ಹುಡುಕಿ...",
    "no_found": "ಯಾವ ರೋಗಿಗಳೂ ಕಂಡುಬಂದಿಲ್ಲ",
    "reason": "ಭೇಟಿಗೆ ಕಾರಣ",
    "reason_placeholder": "ಉದಾ: ತಪಾಸಣೆ, ಲಸಿಕೆ",
    "datetime": "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",
    "schedule_btn": "ನಿಗದಿಪಡಿಸಿ",
    "upcoming": "ಮುಂಬರುವ ಭೇಟಿಗಳು",
    "no_upcoming": "ಯಾವುದೇ ಮುಂಬರುವ ಭೇಟಿಗಳಿಲ್ಲ."
  },
  "settings": {
    "personal_info": "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
    "settings": "ಸೆಟ್ಟಿಂಗ್ಗಳು",
    "dark_mode": "ಡಾರ್ಕ್ ಮೋಡ್",
    "language": "ಭಾಷೆ",
    "notifications": "ಸೂಚನೆಗಳು",
    "logout": "ಲಾಗೌಟ್",
    "sync_title": "ಆಫ್ಲೈನ್ ಸಿಂಕ್",
    "pending": "ದಾಖಲೆಗಳು ಸಿಂಕ್ ಆಗಬೇಕಿದೆ",
    "last_synced": "ಕೊನೆಯ ಸಿಂಕ್: 2 ಗಂಟೆಗಳ ಹಿಂದೆ",
    "sync_now": "ಈಗ ಸಿಂಕ್ ಮಾಡಿ"
  }
};

fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(en, null, 2));
fs.writeFileSync(path.join(localesDir, 'ml.json'), JSON.stringify(ml, null, 2));
fs.writeFileSync(path.join(localesDir, 'kn.json'), JSON.stringify(kn, null, 2));

const i18nCode = `import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from '../locales/en.json';
import ml from '../locales/ml.json';
import kn from '../locales/kn.json';

const resources = {
  en: { translation: en },
  ml: { translation: ml },
  kn: { translation: kn },
};

const initI18n = async () => {
  let savedLanguage = await SecureStore.getItemAsync('language');

  if (!savedLanguage) {
    const deviceLocales = Localization.getLocales();
    if (deviceLocales && deviceLocales.length > 0) {
      savedLanguage = deviceLocales[0].languageCode;
    }
  }

  // Fallback to English if the language is not supported
  if (!['en', 'ml', 'kn'].includes(savedLanguage || '')) {
    savedLanguage = 'en';
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4', // Crucial for React Native
    resources,
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  });
};

initI18n();

export default i18n;
`;

fs.writeFileSync(path.join(utilsDir, 'i18n.ts'), i18nCode);
