const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PATIENTS_FILE = path.join(__dirname, 'patients.json');

// In-memory logs & OTP store
const otps = {};
const smsLogs = [];

// Helper: load patients from json database
function loadPatients() {
  try {
    if (!fs.existsSync(PATIENTS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(PATIENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading patients:', error);
    return [];
  }
}

// Helper: save patients to json database
function savePatients(patients) {
  try {
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patients, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving patients:', error);
    return false;
  }
}

// Helper: Map risk levels and classifications to regional languages for natural speech synthesis
const translations = {
  en: {
    risk: { LOW: 'Low', MODERATE: 'Moderate', HIGH: 'High', VERY_HIGH: 'Very High' },
    bp: {
      'Normal': 'Normal Blood Pressure',
      'Elevated Blood Pressure': 'Elevated Blood Pressure',
      'Stage 1 Hypertension': 'Stage 1 Hypertension',
      'Stage 2 Hypertension': 'Stage 2 Hypertension'
    },
    glucose: {
      'Normal': 'Normal range',
      'Normal range': 'Normal range',
      'Prediabetes': 'Prediabetes range',
      'Prediabetes range': 'Prediabetes range',
      'Diabetic range': 'Diabetic range'
    }
  },
  hi: {
    risk: { LOW: 'कम यानी लो', MODERATE: 'मध्यम यानी मॉडरेट', HIGH: 'उच्च यानी हाई', VERY_HIGH: 'अत्यधिक उच्च यानी वेरी हाई' },
    bp: {
      'Normal': 'सामान्य रक्तचाप',
      'Elevated Blood Pressure': 'बढ़ा हुआ रक्तचाप',
      'Stage 1 Hypertension': 'स्टेज एक उच्च रक्तचाप',
      'Stage 2 Hypertension': 'स्टेज दो उच्च रक्तचाप'
    },
    glucose: {
      'Normal': 'सामान्य श्रेणी',
      'Normal range': 'सामान्य श्रेणी',
      'Prediabetes': 'प्री-डायबिटीज यानी मधुमेह की शुरुआती श्रेणी',
      'Prediabetes range': 'प्री-डायबिटीज यानी मधुमेह की शुरुआती श्रेणी',
      'Diabetic range': 'मधुमेह यानी डायबिटीज की श्रेणी'
    }
  },
  kn: {
    risk: { LOW: 'ಕಡಿಮೆ', MODERATE: 'ಮಧ್ಯಮ', HIGH: 'ಹೆಚ್ಚು', VERY_HIGH: 'ಅತಿ ಹೆಚ್ಚು' },
    bp: {
      'Normal': 'ಸಾಮಾನ್ಯ ರಕ್ತದೊತ್ತಡ',
      'Elevated Blood Pressure': 'ಹೆಚ್ಚಿದ ರಕ್ತದೊತ್ತಡ',
      'Stage 1 Hypertension': 'ಹಂತ ಒಂದು ರಕ್ತದೊತ್ತಡ',
      'Stage 2 Hypertension': 'ಹಂತ ಎರಡು ತೀವ್ರ ರಕ್ತದೊತ್ತಡ'
    },
    glucose: {
      'Normal': 'ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿ',
      'Normal range': 'ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿ',
      'Prediabetes': 'ಮಧುಮೇಹ ಪೂರ್ವದ ವ್ಯಾಪ್ತಿ',
      'Prediabetes range': 'ಮಧುಮೇಹ ಪೂರ್ವದ ವ್ಯಾಪ್ತಿ',
      'Diabetic range': 'ಮಧುಮೇಹದ ತೀವ್ರ ವ್ಯಾಪ್ತಿ'
    }
  },
  ta: {
    risk: { LOW: 'குறைந்த', MODERATE: 'நடுத்தர', HIGH: 'அதிக', VERY_HIGH: 'மிக அதிக' },
    bp: {
      'Normal': 'சாதாரண இரத்த அழுத்தம்',
      'Elevated Blood Pressure': 'அதிகரித்த இரத்த அழுத்தம்',
      'Stage 1 Hypertension': 'நிலை ஒன்று உயர் இரத்த அழுத்தம்',
      'Stage 2 Hypertension': 'நிலை இரண்டு உயர் இரத்த அழுத்தம்'
    },
    glucose: {
      'Normal': 'சாதாரண அளவு',
      'Normal range': 'சாதாரண அளவு',
      'Prediabetes': 'ஆரம்ப நீரிழிவு பிரிவு',
      'Prediabetes range': 'ஆரம்ப நீரிழிவு பிரிவு',
      'Diabetic range': 'நீரிழிவு நோய் பிரிவு'
    }
  },
  te: {
    risk: { LOW: 'తక్కువ', MODERATE: 'మధ్యస్థ', HIGH: 'ఎక్కువ', VERY_HIGH: 'చాలా ఎక్కువ' },
    bp: {
      'Normal': 'సాధారణ రక్తపోటు',
      'Elevated Blood Pressure': 'పెరిగిన రక్తపోటు',
      'Stage 1 Hypertension': 'స్టేజ్ ఒకటి అధిక రక్తపోటు',
      'Stage 2 Hypertension': 'స్టేజ్ రెండు అధిక రక్తపోటు'
    },
    glucose: {
      'Normal': 'సాధారణ పరిధి',
      'Normal range': 'సాధారణ పరిధి',
      'Prediabetes': 'ప్రీ-డయాబెటిస్ పరిధి',
      'Prediabetes range': 'ప్రీ-డయాబెటిస్ పరిధి',
      'Diabetic range': 'మధుమేహం పరిధి'
    }
  }
};

// Generates highly optimized spoken scripts for all 5 languages
function generateMultilingualReport(patient) {
  const s = patient.latestScreening;
  const name = patient.name;
  const village = patient.village;
  const systolic = s.systolicBP;
  const diastolic = s.diastolicBP;
  const glucose = s.glucose;
  const risk = patient.riskLevel;
  
  // BP Translation helpers
  const getBpClass = (lang) => translations[lang].bp[s.bpClassification] || s.bpClassification;
  const getGlucoseClass = (lang) => translations[lang].glucose[s.glucoseClassification] || s.glucoseClassification;
  const getRisk = (lang) => translations[lang].risk[risk] || risk;
  
  // Custom recommendations if needed, otherwise use the database recommendation
  const rec = s.recommendation;

  return {
    en: `Hello ${name}, from ${village} village. Your latest health screening from GraamSehat indicates a ${getRisk('en')} risk level. Your blood pressure is ${systolic} over ${diastolic}, which is classified as ${getBpClass('en')}. Your random blood sugar is ${glucose} milligrams per deciliter, which is classified as ${getGlucoseClass('en')}. Our health recommendation is: ${rec} Thank you for using GraamSehat.`,
    
    hi: `नमस्ते ${name}, गाँव ${village} से। ग्रामसेहत की आपकी नवीनतम स्वास्थ्य जाँच ${getRisk('hi')} जोखिम स्तर दर्शाती है। आपका रक्तचाप ${systolic} और ${diastolic} है, जो ${getBpClass('hi')} है। आपकी ब्लड शुगर ${glucose} मिलीग्राम प्रति डेसीलीटर है, जो ${getGlucoseClass('hi')} है। हमारी सलाह है: ${rec} ग्रामसेहत की तरफ से धन्यवाद।`,
    
    kn: `ನಮಸ್ಕಾರ ${name}, ${village} ಗ್ರಾಮದವರು. ಗ್ರಾಮಸೇಹತ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಆರೋಗ್ಯ ತಪಾಸಣೆಯು ${getRisk('kn')} ಅಪಾಯದ ಮಟ್ಟವನ್ನು ತೋರಿಸುತ್ತದೆ. ನಿಮ್ಮ ರಕ್ತದೊತ್ತಡ ${systolic} ಮತ್ತು ${diastolic} ಆಗಿದೆ, ಇದನ್ನು ${getBpClass('kn')} ಎಂದು ವರ್ಗೀಕರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ರಕ್ತದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ${glucose} ಮಿಲಿಗ್ರಾಂ ಆಗಿದೆ, ಇದು ${getGlucoseClass('kn')} ನಲ್ಲಿದೆ. ನಮ್ಮ ಶಿಫಾರಸು ಏನೆಂದರೆ: ${rec} ಗ್ರಾಮಸೇಹತ್ ಬಳಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.`,
    
    ta: `வணக்கம் ${name}, ${village} கிராமத்தைச் சேர்ந்தவர். கிராம்சேஹத்தின் உங்கள் சமீபத்திய சுகாதார சோதனை ${getRisk('ta')} அபாய அளவைக் காட்டுகிறது. உங்கள் இரத்த அழுத்தம் ${systolic} மற்றும் ${diastolic} ஆகும், இது ${getBpClass('ta')} என வகைப்படுத்தப்பட்டுள்ளது. உங்கள் இரத்த சர்க்கரை ${glucose} மில்லிகிராம் ஆகும், இது ${getGlucoseClass('ta')} ஆகும். எங்களது பரிந்துரை: ${rec} கிராம்சேஹத் பயன்படுத்தியதற்கு நன்றி.`,
    
    te: `నమస్కారం ${name}, ${village} గ్రామస్థులు. గ్రామసేహత్‌లోని మీ తాజా ఆరోగ్య పరీక్ష ${getRisk('te')} ప్రమాద స్థాయిని సూచిస్తుంది. మీ రక్తపోటు ${systolic} మరియు ${diastolic} ఉంది, ఇది ${getBpClass('te')} గా వర్గీకరించబడింది. మీ రక్తంలో చక్కెర స్థాయి ${glucose} మిల్లీగ్రాములు ఉంది, ఇది ${getGlucoseClass('te')} గా ఉంది. మా సిఫార్సు ఏమనగా: ${rec} గ్రామసేహత్ ఉపయోగించినందుకు ధన్యవాదాలు.`
  };
}

// Helper: Generates readable SMS text
function generateSMSReport(patient, lang) {
  const s = patient.latestScreening;
  const bp = `${s.systolicBP}/${s.diastolicBP}`;
  const sugar = `${s.glucose} mg/dL`;
  const rec = s.recommendation;
  
  const smsTexts = {
    en: `GraamSehat: Hello ${patient.name}. Your screening report: BP is ${bp} (${s.bpClassification}). Blood Sugar is ${sugar} (${s.glucoseClassification}). Risk Level: ${patient.riskLevel}. Recommendation: ${rec}`,
    hi: `ग्रामसेहत: नमस्ते ${patient.name}। आपकी जाँच रिपोर्ट: बीपी ${bp} (${translations.hi.bp[s.bpClassification] || s.bpClassification}) है। ब्लड शुगर ${sugar} है। जोखिम स्तर: ${patient.riskLevel}। सलाह: ${rec}`,
    kn: `ಗ್ರಾಮಸೇಹತ್: ನಮಸ್ಕಾರ ${patient.name}. ನಿಮ್ಮ ವರದಿ: ರಕ್ತದೊತ್ತಡ ${bp} ಆಗಿದೆ. ರಕ್ತದ ಸಕ್ಕರೆ ${sugar} ಆಗಿದೆ. ಅಪಾಯದ ಮಟ್ಟ: ${patient.riskLevel}. ಶಿಫಾರಸು: ${rec}`,
    ta: `கிராம்சேஹத்: வணக்கம் ${patient.name}. உங்கள் அறிக்கை: இரத்த அழுத்தம் ${bp} ஆகும். இரத்த சர்க்கரை ${sugar} ஆகும். அபாய நிலை: ${patient.riskLevel}. பரிந்துரை: ${rec}`,
    te: `గ్రామసేహత్: నమస్కారం ${patient.name}. మీ నివేదిక: రక్తపోటు ${bp} ఉంది. రక్తంలో చక్కెర ${sugar} ఉంది. ప్రమాద స్థాయి: ${patient.riskLevel}. సిఫార్సు: ${rec}`
  };
  
  return smsTexts[lang] || smsTexts.en;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. POST /send-otp
// Accepts phone number and generates verification code
app.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, error: 'Invalid 10-digit phone number' });
  }

  // Hardcoded OTP system - default is always "123456" for offline demo ease
  const otp = '123456';
  otps[phone] = otp;

  // Simulate sending SMS via logs
  const logEntry = {
    id: 'SMS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    phone,
    timestamp: new Date().toISOString(),
    message: `[SMS SIMULATION] GraamSehat Verification OTP is: ${otp}. Valid for 10 minutes.`,
    type: 'SMS_OTP'
  };
  smsLogs.unshift(logEntry);

  console.log(`[SMS SIMULATION] Sent OTP '123456' to ${phone}`);

  res.json({
    success: true,
    message: `OTP simulated and sent successfully to ${phone}`,
    otp
  });
});

