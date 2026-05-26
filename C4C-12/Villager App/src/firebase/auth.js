/**
 * src/firebase/auth.js
 * Handles Health ID lookups, simulated OTP delivery, and request logging.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseMock } from './config.js';

// ═══════════════════════════════════
// MOCK PATIENTS DATABASE (For Mock Mode & Offline Fallback)
// ═══════════════════════════════════
export const MOCK_PATIENTS = {
  '100008': {
    uid: '100008',
    name: 'Ramesh Kumar',
    village: 'Kengeri Village',
    district: 'Bangalore Urban',
    phone: 'XXXXXXX210',
    bloodGroup: 'O+',
    riskLevel: 'GREEN',
    lastScreeningDate: '2026-04-15',
    nextScreeningDate: '2026-10-15',
    bpSystolic: 118,
    bpDiastolic: 76,
    glucoseLevel: 95,
    idrsScore: 20,
    ashaWorkerName: 'Rupa Devi',
    ashaWorkerPhone: '9988776655',
    doctorsNote: {
      en: 'Your health looks good. Maintain your physical activity and low-sugar diet.',
      kn: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿದೆ. ನಿಮ್ಮ ದೈಹಿಕ ಚಟುವಟಿಕೆ ಮತ್ತು ಕಡಿಮೆ ಸಕ್ಕರೆ ಆಹಾರವನ್ನು ಮುಂದುವರಿಸಿ.',
      hi: 'आपका स्वास्थ्य अच्छा है। शारीरिक सक्रियता और कम चीनी वाला आहार बनाए रखें।',
      ta: 'உங்கள் உடல்நலம் நன்றாக உள்ளது. உடற்பயிற்சி மற்றும் குறைந்த சர்க்கரை உணவைத் தொடரவும்.',
      te: 'మీ ఆరోగ్యం బాగుంది. శారీరక శ్రమ మరియు తక్కువ చక్కర ఆహారం కొనసాగించండి.'
    },
    medicines: []
  },
  '100016': {
    uid: '100016',
    name: 'Lakshmi Gowda',
    village: 'Kengeri Village',
    district: 'Bangalore Urban',
    phone: 'XXXXXXX890',
    bloodGroup: 'A+',
    riskLevel: 'YELLOW',
    lastScreeningDate: '2026-05-10',
    nextScreeningDate: '2026-06-10',
    bpSystolic: 135,
    bpDiastolic: 85,
    glucoseLevel: 145,
    idrsScore: 45,
    ashaWorkerName: 'Rupa Devi',
    ashaWorkerPhone: '9988776655',
    doctorsNote: {
      en: 'Some attention needed. Visit the PHC within a month for confirmatory blood tests and monitor blood pressure weekly.',
      kn: 'ಸ್ವಲ್ಪ ಗಮನ ಅಗತ್ಯವಿದೆ. ದೃಢೀಕರಣ ರಕ್ತ ಪರೀಕ್ಷೆಗಳಿಗಾಗಿ ಒಂದು ತಿಂಗಳೊಳಗೆ ಪಿಎಚ್‌ಸಿಗೆ ಭೇಟಿ ನೀಡಿ ಮತ್ತು ವಾರಕ್ಕೊಮ್ಮೆ ರಕ್ತದೊತ್ತಡವನ್ನು ಪರೀಕ್ಷಿಸಿಕೊಳ್ಳಿ.',
      hi: 'कुछ ध्यान देने की आवश्यकता है। पुष्टि करने वाले रक्त परीक्षण के लिए एक महीने के भीतर पीएचसी जाएं और साप्ताहिक रूप से रक्तचाप की निगरानी करें।',
      ta: 'சிறிது கவனம் தேவை. ரத்தப் பரிசோதனைக்காக ஒரு மாதத்திற்குள் ஆரம்ப சுகாதார நிலையத்திற்குச் செல்லவும் மற்றும் வாரந்தோறும் இரத்த அழுத்தத்தை கண்காணிக்கவும்.',
      te: 'కొద్దిగా శ్రద్ధ అవసరం. రక్త పరీక్షల కొరకు నెల లోపు పిహెచ్‌సికి వెళ్ళండి మరియు ప్రతి వారం రక్తపోటును పరీక్షించుకోండి.'
    },
    medicines: [
      { id: 'metformin_500', name: 'Metformin 500mg', dose: '1 tablet daily with dinner', frequency: 'Daily' }
    ]
  },
  '100024': {
    uid: '100024',
    name: 'Basavaraj Patil',
    village: 'Kengeri Village',
    district: 'Bangalore Urban',
    phone: 'XXXXXXX789',
    bloodGroup: 'B+',
    riskLevel: 'RED',
    lastScreeningDate: '2026-05-25',
    nextScreeningDate: '2026-06-01',
    bpSystolic: 165,
    bpDiastolic: 102,
    glucoseLevel: 250,
    idrsScore: 70,
    ashaWorkerName: 'Rupa Devi',
    ashaWorkerPhone: '9988776655',
    doctorsNote: {
      en: 'Immediate action required. High Blood Pressure and Glucose levels. Please visit nearest PHC immediately for clinical assessment.',
      kn: 'ತಕ್ಷಣದ ಕ್ರಮದ ಅವಶ್ಯಕತೆಯಿದೆ. ರಕ್ತದೊತ್ತಡ ಮತ್ತು ಗ್ಲೂಕೋಸ್ ಮಟ್ಟ ಹೆಚ್ಚಾಗಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ಹತ್ತಿರದ ಪಿಎಚ್‌ಸಿಗೆ ಭೇಟಿ ನೀಡಿ.',
      hi: 'तत्काल कार्रवाई की आवश्यकता है। उच्च रक्तचाप और ग्लूकोज का स्तर। कृपया तुरंत निकटतम पीएचसी पर जाएं।',
      ta: 'உடனடி நடவடிக்கை தேவை. அதிக இரத்த அழுத்தம் மற்றும் சர்க்கரை அளவு உள்ளது. தயவுசெய்து உடனடியாக ஆரம்ப சுகாதார நிலையத்திற்குச் செல்லவும்.',
      te: 'వెంటనే చర్యలు చేపట్టాలి. అధిక రక్తపోటు మరియు గ్లూకోజ్ స్థాయిలు ఉన్నాయి. దయచేసి వెంటనే సమీప పిహెచ్‌సికి వెళ్ళండి.'
    },
    medicines: [
      { id: 'metformin_500', name: 'Metformin 500mg', dose: '1 tablet daily with dinner', frequency: 'Daily' },
      { id: 'amlodipine_5', name: 'Amlodipine 5mg', dose: '1 tablet daily in the morning', frequency: 'Daily' }
    ]
  }
};

/**
 * Checks if a patient UID exists in Firestore or locally in Mock mode.
 * @param {string} uid - 6-digit Health ID
 * @returns {Promise<Object|null>} Patient document or null if not found
 */
