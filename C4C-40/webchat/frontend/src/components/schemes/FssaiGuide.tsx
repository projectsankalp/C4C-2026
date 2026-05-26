import React from 'react';
import { 
  Store, 
  Utensils, 
  Factory, 
  ChefHat, 
  Clock, 
  ThumbsUp, 
  Truck, 
  ShoppingBag,
  IdCard,
  MapPin,
  ClipboardCheck,
  Package
} from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';
import { useReadAloud } from '@/hooks/useReadAloud';

// --------------------------------------------------------
// VISUAL GUIDE TRANSLATIONS
// --------------------------------------------------------
const FSSAI_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: {
    'Food Safety License': 'खाद्य सुरक्षा लाइसेंस',
    'Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.': 'भोजन को छूने, पकाने, पैक करने, परिवहन करने या बेचने वाले किसी भी व्यक्ति के लिए अनिवार्य। FSSAI द्वारा शासित।',
    'Which license do you need?': 'आपको किस लाइसेंस की आवश्यकता है?',
    'Basic Registration': 'बुनियादी पंजीकरण',
    'Turnover below ₹12 Lakhs/yr': '₹12 लाख/वर्ष से कम टर्नओवर',
    'Fee: ₹100 per year': 'शुल्क: ₹100 प्रति वर्ष',
    'Best for: Petty vendors, roadside stalls, and home-based businesses.': 'सर्वोत्तम: छोटे विक्रेता, सड़क किनारे स्टॉल, और घरेलू व्यवसाय।',
    'State License': 'राज्य लाइसेंस',
    'Turnover ₹12L to ₹20 Cr/yr': 'टर्नओवर ₹12 लाख से ₹20 करोड़/वर्ष',
    'Fee: ₹2,000 to ₹5,000 per year': 'शुल्क: ₹2,000 से ₹5,000 प्रति वर्ष',
    'Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.': 'सर्वोत्तम: रेस्तरां, क्लाउड किचन, कैटरर्स और मध्यम आकार के निर्माता।',
    'Central License': 'केंद्रीय लाइसेंस',
    'Turnover above ₹20 Crores/yr': '₹20 करोड़/वर्ष से अधिक टर्नओवर',
    'Fee: ₹7,500 per year': 'शुल्क: ₹7,500 प्रति वर्ष',
    'Required for: Large manufacturers, importers, and multi-state operations.': 'आवश्यक: बड़े निर्माता, आयातक और बहु-राज्य संचालन।',
    'Who exactly needs it?': 'इसकी वास्तव में किसे आवश्यकता है?',
    'Eateries & Kitchens': ' भोजनालय और रसोई',
    'Restaurants & cloud kitchens': 'रेस्तरां और क्लाउड किचन',
    'Retail & Grocery': 'किराना और खुदरा',
    'Marts & roadside stalls': 'मार्ट्स और सड़क किनारे स्टॉल',
    'Transport': 'परिवहन',
    'Cold storage & aggregators': 'कोल्ड स्टोरेज और एग्रीगेटर्स',
    'Manufacturing': 'विनिर्माण',
    'Processing & dairy units': 'प्रसंस्करण और डेयरी इकाइयां',
    'Documents Required': 'आवश्यक दस्तावेज़',
    'Owner ID': 'मालिक का पहचान पत्र',
    'Govt-issued Photo ID': 'सरकार द्वारा जारी फोटो आईडी',
    'Premises Proof': 'परिसर का प्रमाण',
    'Rental or ownership doc': 'किराये या स्वामित्व का दस्तावेज़',
    'Safety Plan': 'सुरक्षा योजना',
    'For State/Central only': 'केवल राज्य/केंद्रीय के लिए',
    'Product List': 'उत्पाद सूची',
    'Items manufactured/sold': 'निर्मित/बेची गई वस्तुएं',
    'Renewal is Required': 'नवीनीकरण आवश्यक है',
    'Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.': 'प्रतिवर्ष या एक साथ 5 वर्षों तक नवीनीकरण करें। ₹5 लाख तक के जुर्माने से बचने के लिए समाप्ति से 30 दिन पहले आवेदन करें।',
    'Mandatory Display Rule': 'अनिवार्य प्रदर्शन नियम',
    'The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.': '14 अंकों का FSSAI नंबर आपके परिसर में दिखाई देना चाहिए और सभी खाद्य पैकेजिंग पर छपा होना चाहिए।'
  },
  ta: {
    'Food Safety License': 'உணவு பாதுகாப்பு உரிமம்',
    'Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.': 'உணவைத் தொடும், சமைக்கும், பேக் செய்யும், கொண்டு செல்லும் அல்லது விற்கும் எவருக்கும் கட்டாயம். FSSAI ஆல் நிர்வகிக்கப்படுகிறது.',
    'Which license do you need?': 'உங்களுக்கு எந்த உரிமம் தேவை?',
    'Basic Registration': 'அடிப்படை பதிவு',
    'Turnover below ₹12 Lakhs/yr': 'ஆண்டுக்கு ₹12 லட்சத்திற்கும் குறைவான வருவாய்',
    'Fee: ₹100 per year': 'கட்டணம்: ஆண்டுக்கு ₹100',
    'Best for: Petty vendors, roadside stalls, and home-based businesses.': 'சிறந்தது: சிறு வியாபாரிகள், சாலையோரக் கடைகள் மற்றும் வீட்டில் செயல்படும் வணிகங்கள்.',
    'State License': 'மாநில உரிமம்',
    'Turnover ₹12L to ₹20 Cr/yr': 'வருவாய் ₹12 லட்சம் முதல் ₹20 கோடி/ஆண்டு',
    'Fee: ₹2,000 to ₹5,000 per year': 'கட்டணம்: ஆண்டுக்கு ₹2,000 முதல் ₹5,000 வரை',
    'Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.': 'சிறந்தது: உணவகங்கள், கிளவுட் கிச்சன்கள், கேட்டரர்கள் மற்றும் நடுத்தர அளவிலான தயாரிப்பாளர்கள்.',
    'Central License': 'மத்திய உரிமம்',
    'Turnover above ₹20 Crores/yr': 'ஆண்டுக்கு ₹20 கோடிக்கு மேல் வருவாய்',
    'Fee: ₹7,500 per year': 'கட்டணம்: ஆண்டுக்கு ₹7,500',
    'Required for: Large manufacturers, importers, and multi-state operations.': 'தேவை: பெரிய உற்பத்தியாளர்கள், இறக்குமதியாளர்கள் மற்றும் பல மாநில செயல்பாடுகள்.',
    'Who exactly needs it?': 'இது யாருக்கு தேவை?',
    'Eateries & Kitchens': 'உணவகங்கள் & சமையலறைகள்',
    'Restaurants & cloud kitchens': 'உணவகங்கள் மற்றும் கிளவுட் கிச்சன்கள்',
    'Retail & Grocery': 'சில்லறை மற்றும் மளிகை',
    'Marts & roadside stalls': 'மார்ட்ஸ் மற்றும் சாலையோரக் கடைகள்',
    'Transport': 'போக்குவரத்து',
    'Cold storage & aggregators': 'குளிர்பதனக் கிடங்கு & திரட்டுபவர்கள்',
    'Manufacturing': 'உற்பத்தி',
    'Processing & dairy units': 'பதப்படுத்துதல் மற்றும் பால் அலகுகள்',
    'Documents Required': 'தேவையான ஆவணங்கள்',
    'Owner ID': 'உரிமையாளர் ஐடி',
    'Govt-issued Photo ID': 'அரசு வழங்கிய புகைப்பட ஐடி',
    'Premises Proof': 'வளாகத்தின் சான்று',
    'Rental or ownership doc': 'வாடகை அல்லது உரிமை ஆவணம்',
    'Safety Plan': 'பாதுகாப்பு திட்டம்',
    'For State/Central only': 'மாநில/மத்தியக்கு மட்டும்',
    'Product List': 'தயாரிப்பு பட்டியல்',
    'Items manufactured/sold': 'தயாரிக்கப்பட்ட/விற்கப்படும் பொருட்கள்',
    'Renewal is Required': 'புதுப்பித்தல் அவசியம்',
    'Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.': 'ஆண்டுதோறும் அல்லது ஒரே நேரத்தில் 5 ஆண்டுகள் வரை புதுப்பிக்கவும். ₹5 லட்சம் வரையிலான அபராதங்களைத் தவிர்க்க காலாவதியாகும் 30 நாட்களுக்கு முன் விண்ணப்பிக்கவும்.',
    'Mandatory Display Rule': 'கட்டாய காட்சி விதி',
    'The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.': '14 இலக்க FSSAI எண் உங்கள் வளாகத்தில் தெரிந்திருக்க வேண்டும் மற்றும் அனைத்து உணவுப் பொதிகளிலும் அச்சிடப்பட வேண்டும்.'
  },
  te: {
    'Food Safety License': 'ఆహార భద్రత లైసెన్స్',
    'Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.': 'ఆహారాన్ని తాకే, వండే, ప్యాక్ చేసే, రవాణా చేసే లేదా విక్రయించే ఎవరికైనా తప్పనిసరి. FSSAI ద్వారా నిర్వహించబడుతుంది.',
    'Which license do you need?': 'మీకు ఏ లైసెన్స్ కావాలి?',
    'Basic Registration': 'ప్రాథమిక నమోదు',
    'Turnover below ₹12 Lakhs/yr': 'సంవత్సరానికి ₹12 లక్షల లోపు టర్నోవర్',
    'Fee: ₹100 per year': 'రుసుము: సంవత్సరానికి ₹100',
    'Best for: Petty vendors, roadside stalls, and home-based businesses.': 'ఉత్తమమైనది: చిన్న వ్యాపారులు, రోడ్డు పక్కన దుకాణాలు మరియు గృహ-ఆధారిత వ్యాపారాలు.',
    'State License': 'రాష్ట్ర లైసెన్స్',
    'Turnover ₹12L to ₹20 Cr/yr': 'టర్నోవర్ ₹12 లక్షల నుండి ₹20 కోట్ల/సంవత్సరానికి',
    'Fee: ₹2,000 to ₹5,000 per year': 'రుసుము: సంవత్సరానికి ₹2,000 నుండి ₹5,000',
    'Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.': 'ఉత్తమమైనది: రెస్టారెంట్లు, క్లౌడ్ కిచెన్‌లు, క్యాటరర్లు మరియు మధ్య తరహా తయారీదారులు.',
    'Central License': 'కేంద్ర లైసెన్స్',
    'Turnover above ₹20 Crores/yr': 'సంవత్సరానికి ₹20 కోట్లకు పైగా టర్నోవర్',
    'Fee: ₹7,500 per year': 'రుసుము: సంవత్సరానికి ₹7,500',
    'Required for: Large manufacturers, importers, and multi-state operations.': 'అవసరం: పెద్ద తయారీదారులు, దిగుమతిదారులు మరియు బహుళ-రాష్ట్ర కార్యకలాపాలు.',
    'Who exactly needs it?': 'ఇది ఖచ్చితంగా ఎవరికి కావాలి?',
    'Eateries & Kitchens': 'భోజనశాలలు & వంటశాలలు',
    'Restaurants & cloud kitchens': 'రెస్టారెంట్లు మరియు క్లౌడ్ కిచెన్‌లు',
    'Retail & Grocery': 'రిటైల్ & కిరాణా',
    'Marts & roadside stalls': 'మార్ట్‌లు మరియు రోడ్డు పక్కన దుకాణాలు',
    'Transport': 'రవాణా',
    'Cold storage & aggregators': 'కోల్డ్ స్టోరేజ్ & అగ్రిగేటర్లు',
    'Manufacturing': 'తయారీ',
    'Processing & dairy units': 'ప్రాసెసింగ్ & డెయిరీ యూనిట్లు',
    'Documents Required': 'అవసరమైన పత్రాలు',
    'Owner ID': 'యజమాని ID',
    'Govt-issued Photo ID': 'ప్రభుత్వం జారీ చేసిన ఫోటో ID',
    'Premises Proof': 'ప్రాంగణ రుజువు',
    'Rental or ownership doc': 'అద్దె లేదా యాజమాన్య పత్రం',
    'Safety Plan': 'భద్రతా ప్రణాళిక',
    'For State/Central only': 'రాష్ట్ర/కేంద్ర కోసం మాత్రమే',
    'Product List': 'ఉత్పత్తి జాబితా',
    'Items manufactured/sold': 'తయారు చేయబడిన/విక్రయించబడిన వస్తువులు',
    'Renewal is Required': 'పునరుద్ధరణ అవసరం',
    'Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.': 'వార్షికంగా లేదా ఒకేసారి 5 సంవత్సరాల వరకు పునరుద్ధరించండి. ₹5 లక్షల వరకు జరిమానాలను నివారించడానికి గడువు ముగియడానికి 30 రోజుల ముందు దరఖాస్తు చేసుకోండి.',
    'Mandatory Display Rule': 'తప్పనిసరి ప్రదర్శన నియమం',
    'The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.': '14-అంకెల FSSAI నంబర్ మీ ప్రాంగణంలో కనిపించాలి మరియు అన్ని ఆహార ప్యాకేజింగ్‌పై ముద్రించబడాలి.'
  },
  bn: {
    'Food Safety License': 'খাদ্য নিরাপত্তা লাইসেন্স',
    'Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.': 'খাদ্য স্পর্শ, রান্না, প্যাকিং, পরিবহন বা বিক্রি করে এমন যে কারও জন্য বাধ্যতামূলক। FSSAI দ্বারা পরিচালিত।',
    'Which license do you need?': 'আপনার কোন লাইসেন্স দরকার?',
    'Basic Registration': 'মৌলিক নিবন্ধন',
    'Turnover below ₹12 Lakhs/yr': 'বছরে ₹১২ লাখের নিচে টার্নওভার',
    'Fee: ₹100 per year': 'ফি: প্রতি বছর ₹১০০',
    'Best for: Petty vendors, roadside stalls, and home-based businesses.': 'সেরা: খুচরা বিক্রেতা, রাস্তার ধারের স্টল এবং বাড়িতে ভিত্তিক ব্যবসা।',
    'State License': 'রাজ্য লাইসেন্স',
    'Turnover ₹12L to ₹20 Cr/yr': 'টার্নওভার ₹১২ লাখ থেকে ₹২০ কোটি/বছর',
    'Fee: ₹2,000 to ₹5,000 per year': 'ফি: প্রতি বছর ₹২,০০০ থেকে ₹৫,০০০',
    'Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.': 'সেরা: রেস্তোরাঁ, ক্লাউড কিচেন, ক্যাটারার এবং মাঝারি আকারের নির্মাতা।',
    'Central License': 'কেন্দ্রীয় লাইসেন্স',
    'Turnover above ₹20 Crores/yr': 'বছরে ₹২০ কোটির উপরে টার্নওভার',
    'Fee: ₹7,500 per year': 'ফি: প্রতি বছর ₹৭,৫০০',
    'Required for: Large manufacturers, importers, and multi-state operations.': 'প্রয়োজন: বড় প্রস্তুতকারক, আমদানিকারক এবং বহু-রাজ্য ক্রিয়াকলাপ।',
    'Who exactly needs it?': 'কার ঠিক এটি প্রয়োজন?',
    'Eateries & Kitchens': 'খাবারের দোকান ও রান্নাঘর',
    'Restaurants & cloud kitchens': 'রেস্তোরাঁ এবং ক্লাউড কিচেন',
    'Retail & Grocery': 'খুচরা এবং মুদি',
    'Marts & roadside stalls': 'মার্ট এবং রাস্তার ধারের স্টল',
    'Transport': 'পরিবহন',
    'Cold storage & aggregators': 'কোল্ড স্টোরেজ এবং এগ্রিগেটর',
    'Manufacturing': 'উত্পাদন',
    'Processing & dairy units': 'প্রক্রিয়াকরণ এবং দুগ্ধ ইউনিট',
    'Documents Required': 'প্রয়োজনীয় নথিপত্র',
    'Owner ID': 'মালিকের আইডি',
    'Govt-issued Photo ID': 'সরকার-প্রদত্ত ফটো আইডি',
    'Premises Proof': 'প্রাঙ্গনের প্রমাণ',
    'Rental or ownership doc': 'ভাড়া বা মালিকানার নথি',
    'Safety Plan': 'নিরাপত্তা পরিকল্পনা',
    'For State/Central only': 'শুধুমাত্র রাজ্য/কেন্দ্রীয়ের জন্য',
    'Product List': 'পণ্য তালিকা',
    'Items manufactured/sold': 'উত্পাদিত/বিক্রিত আইটেম',
    'Renewal is Required': 'নবায়ন প্রয়োজন',
    'Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.': 'বার্ষিক বা একবারে ৫ বছর পর্যন্ত নবায়ন করুন। ₹৫ লাখ পর্যন্ত জরিমানা এড়াতে মেয়াদের ৩০ দিন আগে আবেদন করুন।',
    'Mandatory Display Rule': 'বাধ্যতামূলক প্রদর্শন নিয়ম',
    'The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.': '১৪-সংখ্যার FSSAI নম্বরটি আপনার প্রাঙ্গনে দৃশ্যমান হতে হবে এবং সমস্ত খাদ্য প্যাকেজিংয়ে মুদ্রিত হতে হবে.'
  },
  kan: {
    'Food Safety License': 'ಆಹಾರ ಸುರಕ್ಷತೆ ಪರವಾನಗಿ',
    'Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.': 'ಆಹಾರವನ್ನು ಸ್ಪರ್ಶಿಸುವ, ಬೇಯಿಸುವ, ಪ್ಯಾಕ್ ಮಾಡುವ, ಸಾಗಿಸುವ ಅಥವಾ ಮಾರಾಟ ಮಾಡುವ ಯಾರಿಗಾದರೂ ಕಡ್ಡಾಯ. FSSAI ನಿಂದ ನಿಯಂತ್ರಿಸಲ್ಪಡುತ್ತದೆ.',
    'Which license do you need?': 'ನಿಮಗೆ ಯಾವ ಪರವಾನಗಿ ಬೇಕು?',
    'Basic Registration': 'ಮೂಲ ನೋಂದಣಿ',
    'Turnover below ₹12 Lakhs/yr': 'ವರ್ಷಕ್ಕೆ ₹12 ಲಕ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಹಿವಾಟು',
    'Fee: ₹100 per year': 'ಶುಲ್ಕ: ವರ್ಷಕ್ಕೆ ₹100',
    'Best for: Petty vendors, roadside stalls, and home-based businesses.': 'ಉತ್ತಮ: ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳು, ರಸ್ತೆಬದಿಯ ಮಳಿಗೆಗಳು ಮತ್ತು ಮನೆ ಆಧಾರಿತ ವ್ಯಾಪಾರಗಳು.',
    'State License': 'ರಾಜ್ಯ ಪರವಾನಗಿ',
    'Turnover ₹12L to ₹20 Cr/yr': 'ವಹಿವಾಟು ₹12 ಲಕ್ಷದಿಂದ ₹20 ಕೋಟಿ/ವರ್ಷಕ್ಕೆ',
    'Fee: ₹2,000 to ₹5,000 per year': 'ಶುಲ್ಕ: ವರ್ಷಕ್ಕೆ ₹2,000 ದಿಂದ ₹5,000',
    'Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.': 'ಉತ್ತಮ: ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು, ಕ್ಲೌಡ್ ಕಿಚನ್‌ಗಳು, ಕ್ಯಾಟರರ್‌ಗಳು ಮತ್ತು ಮಧ್ಯಮ ಗಾತ್ರದ ತಯಾರಕರು.',
    'Central License': 'ಕೇಂದ್ರ ಪರವಾನಗಿ',
    'Turnover above ₹20 Crores/yr': 'ವರ್ಷಕ್ಕೆ ₹20 ಕೋಟಿಗೂ ಅಧಿಕ ವಹಿವಾಟು',
    'Fee: ₹7,500 per year': 'ಶುಲ್ಕ: ವರ್ಷಕ್ಕೆ ₹7,500',
    'Required for: Large manufacturers, importers, and multi-state operations.': 'ಅಗತ್ಯವಿದೆ: ದೊಡ್ಡ ತಯಾರಕರು, ಆಮದುದಾರರು ಮತ್ತು ಬಹು-ರಾಜ್ಯ ಕಾರ್ಯಾಚರಣೆಗಳು.',
    'Who exactly needs it?': 'ಇದು ನಿಖರವಾಗಿ ಯಾರಿಗೆ ಬೇಕು?',
    'Eateries & Kitchens': 'ಉಪಹಾರ ಗೃಹಗಳು ಮತ್ತು ಅಡಿಗೆಮನೆಗಳು',
    'Restaurants & cloud kitchens': 'ರೆಸ್ಟೋರೆಂಟ್‌ಗಳು ಮತ್ತು ಕ್ಲೌಡ್ ಕಿಚನ್‌ಗಳು',
    'Retail & Grocery': 'ಚಿಲ್ಲರೆ ಮತ್ತು ದಿನಸಿ',
    'Marts & roadside stalls': 'ಮಾರ್ಟ್ಸ್ ಮತ್ತು ರಸ್ತೆಬದಿಯ ಮಳಿಗೆಗಳು',
    'Transport': 'ಸಾರಿಗೆ',
    'Cold storage & aggregators': 'ಕೋಲ್ಡ್ ಸ್ಟೋರೇಜ್ ಮತ್ತು ಅಗ್ರಿಗೇಟರ್‌ಗಳು',
    'Manufacturing': 'ತಯಾರಿಕೆ',
    'Processing & dairy units': 'ಸಂಸ್ಕರಣೆ ಮತ್ತು ಡೈರಿ ಘಟಕಗಳು',
    'Documents Required': 'ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು',
    'Owner ID': 'ಮಾಲೀಕರ ಐಡಿ',
    'Govt-issued Photo ID': 'ಸರ್ಕಾರ ನೀಡಿದ ಫೋಟೋ ಐಡಿ',
    'Premises Proof': 'ಆವರಣದ ಪುರಾವೆ',
    'Rental or ownership doc': 'ಬಾಡಿಗೆ ಅಥವಾ ಮಾಲೀಕತ್ವದ ದಾಖಲೆ',
    'Safety Plan': 'ಸುರಕ್ಷತಾ ಯೋಜನೆ',
    'For State/Central only': 'ರಾಜ್ಯ/ಕೇಂದ್ರಕ್ಕೆ ಮಾತ್ರ',
    'Product List': 'ಉತ್ಪನ್ನಗಳ ಪಟ್ಟಿ',
    'Items manufactured/sold': 'ತಯಾರಿಸಿದ/ಮಾರಾಟವಾದ ವಸ್ತುಗಳು',
    'Renewal is Required': 'ನವೀಕರಣ ಅಗತ್ಯವಿದೆ',
    'Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.': 'ವಾರ್ಷಿಕವಾಗಿ ಅಥವಾ ಒಮ್ಮೆಗೆ 5 ವರ್ಷಗಳವರೆಗೆ ನವೀಕರಿಸಿ. ₹5 ಲಕ್ಷದವರೆಗಿನ ದಂಡವನ್ನು ತಪ್ಪಿಸಲು ಅವಧಿ ಮುಗಿಯುವ 30 ದಿನಗಳ ಮೊದಲು ಅರ್ಜಿ ಸಲ್ಲಿಸಿ.',
    'Mandatory Display Rule': 'ಕಡ್ಡಾಯ ಪ್ರದರ್ಶನ ನಿಯಮ',
    'The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.': '14-ಅಂಕಿಯ FSSAI ಸಂಖ್ಯೆಯು ನಿಮ್ಮ ಆವರಣದಲ್ಲಿ ಗೋಚರಿಸಬೇಕು ಮತ್ತು ಎಲ್ಲಾ ಆಹಾರ ಪ್ಯಾಕೇಜಿಂಗ್‌ನಲ್ಲಿ ಮುದ್ರಿಸಲ್ಪಡಬೇಕು.'
  }
};