// 2. POST /verify-otp
// Verifies OTP code for simulated logins
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
  }

  const storedOtp = otps[phone];
  
  // Allow "123456" as universal hardcoded OTP for demo fallback
  if (otp === '123456' || (storedOtp && storedOtp === otp)) {
    delete otps[phone]; // Consume OTP
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      token: 'mock-session-token-' + Math.random().toString(36).substr(2, 9)
    });
  } else {
    res.status(400).json({ success: false, error: 'Invalid or expired OTP code' });
  }
});

// 3. POST /ivr-access
// Accepts Patient UID (string, numeric, or phone), fetches patient details, 
// generates multilingual TTS-ready responses and returns IVR text and triggers SMS
app.post('/ivr-access', (req, res) => {
  const { uid, dtmfDigit } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, error: 'Patient ID, numeric ID, or phone is required' });
  }

  const patients = loadPatients();
  
  // Robust matching: ID, numeric suffix, full numeric ID, or phone
  const patient = patients.find(p => 
    p.id.toLowerCase() === uid.toLowerCase() ||
    p.numericId === uid ||
    p.id.replace('GS-', '') === uid ||
    p.phone === uid
  );

  if (!patient) {
    // Log failed call attempt
    const failLog = {
      id: 'IVR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      phone: uid,
      timestamp: new Date().toISOString(),
      message: `[IVR CALL FAIL] Attempted IVR access for non-existent patient/UID: ${uid}`,
      type: 'IVR_FAIL'
    };
    smsLogs.unshift(failLog);
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  // Generate multilingual TTS outputs
  const ivrText = generateMultilingualReport(patient);

  let selectedLanguage = null;
  let activeText = '';
  let smsSimulated = null;

  const langMap = {
    '1': { code: 'en', name: 'English' },
    '2': { code: 'hi', name: 'Hindi' },
    '3': { code: 'kn', name: 'Kannada' },
    '4': { code: 'ta', name: 'Tamil' },
    '5': { code: 'te', name: 'Telugu' }
  };

  // If a DTMF digit is provided, handle active call center selection
  if (dtmfDigit && langMap[dtmfDigit]) {
    const lang = langMap[dtmfDigit];
    selectedLanguage = lang.name;
    activeText = ivrText[lang.code];

    // Trigger SMS dispatch upon IVR prompt completion
    const smsMessage = generateSMSReport(patient, lang.code);
    smsSimulated = {
      phone: patient.phone,
      text: smsMessage
    };

    const smsLog = {
      id: 'SMS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      phone: patient.phone,
      patientName: patient.name,
      timestamp: new Date().toISOString(),
      message: smsMessage,
      type: 'SMS_REPORT',
      language: lang.name
    };
    smsLogs.unshift(smsLog);

    console.log(`[SMS SIMULATION] Sent offline report to ${patient.phone} in ${lang.name}`);
  }

  // Log successful IVR call
  const callLog = {
    id: 'IVR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    phone: patient.phone,
    patientName: patient.name,
    timestamp: new Date().toISOString(),
    message: `[IVR CALL SUCCESS] Patient ${patient.name} (${patient.id}) called IVR. Selected language DTMF: ${dtmfDigit || 'None'} (${selectedLanguage || 'Waiting...'})`,
    type: 'IVR_CALL',
    language: selectedLanguage || 'None'
  };
  smsLogs.unshift(callLog);

  res.json({
    success: true,
    patient,
    ivr: ivrText,
    selectedLanguage,
    activeText,
    smsSimulated
  });
});

