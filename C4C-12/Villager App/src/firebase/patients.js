/**
 * src/firebase/patients.js
 * Read functions for fetching screenings, family accounts, and education articles.
 */

import { collection, getDocs, doc, setDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseMock } from './config.js';
import { MOCK_PATIENTS } from './auth.js';

// ═══════════════════════════════════
// MOCK DATA FOR SCREENINGS & EDUCATION
// ═══════════════════════════════════
export const MOCK_SCREENINGS = {
  '100008': [
    {
      date: '2026-04-15',
      riskLevel: 'GREEN',
      bpSystolic: 118,
      bpDiastolic: 76,
      glucoseLevel: 95,
      idrsScore: 20,
      ashaWorkerName: 'Rupa Devi',
      idrsBreakdown: { ageGroup: 'under35', waistSize: 'low', physicalActivity: 'vigorous', familyHistory: 'none' },
      doctorsNote: 'Your health looks good. Maintain your physical activity and low-sugar diet.'
    }
  ],
  '100016': [
    {
      date: '2026-05-10',
      riskLevel: 'YELLOW',
      bpSystolic: 135,
      bpDiastolic: 85,
      glucoseLevel: 145,
      idrsScore: 45,
      ashaWorkerName: 'Rupa Devi',
      idrsBreakdown: { ageGroup: '35to49', waistSize: 'medium', physicalActivity: 'moderate', familyHistory: 'one_parent' },
      doctorsNote: 'Some attention needed. Visit the PHC within a month for confirmatory blood tests and monitor blood pressure weekly.'
    },
    {
      date: '2025-11-12',
      riskLevel: 'GREEN',
      bpSystolic: 120,
      bpDiastolic: 78,
      glucoseLevel: 110,
      idrsScore: 25,
      ashaWorkerName: 'Rupa Devi',
      idrsBreakdown: { ageGroup: '35to49', waistSize: 'low', physicalActivity: 'moderate', familyHistory: 'none' },
      doctorsNote: 'All readings look normal. Continue daily brisk walks.'
    }
  ],
  '100024': [
    {
      date: '2026-05-25',
      riskLevel: 'RED',
      bpSystolic: 165,
      bpDiastolic: 102,
      glucoseLevel: 250,
      idrsScore: 70,
      ashaWorkerName: 'Rupa Devi',
      idrsBreakdown: { ageGroup: '50plus', waistSize: 'high', physicalActivity: 'sedentary', familyHistory: 'both_parents' },
      doctorsNote: 'Immediate action required. High Blood Pressure and Glucose levels. Please visit nearest PHC immediately for clinical assessment.'
    },
    {
      date: '2025-12-10',
      riskLevel: 'YELLOW',
      bpSystolic: 138,
      bpDiastolic: 88,
      glucoseLevel: 155,
      idrsScore: 50,
      ashaWorkerName: 'Rupa Devi',
      idrsBreakdown: { ageGroup: '50plus', waistSize: 'medium', physicalActivity: 'moderate', familyHistory: 'one_parent' },
      doctorsNote: 'Readings are high. Keep checking at local sub-centre.'
    }
  ]
};