export const FssaiGuide = () => {
  const langCode = (useChatStore((state) => state.profile.preferredLanguage) as string) || 'en';
  const { readAloud, isPlaying } = useReadAloud();
  
  const t = (text: string) => FSSAI_TRANSLATIONS[langCode]?.[text] || text;

  // Collect all visible text in reading order
  const getGuideText = () => [
    t('Food Safety License'),
    t('Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.'),
    t('Which license do you need?'),
    t('Basic Registration'), t('Turnover below ₹12 Lakhs/yr'), t('Fee: ₹100 per year'), t('Best for: Petty vendors, roadside stalls, and home-based businesses.'),
    t('State License'), t('Turnover ₹12L to ₹20 Cr/yr'), t('Fee: ₹2,000 to ₹5,000 per year'), t('Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.'),
    t('Central License'), t('Turnover above ₹20 Crores/yr'), t('Fee: ₹7,500 per year'), t('Required for: Large manufacturers, importers, and multi-state operations.'),
    t('Who exactly needs it?'),
    t('Eateries & Kitchens'), t('Restaurants & cloud kitchens'),
    t('Retail & Grocery'), t('Marts & roadside stalls'),
    t('Transport'), t('Cold storage & aggregators'),
    t('Manufacturing'), t('Processing & dairy units'),
    t('Documents Required'),
    t('Owner ID'), t('Govt-issued Photo ID'),
    t('Premises Proof'), t('Rental or ownership doc'),
    t('Safety Plan'), t('For State/Central only'),
    t('Product List'), t('Items manufactured/sold'),
    t('Renewal is Required'), t('Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.'),
    t('Mandatory Display Rule'), t('The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.'),
  ].join('. ');

  return (
    <div className="w-full flex flex-col gap-5 animate-fade-in-up pb-8">
      
      {/* READ ALOUD BUTTON */}
      <button
        onClick={() => readAloud(getGuideText(), langCode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start
          ${isPlaying 
            ? 'bg-orange-100 text-orange-700 border border-orange-200' 
            : 'bg-white text-slate-700 border border-gray-200 hover:border-orange-200 hover:text-orange-600'
          }`}
      >
        {isPlaying ? '⏹ Stop' : '🔊 Read out loud'}
      </button>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#FFF8F3] border border-orange-100 rounded-[2rem] relative overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)]">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4 relative">
          <Utensils size={28} className="text-orange-500" strokeWidth={2} />
        </div>
        <h4 className="text-slate-900 font-bold text-xl mb-2 tracking-tight relative text-center">
          {t('Food Safety License')}
        </h4>
        <p className="text-slate-600 text-[13px] text-center leading-relaxed max-w-[280px] relative">
          {t('Mandatory for anyone touching, cooking, packing, transporting, or selling food. Governed by the FSSAI.')}
        </p>
        <ChefHat size={160} className="absolute -left-8 -bottom-8 text-orange-500/5 rotate-[-15deg] pointer-events-none" />
      </div>

      {/* LICENSE TIERS */}
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold text-slate-900 text-[16px] tracking-tight px-1">
          {t('Which license do you need?')}
        </h4>
        
        {/* Basic */}
        <div className="border border-emerald-100 bg-[#F2FDF7] rounded-[1.5rem] p-5 relative overflow-hidden transition-all hover:shadow-sm">
          <Store className="absolute right-[-10px] top-[-10px] text-emerald-500/10" size={100} strokeWidth={1} />
          <h5 className="font-bold text-emerald-950 text-[16px] mb-1 relative ">{t('Basic Registration')}</h5>
          <p className="text-[13px] text-emerald-800/80 mb-3 relative ">{t('Turnover below ₹12 Lakhs/yr')}</p>
          <div className="inline-block bg-white text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-50 relative ">
            {t('Fee: ₹100 per year')}
          </div>
          <p className="text-[12px] text-emerald-800/70 mt-3 leading-snug relative ">
            {t('Best for: Petty vendors, roadside stalls, and home-based businesses.')}
          </p>
        </div>

        {/* State */}
        <div className="border border-blue-100 bg-[#F4F8FF] rounded-[1.5rem] p-5 relative overflow-hidden transition-all hover:shadow-sm">
          <Factory className="absolute right-[-10px] top-[-10px] text-blue-500/10" size={100} strokeWidth={1} />
          <h5 className="font-bold text-blue-950 text-[16px] mb-1 relative ">{t('State License')}</h5>
          <p className="text-[13px] text-blue-800/80 mb-3 relative ">{t('Turnover ₹12L to ₹20 Cr/yr')}</p>
          <div className="inline-block bg-white text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-blue-50 relative ">
            {t('Fee: ₹2,000 to ₹5,000 per year')}
          </div>
          <p className="text-[12px] text-blue-800/70 mt-3 leading-snug relative ">
            {t('Best for: Restaurants, cloud kitchens, caterers, and mid-sized makers.')}
          </p>
        </div>

        {/* Central */}
        <div className="border border-purple-100 bg-[#F8F5FF] rounded-[1.5rem] p-5 relative overflow-hidden transition-all hover:shadow-sm">
          <Factory className="absolute right-[-10px] top-[-10px] text-purple-500/10" size={100} strokeWidth={1} />
          <h5 className="font-bold text-purple-950 text-[16px] mb-1 relative ">{t('Central License')}</h5>
          <p className="text-[13px] text-purple-800/80 mb-3 relative ">{t('Turnover above ₹20 Crores/yr')}</p>
          <div className="inline-block bg-white text-purple-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm border border-purple-50 relative ">
            {t('Fee: ₹7,500 per year')}
          </div>
          <p className="text-[12px] text-purple-800/70 mt-3 leading-snug relative ">
            {t('Required for: Large manufacturers, importers, and multi-state operations.')}
          </p>
        </div>
      </div>

      {/* WHO NEEDS IT */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <h4 className="text-[15px] font-bold text-slate-900 mb-4 tracking-tight">
          {t('Who exactly needs it?')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ChefHat, title: "Eateries & Kitchens", desc: "Restaurants & cloud kitchens" },
            { icon: ShoppingBag, title: "Retail & Grocery", desc: "Marts & roadside stalls" },
            { icon: Truck, title: "Transport", desc: "Cold storage & aggregators" },
            { icon: Factory, title: "Manufacturing", desc: "Processing & dairy units" },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <item.icon size={18} className="text-orange-500 mb-2" strokeWidth={2} />
              <h5 className="font-semibold text-slate-800 text-[12px] mb-0.5">{t(item.title)}</h5>
              <p className="text-[11px] text-slate-500 leading-snug">{t(item.desc)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENTS REQUIRED */}
      <div className="p-5 bg-white border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] rounded-[1.5rem]">
        <h4 className="text-[15px] font-bold text-slate-900 mb-4 tracking-tight">
          {t('Documents Required')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: IdCard, title: "Owner ID", desc: "Govt-issued Photo ID" },
            { icon: MapPin, title: "Premises Proof", desc: "Rental or ownership doc" },
            { icon: ClipboardCheck, title: "Safety Plan", desc: "For State/Central only" },
            { icon: Package, title: "Product List", desc: "Items manufactured/sold" },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-gray-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                <doc.icon size={16} className="text-slate-600" />
              </div>
              <div>
                <h5 className="font-semibold text-slate-800 text-[12px]">{t(doc.title)}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-1">{t(doc.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ALERTS */}
      <div className="flex flex-col gap-3">
        {/* Renewal Alert */}
        <div className="bg-[#FFF9EA] border border-[#FDE6B0] rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
          <Clock className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="text-[13px] font-bold text-amber-950 mb-0.5">{t('Renewal is Required')}</h5>
            <p className="text-[12px] text-amber-900/80 leading-relaxed">
              {t('Renew annually or up to 5 years at once. Apply 30 days before expiry to avoid fines up to ₹5 Lakhs.')}
            </p>
          </div>
        </div>

        {/* Display Alert */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-[1.25rem] p-4 flex gap-3 shadow-sm">
          <ThumbsUp className="text-slate-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h5 className="text-[13px] font-bold text-slate-800 mb-0.5">{t('Mandatory Display Rule')}</h5>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              {t('The 14-digit FSSAI number must be visible at your premises and printed on all food packaging.')}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};