// 4. POST /send-report
// Direct backend API to dispatch Simulated SMS reports manually
app.post('/send-report', (req, res) => {
  const { uid, language } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, error: 'Patient ID or phone number is required' });
  }

  const patients = loadPatients();
  const patient = patients.find(p => 
    p.id.toLowerCase() === uid.toLowerCase() ||
    p.numericId === uid ||
    p.id.replace('GS-', '') === uid ||
    p.phone === uid
  );

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  const langCode = ['en', 'hi', 'kn', 'ta', 'te'].includes(language) ? language : 'en';
  const smsMessage = generateSMSReport(patient, langCode);
  const langName = langCode === 'en' ? 'English' : langCode === 'hi' ? 'Hindi' : langCode === 'kn' ? 'Kannada' : langCode === 'ta' ? 'Tamil' : 'Telugu';

  const logEntry = {
    id: 'SMS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    phone: patient.phone,
    patientName: patient.name,
    timestamp: new Date().toISOString(),
    message: smsMessage,
    type: 'SMS_REPORT',
    language: langName
  };
  smsLogs.unshift(logEntry);

  res.json({
    success: true,
    message: `Simulated SMS report dispatched successfully to ${patient.phone}`,
    smsSimulated: {
      phone: patient.phone,
      text: smsMessage
    }
  });
});