const MOCK_EDUCATION = [
  {
    id: 'art_1',
    category: 'Diabetes',
    createdAt: '2026-01-10T12:00:00Z',
    title: {
      en: 'Understanding Type 2 Diabetes',
      kn: 'ಟೈಪ್ 2 ಮಧುಮೇಹವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು',
      hi: 'टाइप 2 मधुमेह को समझना',
      ta: 'வகை 2 நீரிழிவு நோயைப் புரிந்துகொள்ளுதல்',
      te: 'టైప్ 2 మధుమేహాన్ని అర్థం చేసుకోవడం'
    },
    content: {
      en: 'Diabetes is a chronic condition where the body cannot properly use insulin, leading to high blood sugar levels. Eating fresh vegetables and exercising daily is key to management. Avoid refined sugar and white rice in excess.',
      kn: 'ಮಧುಮೇಹವು ದೀರ್ಘಕಾಲದ ಆರೋಗ್ಯ ಸ್ಥಿತಿಯಾಗಿದ್ದು, ಇದರಲ್ಲಿ ದೇಹವು ಇನ್ಸುಲಿನ್ ಅನ್ನು ಸರಿಯಾಗಿ ಬಳಸಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ. ತಾಜಾ ತರಕಾರಿಗಳನ್ನು ತಿನ್ನುವುದು ಮತ್ತು ಪ್ರತಿದಿನ ವ್ಯಾಯಾಮ ಮಾಡುವುದು ಮುಖ್ಯ. ಸಕ್ಕರೆ ಮತ್ತು ಬಿಳಿ ಅಕ್ಕಿಯ ಬಳಕೆ ಕಡಿಮೆ ಮಾಡಿ.',
      hi: 'मधुमेह एक पुरानी स्थिति है जिसमें शरीर इंसुलिन का ठीक से उपयोग नहीं कर पाता, जिससे रक्त शर्करा बढ़ जाती है। ताजी सब्जियां खाना और दैनिक व्यायाम करना इसके नियंत्रण के लिए महत्वपूर्ण है।',
      ta: 'நீரிழிவு என்பது உடல் இன்சுலினை சரியாகப் பயன்படுத்த முடியாத ஒரு நாள்பட்ட நிலை. புதிய காய்கறிகளை உண்பதும், தினமும் உடற்பயிற்சி செய்வதும் இதன் மேலாண்மைக்கு முக்கியமாகும்.',
      te: 'మధుమేహం అనేది శరీరం ఇన్సులిన్‌ను సరిగ్గా ఉపయోగించలేని దీర్ಘకాలిక పరిస్థితి. తాజా కూరగాయలు తినడం మరియు ప్రతిరోజూ వ్యాయామం చేయడం దీని నియంత్రణకు ముఖ్యం.'
    }
  },
  {
    id: 'art_2',
    category: 'Blood Pressure',
    createdAt: '2026-02-15T12:00:00Z',
    title: {
      en: 'How to Manage High Blood Pressure',
      kn: 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡವನ್ನು ನಿರ್ವಹಿಸುವುದು ಹೇಗೆ',
      hi: 'उच्च रक्तचाप को कैसे प्रबंधित करें',
      ta: 'உயர் இரத்த அழுத்தத்தை எவ்வாறு நிர்வகிப்பது',
      te: 'అధిక రక్తపోటును ఎలా నియంత్రించాలి'
    },
    content: {
      en: 'High blood pressure (hypertension) strains your blood vessels and heart. Reducing table salt, avoiding processed pickles, and walking briskly for 30 minutes every day can naturally lower your blood pressure readings.',
      kn: 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡವು ರಕ್ತನಾಳಗಳು ಮತ್ತು ಹೃದಯದ ಮೇಲೆ ಒತ್ತಡವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ. ಊಟದಲ್ಲಿ ಉಪ್ಪಿನ ಬಳಕೆ ಕಮ್ಮಿ ಮಾಡುವುದು, ಉಪ್ಪಿನಕಾಯಿಗಳನ್ನು ತಪ್ಪಿಸುವುದು ಮತ್ತು ಪ್ರತಿದಿನ 30 ನಿಮಿಷ ನಡಿಗೆ ಮಾಡುವುದರಿಂದ ನಿಯಂತ್ರಿಸಬಹುದು.',
      hi: 'उच्च रक्तचाप आपके हृदय और रक्त वाहिकाओं पर दबाव डालता है। खाने में नमक कम करना, आचार से बचना, और रोजाना 30 मिनट तेज चलना आपके रक्तचाप को प्राकृतिक रूप से कम कर सकता है।',
      ta: 'உயர் இரத்த அழுத்தம் உங்கள் இரத்த நாளங்களையும் இதயத்தையும் பாதிக்கிறது. சமையல் உப்பைக் குறைப்பது, ஊறுகாயைத் தவிர்ப்பது மற்றும் தினமும் 30 நிமிடங்கள் வேகமாக நடப்பது இரத்த அழுத்தத்தைக் குறைக்கும்.',
      te: 'అధిక రక్తపోటు మీ గుండె మరియు రక్తనాళాలపై ఒత్తిడిని కలిగిస్తుంది. ఉప్పు వాడకం తగ్గించడం, ఊరగాయలు తినకపోవడం మరియు ప్రతిరోజూ 30 నిమిషాలు నడవడం వల్ల రక్తపోటు తగ్గుతుంది.'
    }
  },
  {
    id: 'art_3',
    category: 'Diet',
    createdAt: '2026-03-01T12:00:00Z',
    title: {
      en: 'Healthy Foods in Rural India',
      kn: 'ಗ್ರಾಮೀಣ ಭಾಗಗಳಲ್ಲಿ ಲಭ್ಯವಿರುವ ಆರೋಗ್ಯಕರ ಆಹಾರಗಳು',
      hi: 'ग्रामीण भारत में स्वास्थ्यवर्धक आहार',
      ta: 'கிராமப்புற இந்தியாவில் ஆரோக்கியமான உணவுகள்',
      te: 'గ్రామీణ ప్రాంతాలలో లభించే ఆరోగ్యకరమైన ఆహారాలు'
    },
    content: {
      en: 'Eating local millets like Ragi, Jowar, and Bajra is highly beneficial for sugar control. Include local green leafy vegetables (soppu/saag) in your meals and drink plenty of clean, filtered water throughout the day.',
      kn: 'ರಾಗಿ, ಜೋಳ, ಮತ್ತು ಸಜ್ಜೆಯಂತಹ ಸ್ಥಳೀಯ ಸಿರಿಧಾನ್ಯಗಳನ್ನು ತಿನ್ನುವುದು ಸಕ್ಕರೆ ನಿಯಂತ್ರಣಕ್ಕೆ ತುಂಬಾ ಉಪಯುಕ್ತವಾಗಿದೆ. ನಿಮ್ಮ ಊಟದಲ್ಲಿ ಹಸಿರು ಸೊಪ್ಪುಗಳನ್ನು ಸೇರಿಸಿ ಮತ್ತು ಪ್ರತಿದಿನ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ.',
      hi: 'रागी, ज्वार और बाजरा जैसे स्थानीय मोटे अनाज खाना शर्करा नियंत्रण के लिए अत्यधिक फायदेमंद है। अपने भोजन में स्थानीय हरी पत्तेदार सब्जियां शामिल करें और भरपूर पानी पिएं।',
      ta: 'ராகி, சோளம், கம்பு போன்ற உள்ளூர் தானியங்களை உண்பது சர்க்கரை கட்டுப்பாட்டிற்கு மிகவும் நல்லது. உங்கள் உணவில் கீரை வகைகளைச் சேர்த்து, தினமும் தேவையான அளவு தண்ணீர் குடிக்கவும்.',
      te: 'రాగి, జొన్నలు మరియు సజ్జలు వంటి స్థానిక తృణధాన్యాలు తినడం చక్కెర నియంత్రణకు చాలా మంచిది. మీ ఆహారంలో ఆకుకూరలు చేర్చుకోండి మరియు రోజువారీగా మంచి నీరు త్రాగాలి.'
    }
  }
];