export async function checkPatientUID(uid) {
  if (isFirebaseMock) {
    console.log('[Mock Auth] Looking up UID:', uid);
    return MOCK_PATIENTS[uid] || null;
  }

  try {
    const docRef = doc(db, 'patients', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    // Fallback search in mock data if not found in Firestore (for ease of development/testing)
    return MOCK_PATIENTS[uid] || null;
  } catch (error) {
    console.error('Firestore lookup failed, falling back to local mocks:', error);
    return MOCK_PATIENTS[uid] || null;
  }
}

/**
 * Generates a simulated 6-digit OTP
 * @returns {string} 6-digit OTP code
 */
export function generateSimulatedOTP() {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Submits a request logging the unregistered UID to ASHA worker.
 * Writes to Firestore notRegisteredRequests/{uid}
 * @param {string} uid - The unregistered Health ID
 * @param {string} [phone] - Optional phone entered
 */
export async function logUnregisteredRequest(uid, phone = '') {
  const requestData = {
    requestedUID: uid,
    uid: uid,
    timestamp: new Date().toISOString(),
    phone: phone || 'N/A',
    status: 'pending'
  };

  if (isFirebaseMock) {
    console.log('[Mock Firestore] Request logged for notRegisteredRequests:', uid, requestData);
    return true;
  }

  try {
    const docRef = doc(db, 'notRegisteredRequests', uid);
    await setDoc(docRef, {
      ...requestData,
      serverTime: serverTimestamp()
    });
    console.log('[Firestore] Request logged successfully:', uid);
    return true;
  } catch (error) {
    console.error('[Firestore] Logging request failed:', error);
    return false;
  }
}
