/**
 * Ayurvedic recommendations — English
 *
 * Sources:
 * - National Health Portal of India (NHP), Ministry of Health & Family Welfare
 *   https://www.nhp.gov.in/Madhumeha-(Diabetes-mellitus)_mtl
 *   https://www.nhp.gov.in/Vyanabala-vaishamya-(Hypertension)_mtl
 * - CCRAS / AYUSH: Integration of Ayush with NPCDCS guidelines (2018)
 * - NCBI Bookshelf: Ayurvedic Interventions for DM (NBK33787)
 * - PMC6145966: Therapeutic Role of Yoga in Type 2 Diabetes
 * - PMC10989416: Therapeutic role of Yoga in Hypertension
 * - Charaka Samhita Nidanasthana 4/47 (Prameha Purvarupa)
 */

const recommendations = {
  HIGH: {
    default: [
      'Visit PHC immediately — do not delay treatment',
      'Alert sent to your PHC doctor',
      'Follow Nidana Parivarjana (avoid causative factors): stop all sweet, heavy, oily, and cold foods — these aggravate Kapha and worsen Prameha',
      'Take prescribed allopathic medicines regularly — Ayurvedic herbs are supportive only, not a replacement',
      'Monitor blood pressure daily if possible; inform your PHC doctor of readings',
      'Avoid sedentary habits (Asya Sukha) — a primary cause of Prameha per Charaka Samhita',
      'Follow up at PHC within 7 days'
    ],
    'Diabetic Range': [
      'Completely avoid all sugars, white rice, maida (refined flour), and sugary beverages — key dietary Nidana for Madhumeha',
      'CCRAS-recommended foods: bitter gourd (Karela / Momordica charantia), fenugreek seeds (Methi / Trigonella foenum-graecum), Indian gooseberry (Amla), jamun (Eugenia jambolana), and bael — all have clinical evidence for glucose-lowering effect (NCBI NBK33787)',
      'Monitor blood glucose daily; report any reading above 250 mg/dL to your doctor immediately'
    ],
    'Hypertensive Crisis': [
      'Go to hospital emergency immediately — this is a medical emergency',
      'Avoid any physical exertion or stress',
      'NHP-recommended Pranayama for BP: Chandra Anuloma Viloma (left-nostril breathing) — practice only after BP is stabilised under medical supervision'
    ],
    'Stage 2 Hypertension': [
      'Drastically reduce salt (Lavana) intake — NHP guidelines recommend strict restriction',
      'Avoid stress, anger, and heavy lifting',
      'NHP-approved Yoga for hypertension: Shavasana (complete relaxation pose) — most important for BP reduction; also Vajrasana and Bhujangasana under qualified guidance'
    ]
  },
  MEDIUM: {
    default: [
      'Visit PHC within the next 2 weeks',
      'Dietary changes per CCRAS guidelines: replace white rice and refined carbs with millets — ragi (Eleusine coracana), jowar (Sorghum), bajra (Pearl millet); these are Trinadhanya, classified as beneficial for Prameha in Ayurvedic texts',
      'Brisk walking (Vyayama) for 45 minutes daily — Charaka Samhita identifies physical inactivity (Alasya) as a primary cause of Prameha; exercise is the most important lifestyle intervention',
      'CCRAS-recommended anti-diabetic herbs with clinical evidence: fenugreek (Methi) seeds soaked overnight in water — drink the water each morning; include bitter gourd (Karela) in meals at least 3 times per week',
      'Drink 8–10 glasses of water daily; avoid cold and sweetened beverages',
      'Avoid smoking and alcohol — both worsen Kapha-Vata imbalance',
      'Pranayama per PMC research: Kapalbhati (bellows breathing) and Anuloma Viloma (alternate nostril breathing) — 15–20 minutes daily; shown to improve insulin sensitivity',
      'Repeat blood glucose test in 1 month'
    ]
  },
  LOW: {
    default: [
      'Maintain a healthy diet per NHP guidelines: reduce white rice, increase vegetables (non-starchy), include millets',
      'CCRAS-recommended preventive foods: amla (Indian gooseberry), garlic, guava, and jamun — include regularly in diet',
      'Exercise at least 30–45 minutes daily; Yoga asanas shown to be beneficial: Paschimottanasana, Mandukasana, Vakrasana — these compress the pancreatic region and support insulin regulation (PMC6145966)',
      'Avoid smoking and alcohol',
      'Routine health screening every 6 months recommended by NHP',
      'Stay hydrated — drink warm or room-temperature water; avoid ice-cold drinks which impair Agni (digestive fire)'
    ]
  }
};

module.exports = recommendations;