export const MOCK_FAMILY = {
  '100008': [
    { memberUID: '100016', relation: 'Spouse', name: 'Lakshmi Gowda', riskLevel: 'YELLOW', lastCheckedDate: '2026-05-10' }
  ],
  '100016': [
    { memberUID: '100008', relation: 'Spouse', name: 'Ramesh Kumar', riskLevel: 'GREEN', lastCheckedDate: '2026-04-15' }
  ],
  '100024': []
};

/**
 * Fetches screening records for a patient from subcollection.
 * @param {string} uid - Patient Health ID
 * @returns {Promise<Array>} List of screenings sorted by date (newest first)
 */
export async function fetchPatientScreenings(uid) {
  if (isFirebaseMock) {
    return MOCK_SCREENINGS[uid] || [];
  }

  try {
    const q = query(
      collection(db, 'patients', uid, 'screenings'),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    if (results.length === 0) {
      return MOCK_SCREENINGS[uid] || [];
    }
    return results;
  } catch (error) {
    console.error('Firestore screenings fetch failed, using mock:', error);
    return MOCK_SCREENINGS[uid] || [];
  }
}

/**
 * Fetches medicine logs (distributed medicines) for a patient.
 * Query subcollection: patients/{uid}/medicines
 * @param {string} uid - Patient Health ID
 * @returns {Promise<Array>} List of medicine logs
 */
export async function fetchPatientMedicines(uid) {
  if (isFirebaseMock) {
    return MOCK_PATIENTS[uid]?.medicines || [];
  }

  try {
    const snap = await getDocs(collection(db, 'patients', uid, 'medicines'));
    const results = [];
    snap.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        name: data.medicineName || data.name || '',
        dose: data.dose || '',
        frequency: data.frequency || 'Daily',
        quantity: data.quantity || 0,
        distributedAt: data.distributedAt || '',
        nextDueDate: data.nextDueDate || '',
        ...data
      });
    });
    return results;
  } catch (error) {
    console.error('Firestore medicines fetch failed, using mock:', error);
    return MOCK_PATIENTS[uid]?.medicines || [];
  }
}


/**
 * Fetches health education articles from Firestore.
 * @returns {Promise<Array>} List of articles
 */