// ----------------------------------------------------
// SYSTEM MANAGEMENT / INTEGRATIVE ENDPOINTS (FOR MOCK WEB UI)
// ----------------------------------------------------

// GET /api/patients - load patients list
app.get('/api/patients', (req, res) => {
  res.json(loadPatients());
});

// POST /api/patients - add/update patient dynamically
app.post('/api/patients', (req, res) => {
  const { name, age, gender, village, phone, familyPhone, systolicBP, diastolicBP, glucose, idrsScore, bpClassification, glucoseClassification, riskLevel, recommendation } = req.body;
  
  if (!name || !age || !gender || !village || !phone || !systolicBP || !diastolicBP || !glucose || !riskLevel) {
    return res.status(400).json({ success: false, error: 'Missing mandatory fields' });
  }

  const patients = loadPatients();
  
  // Auto generate IDs
  const maxNum = patients.reduce((max, p) => Math.max(max, parseInt(p.numericId) || 0), 100000);
  const nextNum = maxNum + 1;
  const newPatient = {
    id: `GS-${nextNum}`,
    numericId: String(nextNum),
    name,
    age: parseInt(age),
    gender,
    village,
    phone,
    familyPhone: familyPhone || "",
    familyHistoryDiabetes: req.body.familyHistoryDiabetes || false,
    familyHistoryHypertension: req.body.familyHistoryHypertension || false,
    onMedication: req.body.onMedication || false,
    riskLevel,
    latestScreening: {
      systolicBP: parseInt(systolicBP),
      diastolicBP: parseInt(diastolicBP),
      glucose: parseInt(glucose),
      idrsScore: parseInt(idrsScore || 40),
      bpClassification: bpClassification || 'Elevated Blood Pressure',
      glucoseClassification: glucoseClassification || 'Normal',
      reasons: [
        `BP ${systolicBP}/${diastolicBP} - ${bpClassification}`,
        `Glucose ${glucose} mg/dL - ${glucoseClassification}`
      ],
      recommendation: recommendation || 'Lifestyle modifications'
    }
  };

  patients.push(newPatient);
  if (savePatients(patients)) {
    res.json({ success: true, patient: newPatient });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write to JSON database' });
  }
});

// GET /api/logs - load dynamic simulated logs
app.get('/api/logs', (req, res) => {
  res.json(smsLogs);
});

// Start the server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`====================================================`);
  console.log(`🚀 GRAAMSEHAT STANDALONE COMMUNICATION LAYER`);
  console.log(`   Running offline in Hackathon Sandbox mode.`);
  console.log(`   Local Server URL: http://127.0.0.1:${PORT}`);
  console.log(`====================================================`);
});
