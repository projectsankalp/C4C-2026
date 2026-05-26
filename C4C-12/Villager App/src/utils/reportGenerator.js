/**
 * src/utils/reportGenerator.js
 * Generates a clean text summary of the patient's health readings,
 * suitable for sharing via WhatsApp or clipboard.
 */

/**
 * Builds the text summary of a patient's screening results.
 * @param {Object} patient - Patient data object
 * @param {Array} medicines - Patient's medicine list
 * @param {string} lang - Selected language code ('en', 'kn', 'hi', 'ta', 'te')
 * @returns {string} The formatted text report
 */
export function generateHealthSummary(patient, medicines = [], lang = 'en') {
  const dateStr = new Date(patient.lastScreeningDate || Date.now()).toLocaleDateString();
  const nextDateStr = patient.nextScreeningDate 
    ? new Date(patient.nextScreeningDate).toLocaleDateString()
    : 'N/A';

  const labels = {
    en: {
      title: '*GRAAM SEHAT HEALTH SUMMARY*',
      name: 'Patient Name',
      uid: 'Health ID',
      date: 'Screening Date',
      risk: 'Risk Status',
      bp: 'Blood Pressure',
      sugar: 'Blood Glucose',
      idrs: 'IDRS Score',
      nextAppt: 'Next Checkup',
      meds: 'Active Medicines',
      advice: 'Doctor\'s Advice Summary',
      riskLabels: { GREEN: 'Low Risk', YELLOW: 'Moderate Risk', RED: 'High Risk' }
    },
    kn: {
      title: '*ಗ್ರಾಮಸೇಹತ್ ಆರೋಗ್ಯ ಸಾರಾಂಶ*',
      name: 'ರೋಗಿಯ ಹೆಸರು',
      uid: 'ಆರೋಗ್ಯ ಐಡಿ',
      date: 'ತಪಾಸಣಾ ದಿನಾಂಕ',
      risk: 'ಅಪಾಯದ ಮಟ್ಟ',
      bp: 'ರಕ್ತದೊತ್ತಡ',
      sugar: 'ರಕ್ತದ ಸಕ್ಕರೆ',
      idrs: 'IDRS ಸ್ಕೋರ್',
      nextAppt: 'ಮುಂದಿನ ತಪಾಸಣೆ',
      meds: 'ಔಷಧಿಗಳ ಪಟ್ಟಿ',
      advice: 'ವೈದ್ಯರ ಸಲಹೆ ಸಾರಾಂಶ',
      riskLabels: { GREEN: 'ಕಡಿಮೆ ಅಪಾಯ', YELLOW: 'ಮಧ್ಯಮ ಅಪಾಯ', RED: 'ಹೆಚ್ಚಿನ ಅಪಾಯ' }
    },
    hi: {
      title: '*ग्रामसेहत स्वास्थ्य रिपोर्ट*',
      name: 'मरीज का नाम',
      uid: 'स्वास्थ्य आईडी',
      date: 'जांच की तारीख',
      risk: 'जोखिम की स्थिति',
      bp: 'रक्तचाप',
      sugar: 'ब्लड शुगर',
      idrs: 'आईडीआरएस स्कोर',
      nextAppt: 'अगली जांच',
      meds: 'सक्रिय दवाएं',
      advice: 'डॉक्टर की सलाह का सारांश',
      riskLabels: { GREEN: 'कम जोखिम', YELLOW: 'मध्यम जोखिम', RED: 'उच्च जोखिम' }
    },
    ta: {
      title: '*கிராம்சேஹத் சுகாதார அறிக்கை*',
      name: 'நோயாளி பெயர்',
      uid: 'சுகாதார ஐடி',
      date: 'பரிசோதனை தேதி',
      risk: 'ஆபத்து நிலை',
      bp: 'இரத்த அழுத்தம்',
      sugar: 'இரத்த சர்க்கரை',
      idrs: 'ஐடிஆர்எஸ் மதிப்பெண்',
      nextAppt: 'அடுத்த பரிசோதனை',
      meds: 'செயலில் உள்ள மருந்துகள்',
      advice: 'மருத்துவரின் அறிவுரை சுருக்கம்',
      riskLabels: { GREEN: 'குறைந்த ஆபத்து', YELLOW: 'மிதமான ஆபத்து', RED: 'அதிக ஆபத்து' }
    },
    te: {
      title: '*గ్రామసేహత్ ఆరోగ్య నివేదిక*',
      name: 'రోగి పేరు',
      uid: 'ఆరోగ్య ఐడి',
      date: 'పరీక్షించిన తేదీ',
      risk: 'ప్రమాద తీవ్రత',
      bp: 'రక్తపోటు',
      sugar: 'రక్తంలో చక్కెర',
      idrs: 'ఐడిఆర్ఎస్ స్కోరు',
      nextAppt: 'తదుపరి పరీక్ష',
      meds: 'వాడుతున్న మందులు',
      advice: 'వైద్యుల సలహా సారాంశం',
      riskLabels: { GREEN: 'తక్కువ ప్రమాదం', YELLOW: 'మధ్యస్థ ప్రమాదం', RED: 'అధిక ప్రమాదం' }
    }
  };

  const l = labels[lang] || labels.en;
  const riskVal = patient.riskLevel || 'GREEN';
  const riskText = l.riskLabels[riskVal] || riskVal;
  
  // Doctors note translation fallback
  let docNote = '';
  if (patient.doctorsNote) {
    if (typeof patient.doctorsNote === 'string') {
      docNote = patient.doctorsNote;
    } else if (typeof patient.doctorsNote === 'object') {
      docNote = patient.doctorsNote[lang] || patient.doctorsNote.en || patient.doctorsNote.explanation || '';
    }
  }

  // Medicines formatting
  let medsText = 'None';
  if (medicines && medicines.length > 0) {
    medsText = medicines.map((m, idx) => `${idx + 1}. ${m.name || m.medicineName} (${m.dose})`).join('\n');
  }

  return `${l.title}
----------------------------------------
${l.name}: ${patient.name}
${l.uid}: ${patient.uid}
${l.date}: ${dateStr}
----------------------------------------
${l.risk}: ${riskText}
${l.bp}: ${patient.bpSystolic}/${patient.bpDiastolic} mmHg
${l.sugar}: ${patient.glucoseLevel} mg/dL
${l.idrs}: ${patient.idrsScore || 0}/100
----------------------------------------
${l.advice}:
${docNote || 'Follow healthy habits and regular checkups.'}

${l.nextAppt}: ${nextDateStr}
${l.meds}:
${medsText}

Powered by GraamSehat PWA`;
}
