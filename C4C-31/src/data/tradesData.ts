export interface QuizQuestion {
  id: number;
  questionEn: string;
  questionHi: string;
  audioEn: string;
  audioHi: string;
  imageSvg: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
}

export interface Trade {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: string;
  description: string;
  tags: string[];
  bgFrom: string;
  bgTo: string;
  accentColor: string;
  questions: QuizQuestion[];
}

export interface Scheme {
  id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  benefitsEn: string;
  benefitsHi: string;
  eligibilityEn: string;
  eligibilityHi: string;
  tagsEn: string[];
  tagsHi: string[];
  logoType: 'loan' | 'tool' | 'training';
}

export interface Job {
  id: string;
  titleEn: string;
  titleHi: string;
  employer: string;
  locationEn: string;
  locationHi: string;
  salaryEn: string;
  salaryHi: string;
  tradeId: string;
  phone: string;
}

export const tradesData: Trade[] = [
  {
    id: "tailoring",
    nameEn: "Tailoring & Sewing",
    nameHi: "सिलाई और कढ़ाई",
    icon: "Scissors",
    description: "Master garment construction, stitching techniques, fabric selection, and pattern making with hands-on AI evaluation.",
    tags: ["Stitching", "Pattern Making", "Embroidery", "Fabric"],
    bgFrom: "#f0fdfa",
    bgTo: "#ecfdf5",
    accentColor: "#0D9488",
    questions: [
      {
        id: 1,
        questionEn: "Which tool is used for measuring fabric correctly?",
        questionHi: "कपड़े को सही तरीके से मापने के लिए किस उपकरण का उपयोग किया जाता है?",
        audioEn: "Which tool is used for measuring fabric correctly? Measuring tape, scissors, or needle?",
        audioHi: "कपड़े को सही तरीके से मापने के लिए किस उपकरण का उपयोग किया जाता है? नापने वाला फीता, कैंची, या सुई?",
        imageSvg: `<svg viewBox="0 0 100 60" class="w-full h-24 bg-teal-50 rounded-lg p-2"><path d="M10 30h80M20 25v10M30 25v10M40 25v10M50 25v10M60 25v10M70 25v10M80 25v10" stroke="#0D5C75" stroke-width="4" stroke-linecap="round"/><text x="50" y="52" fill="#0D5C75" font-size="10" text-anchor="middle" font-weight="bold">Measuring Tape</text></svg>`,
        optionsEn: ["Measuring Tape", "Scissors", "Needle"],
        optionsHi: ["नापने वाला फीता (इंची टेप)", "कैंची", "सुई"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "beauty",
    nameEn: "Beauty & Parlour",
    nameHi: "ब्यूटी पार्लर व श्रृंगार",
    icon: "Sparkles",
    description: "Learn professional makeup, skin care, hair styling, bridal looks, and modern beauty treatments with expert AI guidance.",
    tags: ["Makeup", "Hair Styling", "Skin Care", "Bridal"],
    bgFrom: "#fdf2f8",
    bgTo: "#fce7f3",
    accentColor: "#db2777",
    questions: [
      {
        id: 1,
        questionEn: "Which tool is used for eyebrow hair removal?",
        questionHi: "भौंहों के बाल हटाने के लिए किस उपकरण का उपयोग किया जाता है?",
        audioEn: "Which tool is used for eyebrow hair removal? Threading spool, Hair brush, or Lipstick?",
        audioHi: "भौंहों के बाल हटाने के लिए किस उपकरण का उपयोग किया जाता है? थ्रेडिंग धागा, कंघी, या लिपस्टिक?",
        imageSvg: `<svg viewBox="0 0 100 60" class="w-full h-24 bg-pink-50 rounded-lg p-2"><path d="M30 40 L70 20 M30 20 L70 40" stroke="#db2777" stroke-width="3"/><circle cx="50" cy="30" r="6" fill="#D4AF37"/><text x="50" y="54" fill="#db2777" font-size="8" text-anchor="middle" font-weight="bold">Threading Thread</text></svg>`,
        optionsEn: ["Threading Thread", "Hair Brush", "Lipstick Brush"],
        optionsHi: ["थ्रेडिंग धागा", "बालों का ब्रश", "लिपस्टिक ब्रश"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "foodprep",
    nameEn: "Food Prep & Catering",
    nameHi: "खाद्य तैयारी व कैटरिंग",
    icon: "Utensils",
    description: "Excel in professional cooking, food safety, catering management, and entrepreneurship in the food industry.",
    tags: ["Cooking", "Food Safety", "Catering", "Nutrition"],
    bgFrom: "#fff7ed",
    bgTo: "#ffedd5",
    accentColor: "#ea580c",
    questions: [
      {
        id: 1,
        questionEn: "Which kitchen tool is used for rolling out flatbread (rotis)?",
        questionHi: "रोटी बेलने के लिए रसोई के किस उपकरण का उपयोग किया जाता है?",
        audioEn: "Which tool is used for rolling out rotis? Rolling Pin, Knife, or Frying Pan?",
        audioHi: "रोटी बेलने के लिए किसका उपयोग किया जाता है? बेलन, चाकू, या कड़ाही?",
        imageSvg: `<svg viewBox="0 0 100 60" class="w-full h-24 bg-orange-50 rounded-lg p-2"><rect x="15" y="27" width="70" height="6" rx="3" fill="#ea580c"/><text x="50" y="50" fill="#ea580c" font-size="8" text-anchor="middle" font-weight="bold">Rolling Pin</text></svg>`,
        optionsEn: ["Rolling Pin (Belan)", "Knife", "Frying Pan (Kadhai)"],
        optionsHi: ["बेलन", "चाकू", "कड़ाही"],
        correctIndex: 0
      }
    ]
  },
  {
    id: "handicrafts",
    nameEn: "Handicrafts & Weaving",
    nameHi: "हस्तशिल्प और बुनाई",
    icon: "Sparkles",
    description: "Develop skills in traditional handloom weaving, pottery, block printing, and artisan craft for domestic and export markets.",
    tags: ["Weaving", "Pottery", "Block Print", "Handloom"],
    bgFrom: "#fefce8",
    bgTo: "#fef9c3",
    accentColor: "#ca8a04",
    questions: [
      {
        id: 1,
        questionEn: "Which material is commonly used for making traditional clay pots?",
        questionHi: "पारंपरिक मिट्टी के बर्तन बनाने के लिए किस सामग्री का उपयोग किया जाता है?",
        audioEn: "Which material is used for making traditional clay pots? Terracotta Clay, Plastic, or Metal?",
        audioHi: "मिट्टी के बर्तन बनाने के लिए किस सामग्री का उपयोग किया जाता है? टेराकोटा मिट्टी, प्लास्टिक, या धातु?",
        imageSvg: `<svg viewBox="0 0 100 60" class="w-full h-24 bg-yellow-50 rounded-lg p-2"><path d="M40 20 L60 20 C70 30 75 40 50 50 C25 40 30 30 40 20 Z" fill="#ca8a04"/><text x="50" y="58" fill="#ca8a04" font-size="8" text-anchor="middle" font-weight="bold">Clay Pot</text></svg>`,
        optionsEn: ["Terracotta Clay", "Plastic", "Metal Sheet"],
        optionsHi: ["टेराकोटा मिट्टी", "प्लास्टिक", "धातु की चादर"],
        correctIndex: 0
      }
    ]
  }
];

export const schemesData: Scheme[] = [
  {
    id: "pmv",
    titleEn: "PM Vishwakarma Scheme",
    titleHi: "पीएम विश्वकर्मा योजना",
    descriptionEn: "Support for traditional artisans and craftspeople. Offers identity cards, skill upgradation, toolkit incentive, and collateral-free credit.",
    descriptionHi: "पारंपरिक कारीगरों और शिल्पकारों के लिए सहायता। पहचान पत्र, कौशल उन्नयन, टूलकिट प्रोत्साहन और बिना गारंटी के ऋण प्रदान करता है।",
    benefitsEn: "₹15,000 Toolkit Grant + Collateral-Free Loans up to ₹3,00,000 at 5% interest.",
    benefitsHi: "₹15,000 टूलकिट अनुदान + 5% ब्याज पर ₹3,00,000 तक बिना गारंटी का ऋण।",
    eligibilityEn: "Self-employed artisans in 18 specified trades.",
    eligibilityHi: "18 निर्दिष्ट व्यवसायों में स्व-नियोजित कारीगर।",
    tagsEn: ["Grant", "Tool Kit", "Low Interest Loan"],
    tagsHi: ["अनुदान", "टूल किट", "कम ब्याज ऋण"],
    logoType: "tool"
  },
  {
    id: "mudra",
    titleEn: "Mudra Loan",
    titleHi: "मुद्रा योजना (शिशु और किशोर)",
    descriptionEn: "Government-backed loans for starting or expanding small businesses.",
    descriptionHi: "छोटे व्यवसाय शुरू करने या बढ़ाने के लिए सरकारी ऋण।",
    benefitsEn: "Loans from ₹50,000 up to ₹5 Lakhs with minimal documentation.",
    benefitsHi: "न्यूनतम दस्तावेजों के साथ ₹50,000 से लेकर ₹5 लाख तक का ऋण।",
    eligibilityEn: "Women entrepreneurs running or starting micro/small businesses.",
    eligibilityHi: "सूक्ष्म/लघु व्यवसाय शुरू करने वाली महिला उद्यमी।",
    tagsEn: ["Business Capital", "No Security"],
    tagsHi: ["व्यवसाय पूंजी", "कोई सुरक्षा नहीं"],
    logoType: "loan"
  },
  {
    id: "svanidhi",
    titleEn: "PM SVANidhi Scheme",
    titleHi: "पीएम स्वनिधि योजना",
    descriptionEn: "Micro-credit scheme for street vendors and small home-based food preparers to restart/grow their businesses.",
    descriptionHi: "रेहड़ी-पटरी वालों और घर पर भोजन बनाने वाली महिलाओं के लिए सूक्ष्म ऋण योजना।",
    benefitsEn: "First loan of ₹10,000, 7% interest subsidy.",
    benefitsHi: "₹10,000 का प्रारंभिक ऋण, 7% ब्याज सब्सिडी।",
    eligibilityEn: "Street food makers, home-catering providers, and small stall owners.",
    eligibilityHi: "सड़क किनारे भोजन बनाने वाले, होम-कैटरिंग प्रदाता और छोटे स्टॉल मालिक।",
    tagsEn: ["Working Capital", "Subsidized Interest"],
    tagsHi: ["कार्यशील पूंजी", "रियायती ब्याज"],
    logoType: "training"
  },
  {
    id: "standup",
    titleEn: "Stand-Up India Scheme",
    titleHi: "स्टैंड-अप इंडिया योजना",
    descriptionEn: "Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one woman per bank branch for setting up a greenfield enterprise.",
    descriptionHi: "हर बैंक शाखा से कम से कम एक महिला को नया व्यवसाय शुरू करने के लिए 10 लाख से 1 करोड़ रुपये तक का ऋण।",
    benefitsEn: "Loans from ₹10 Lakhs to ₹1 Crore.",
    benefitsHi: "10 लाख से 1 करोड़ रुपये तक का ऋण।",
    eligibilityEn: "Women entrepreneurs (above 18 years) setting up a new enterprise in manufacturing, services, or trading sector.",
    eligibilityHi: "18 वर्ष से अधिक आयु की महिला उद्यमी जो नया व्यवसाय स्थापित कर रही हैं।",
    tagsEn: ["Large Capital", "Enterprise Growth"],
    tagsHi: ["बड़ी पूंजी", "व्यापार विकास"],
    logoType: "loan"
  },
  {
    id: "pmkvy",
    titleEn: "PM Kaushal Vikas Yojana (PMKVY)",
    titleHi: "पीएम कौशल विकास योजना",
    descriptionEn: "Flagship scheme for skill training of youth and women to get better livelihoods.",
    descriptionHi: "बेहतर आजीविका प्राप्त करने के लिए युवाओं और महिलाओं के कौशल प्रशिक्षण के लिए प्रमुख योजना।",
    benefitsEn: "Free short-term training, certification, and placement assistance.",
    benefitsHi: "मुफ्त अल्पावधि प्रशिक्षण, प्रमाणन और रोजगार सहायता।",
    eligibilityEn: "Any Indian citizen seeking skill training and employment.",
    eligibilityHi: "कौशल प्रशिक्षण और रोजगार चाहने वाला कोई भी भारतीय नागरिक।",
    tagsEn: ["Free Training", "Placement Help"],
    tagsHi: ["मुफ्त प्रशिक्षण", "रोजगार सहायता"],
    logoType: "training"
  }
];

export const jobsData: Job[] = [
  {
    id: "job1",
    titleEn: "Urgent: 5 Tailors for Boutique",
    titleHi: "आवश्यकता: बुटीक के लिए 5 महिला दर्जी",
    employer: "Radha Boutique",
    locationEn: "Sector 15",
    locationHi: "सेक्टर 15",
    salaryEn: "₹12,000 / month",
    salaryHi: "₹12,000 / माह",
    tradeId: "tailoring",
    phone: "9876543210"
  },
  {
    id: "job2",
    titleEn: "Bridal Makeup Artist Assistant",
    titleHi: "ब्राइडल मेकअप आर्टिस्ट सहायक",
    employer: "Golden Glow Beauty Parlour",
    locationEn: "Main Bazaar",
    locationHi: "मुख्य बाज़ार",
    salaryEn: "₹10,000 / month",
    salaryHi: "₹10,000 / माह",
    tradeId: "beauty",
    phone: "8765432109"
  },
  {
    id: "job3",
    titleEn: "Catering Helper for Events",
    titleHi: "इवेंट कैटरिंग सहायक",
    employer: "Shree Caterers",
    locationEn: "City Center",
    locationHi: "सिटी सेंटर",
    salaryEn: "₹9,000 / month",
    salaryHi: "₹9,000 / माह",
    tradeId: "foodprep",
    phone: "7654321098"
  },
  {
    id: "job4",
    titleEn: "Handicraft Artisan Wanted",
    titleHi: "हस्तशिल्प कारीगर चाहिए",
    employer: "Kala Exports",
    locationEn: "Industrial Area",
    locationHi: "औद्योगिक क्षेत्र",
    salaryEn: "₹11,000 / month",
    salaryHi: "₹11,000 / माह",
    tradeId: "handicrafts",
    phone: "6543210987"
  }
];