export async function fetchEducationArticles() {
  if (isFirebaseMock) {
    return MOCK_EDUCATION;
  }

  try {
    const q = query(collection(db, 'educationContent'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const results = [];
    snap.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    if (results.length === 0) {
      return MOCK_EDUCATION;
    }
    return results;
  } catch (error) {
    console.error('Firestore articles fetch failed, using mock:', error);
    return MOCK_EDUCATION;
  }
}

/**
 * Fetches linked family members for a patient.
 * Query subcollection: familyLinks/{primaryUID}/members
 * @param {string} uid - Primary Patient Health ID
 * @returns {Promise<Array>} List of member details
 */
export async function fetchFamilyMembers(uid) {
  if (isFirebaseMock) {
    return MOCK_FAMILY[uid] || [];
  }

  try {
    const snap = await getDocs(collection(db, 'familyLinks', uid, 'members'));
    const members = [];
    snap.forEach((doc) => {
      members.push({ memberUID: doc.id, ...doc.data() });
    });

    // If Firestore has results, we fetch details of each family member from patients collection
    if (members.length > 0) {
      const details = [];
      for (const m of members) {
        // Fetch patient details
        const patientDoc = await getDocs(query(collection(db, 'patients')));
        let patientDetail = null;
        patientDoc.forEach((pDoc) => {
          if (pDoc.id === m.memberUID) {
            patientDetail = pDoc.data();
          }
        });
        details.push({
          memberUID: m.memberUID,
          relation: m.relation || 'Family',
          name: patientDetail ? patientDetail.name : 'Unknown Member',
          riskLevel: patientDetail ? patientDetail.riskLevel : 'GREEN',
          lastCheckedDate: patientDetail ? patientDetail.lastScreeningDate : 'N/A'
        });
      }
      return details;
    }

    return MOCK_FAMILY[uid] || [];
  } catch (error) {
    console.error('Firestore family links fetch failed, using mock:', error);
    return MOCK_FAMILY[uid] || [];
  }
}

/**
 * Writes a family link to the subcollection familyLinks/{primaryUID}/members
 * @param {string} primaryUID - Primary Patient Health ID
 * @param {string} memberUID - Member Health ID to link
 * @param {string} relation - Relationship tag
 */
export async function addFamilyLink(primaryUID, memberUID, relation) {
  const linkData = {
    memberUID,
    relation,
    addedAt: new Date().toISOString()
  };

  if (isFirebaseMock) {
    console.log('[Mock Firestore] Linking member', memberUID, 'to primary', primaryUID);
    if (!MOCK_FAMILY[primaryUID]) {
      MOCK_FAMILY[primaryUID] = [];
    }
    // Check if already exists in mock
    const exists = MOCK_FAMILY[primaryUID].some(item => item.memberUID === memberUID);
    if (!exists) {
      // Find patient details for mock representation
      const patients = query(collection(db, 'patients'));
      MOCK_FAMILY[primaryUID].push({
        memberUID,
        relation,
        name: memberUID === '100016' ? 'Lakshmi Gowda' : (memberUID === '100008' ? 'Ramesh Kumar' : 'Family Member'),
        riskLevel: memberUID === '100016' ? 'YELLOW' : 'GREEN',
        lastCheckedDate: '2026-05-10'
      });
    }
    return true;
  }

  try {
    const docRef = doc(db, 'familyLinks', primaryUID, 'members', memberUID);
    await setDoc(docRef, linkData);
    
    // Also write reciprocal link for seamless navigation!
    const reciprocalRef = doc(db, 'familyLinks', memberUID, 'members', primaryUID);
    await setDoc(reciprocalRef, {
      memberUID: primaryUID,
      relation: 'Family',
      addedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Firestore link writing failed:', error);
    return false;
  }
}

/**
 * Seeds all mock patients, screenings, and family links directly to the live Firestore.
 * Used for presentation and initialization in mock fallback or live modes.
 */
export async function seedDemoDataToFirestore() {
  console.log('[Seeder] Seeding database...');
  
  // Seed Patients
  for (const uid of Object.keys(MOCK_PATIENTS)) {
    const patientData = MOCK_PATIENTS[uid];
    const patientDocRef = doc(db, 'patients', uid);
    await setDoc(patientDocRef, patientData);
    
    // Seed Screenings
    const screenings = MOCK_SCREENINGS[uid] || [];
    for (const screening of screenings) {
      const screeningDocRef = doc(db, 'patients', uid, 'screenings', screening.date);
      await setDoc(screeningDocRef, screening);
    }
  }

  // Seed Family Links
  for (const primaryUID of Object.keys(MOCK_FAMILY)) {
    const members = MOCK_FAMILY[primaryUID] || [];
    for (const m of members) {
      const docRef = doc(db, 'familyLinks', primaryUID, 'members', m.memberUID);
      await setDoc(docRef, {
        memberUID: m.memberUID,
        relation: m.relation,
        addedAt: new Date().toISOString()
      });

      // reciprocal
      const reciprocalRef = doc(db, 'familyLinks', m.memberUID, 'members', primaryUID);
      await setDoc(reciprocalRef, {
        memberUID: primaryUID,
        relation: 'Family',
        addedAt: new Date().toISOString()
      });
    }
  }
  
  console.log('[Seeder] Seeding complete!');
  return true;
}
