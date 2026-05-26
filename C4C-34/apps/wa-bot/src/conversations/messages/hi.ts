/**
 * Hindi (हिन्दी) copy for HastKala BolKeBecho.
 * Tone: respectful (आप form), warm, simple Hindi (no Sanskritized vocabulary).
 * Reading level: 8th grade rural Hindi.
 */
import type { MessageRegistry } from "./types";
import type { ProductDraftResponse } from "../../types";

export const hi: MessageRegistry = {
  // ----- First-time setup -----

  greeting: () =>
    `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

नमस्ते 🙏 आपका स्वागत है!

हम महिला कारीगरों को हस्तनिर्मित उत्पाद *सीधे* ग्राहकों को बेचने में मदद करते हैं — बिना बिचौलिए।

💬 *कुछ भी टाइप करें या वॉइस नोट भेजें — मैं आपकी मदद करूँगा!*

अपनी भाषा चुनें / Choose your language:

1. English
2. हिन्दी
3. ಕನ್ನಡ (Kannada)
4. தமிழ் (Tamil)
5. മലയാളം (Malayalam)

_शुरू करने के लिए एक नंबर भेजें।_`,

  languageInvalid: () =>
    `कृपया 1 से 5 तक का कोई नंबर भेजें।

1. English
2. हिन्दी
3. ಕನ್ನಡ
4. தமிழ்
5. മലയാളം`,

  languageConfirmed: (language: string) =>
    `बहुत बढ़िया ✅ ${language} चुना गया।

💡 _वॉइस नोट भी भेज सकते हैं। *EXIT* लिखें छोड़ने के लिए, *MENU* वापस आने के लिए।_

कभी भी भाषा बदलने के लिए *LANGUAGE* टाइप करें।`,

  languageInstructions: () =>
    `📚 *शुरू करने से पहले छोटा गाइड*

✍️  *टाइप* करें कुछ भी पूछने के लिए
🎙️  *वॉइस नोट* — अपनी भाषा में बोलें
1️⃣  *नंबर* मेनू से विकल्प चुनने के लिए
🌐  *MENU* — मुख्य मेनू पर लौटें
↩️  *BACK* — एक कदम पीछे
👋  *EXIT* — छोड़ें (आपका डेटा सुरक्षित रहेगा)
🤝  *HUMAN* — कारीगर सखी से बात करें

_तैयार हैं? चलिए शुरू करते हैं।_`,

  replyModeAsk: () =>
    `मैं कैसे जवाब दूँ?

1. 📝 सिर्फ टेक्स्ट
2. 🎙️ सिर्फ वॉइस
3. 📝+🎙️ दोनों (टेक्स्ट + वॉइस)

_एक नंबर भेजें।_`,

  roleAsk: () =>
    `आप कौन हैं?

1. *विक्रेता* — मैं हस्तनिर्मित उत्पाद बनाती/बेचती हूँ
2. *खरीदार* — मुझे कारीगरों से उत्पाद खरीदने हैं

_एक नंबर भेजें।_`,

  roleInvalid: () => `कृपया 1 या 2 भेजें।`,

  roleConfirmed: (role) => {
    const label = { seller: "विक्रेता / कारीगर", buyer: "खरीदार", sakhi: "कारीगर सखी" }[role];
    return `स्वागत है 🌸 आप *${label}* के रूप में जुड़ रहे हैं।`;
  },

  tutorial: (videoUrl: string) =>
    `यहाँ HastKala का 1 मिनट का गाइड है 🎥

${videoUrl}

जवाब दें:
1. आगे बढ़ें
2. वीडियो दोबारा देखें`,

  tutorialPostText: (role) =>
    role === "buyer"
      ? `*आसान कदम:*

1. उत्पाद खोजें
2. अपना बजट लिखें
3. पहले खरीदा हुआ सामान साइट पर है या नहीं जांचें, ताकि फिर से खरीद सकें
4. खरीदार ऑर्डर इतिहास देखें
5. आदि

_आगे बढ़ने के लिए 1 भेजें।_`
      : `*आसान कदम:*

1. उत्पाद की फोटो भेजें
2. कीमत और जानकारी दें
3. पुष्टि करें — उत्पाद HastKala पर लाइव हो जाएगा
4. खरीदार ऑर्डर करेंगे — आपको WhatsApp पर सूचना मिलेगी

_आगे बढ़ने के लिए 1 भेजें।_`,

  // ----- Seller community / certification gate -----

  sellerPrecheckName: () =>
    `🌸 *HastKala विक्रेता में आपका स्वागत है!*

समुदाय का लिंक भेजने से पहले हमें कुछ जानकारी चाहिए ताकि हमारे प्रतिनिधि आपसे संपर्क कर सकें।

📍 *चरण 1/3* — आपका *पूरा नाम* क्या है?

_उदाहरण: लक्ष्मी देवी_`,

  sellerPrecheckAddress: () =>
    `📍 📍 *चरण 2/3* — आपका *पूरा पता* क्या है?

इससे हम आपके पास के खरीदारों से जोड़ सकेंगे और पिकअप की व्यवस्था कर सकेंगे।

_उदाहरण: मकान 45, मुख्य सड़क, मंगलूर, दक्षिण कन्नड़, कर्नाटक 575001_`,

  sellerPrecheckContact: (currentPhone: string) =>
    `📞 📍 *चरण 3/3* — आपका *सबसे अच्छा संपर्क नंबर* क्या है?

एक नंबर भेजें, या *0* लिखें यदि यही WhatsApp नंबर इस्तेमाल करना है (${currentPhone})।

_उदाहरण: 9876543210_`,

  sellerCommunityJoin: (communityLink: string) =>
    `✅ *ठीक है, धन्यवाद!*

आपकी जानकारी सहेज ली गई। अब *7-दिन के Seller Cohort* में शामिल हों — यह एक मुफ़्त WhatsApp समुदाय है जहाँ आप:

✅ काम करने का तरीका सीखेंगी
✅ अन्य कारीगरों से जुड़ेंगी
✅ खरीदारों का विश्वास बनाएंगी
✅ अपना *HastKala Seller Certificate* पाएंगी

👉 *यहाँ समुदाय में शामिल हों:*
${communityLink}

*HastKala समुदाय का एक प्रतिनिधि* शीघ्र ही cohort में शामिल होने की औपचारिकताओं के लिए आपसे संपर्क करेगा।

7 दिन के कार्यशाला के बाद आपको यहाँ WhatsApp पर अपना सर्टिफिकेट स्वतः मिल जाएगा और आपका विक्रेता खाता तुरंत खुल जाएगा।

_खरीदार की तरह खरीदारी करने के लिए *BUYER* लिखें, या शुरू से करने के लिए *RESET* लिखें।_`,

  sellerCommunityWaiting: () =>
    `⏳ *हम आपके सर्टिफिकेट का इंतज़ार कर रहे हैं!*

7 दिन का cohort पूरा होने पर समुदाय टीम आपका सर्टिफिकेट जारी करेगी। *आपका खाता अपने आप खुल जाएगा* — सर्टिफिकेट तैयार होते ही यहाँ WhatsApp पर मिलेगा।

_तब तक आप देख सकती हैं:_
• उत्पाद देखने के लिए *BROWSE* लिखें
• खोजने के लिए *SEARCH* लिखें`,

  sellerCommunityAlreadyJoined: () =>
    `✅ *सब तैयार है।*

हमारे समुदाय प्रतिनिधि शीघ्र ही आपसे संपर्क करेंगे। 7-दिन का cohort पूरा होने पर सर्टिफिकेट यहाँ WhatsApp पर आ जाएगा और विक्रेता खाता अपने आप खुल जाएगा।

_कुछ और करने की ज़रूरत नहीं — बस कार्यशाला पूरी करें।_`,

  sellerLockedMenu: () =>
    `🔒 *आपका विक्रेता खाता अभी नहीं खुला है।*

HastKala पर बेचने के लिए:

1️⃣ HastKala समुदाय में शामिल हों (लिंक के लिए *JOIN* लिखें)
2️⃣ 7-दिन का cohort पूरा करें
3️⃣ आपका सर्टिफिकेट अपने आप जारी होगा
4️⃣ खाता तुरंत खुल जाएगा — हम यहाँ सूचित करेंगे

_तब तक आप खरीदार के रूप में देख सकती हैं:_
• उत्पाद देखने के लिए *BROWSE* लिखें
• खोजने के लिए *SEARCH* लिखें`,

  sellerCertUnlocked: (name: string) =>
    `🎉 *बधाई हो${name ? `, ${name} जी` : ""}!*

आपने HastKala 7-दिन का Seller Cohort पूरा कर लिया है ✅

आपका *HastKala Seller Certificate* नीचे भेजा जा रहा है 👇

आपका पूरा विक्रेता खाता अब *UNLOCKED* हो गया है 🔓

अब आप:
• उत्पाद जोड़ सकती हैं और ऑर्डर पा सकती हैं
• थोक खरीदारों से जुड़ सकती हैं
• अपनी कमाई देख सकती हैं

_HastKala परिवार में आपका स्वागत है! आइए शुरू करते हैं।_`,

  sellerCertPdfCaption: (name: string) =>
    `📜 *HastKala Seller Certificate*${name ? ` — ${name}` : ""}

यह आपका आधिकारिक सर्टिफिकेट है जो पुष्टि करता है कि आपने HastKala 7-दिन का Seller Cohort पूरा किया है।

_इसे सुरक्षित रखें — यह प्लेटफ़ॉर्म पर आपके विश्वास का प्रमाण है।_`,

  sellerCertTextFallback: (name: string) =>
    `📜 *HastKala Seller Certificate*

✅ यह प्रमाणित करता है कि *${name || "आप"}* ने HastKala 7-दिन का Seller Cohort सफलतापूर्वक पूरा किया है।

आप अब एक सत्यापित HastKala विक्रेता हैं। समुदाय में आपका स्वागत है! 🌸

_Certificate ID: HK-${Date.now().toString(36).toUpperCase()}_`,

  // ----- Returning user -----

  welcomeBack: (name?: string) =>
    name ? `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

वापसी पर स्वागत है, ${name} जी 🌸

💬 _कुछ भी टाइप करें या वॉइस नोट भेजें — मैं यहाँ हूँ!_` : `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

वापसी पर स्वागत है 🌸

💬 _कुछ भी टाइप करें या वॉइस नोट भेजें — मैं यहाँ हूँ!_`,

  whichRole: () =>
    `आप कैसे आगे बढ़ना चाहेंगी?

1. विक्रेता मेनू
2. खरीदार मेनू

_एक नंबर भेजें।_`,

  // ----- Seller onboarding -----

  sellerAskName: () =>
    `कृपया 📍 *चरण 1/3* — अपना *नाम* भेजें।

उदाहरण: लक्ष्मी`,

  sellerAskDistrict: () =>
    `📍 *चरण 2/3* — आप किस *जिले* से हैं?

उदाहरण: दक्षिण कन्नड़`,

  sellerAskCraft: () =>
    `📍 *चरण 3/3* — आप क्या बनाती हैं?

1. हस्तशिल्प
2. कपड़े / सिलाई
3. आभूषण
4. खाद्य पदार्थ
5. घर की सजावट
6. अन्य

_एक नंबर भेजें।_`,

  sellerAskShg: () =>
    `क्या आप किसी SHG, NGO या कारीगर समूह की सदस्य हैं?

1. हाँ
2. नहीं`,

  sellerAskShgName: () =>
    `कृपया *समूह का नाम* भेजें।

उदाहरण: सखी महिला SHG`,

  sellerAskSakhiHelp: () =>
    `क्या आप चाहती हैं कि आपके पास की *कारीगर सखी* आपकी मदद करें?

1. हाँ, कृपया जोड़ें
2. अभी नहीं`,

  sellerOnboardComplete: (name: string) =>
    `आपकी विक्रेता प्रोफ़ाइल तैयार है ✅

HastKala में स्वागत है, *${name}* जी 🌸
अब आप WhatsApp पर ही उत्पाद जोड़ और ऑर्डर पा सकती हैं।`,

  // ----- Buyer onboarding -----

  buyerAskName: () =>
    `हम आपको क्या नाम से बुलाएँ?

उदाहरण: राहुल`,

  buyerAskLocation: () =>
    `📍 *चरण 2/3* — आप किस *शहर* में हैं?

ताकि हम आपके पास के कारीगर दिखा सकें।

उदाहरण: बेंगलुरु`,

  buyerAskInterests: () =>
    `📍 *चरण 3/3* — आपकी रुचि किसमें है?

1. घर की सजावट
2. कपड़े / वस्त्र
3. आभूषण
4. खाद्य पदार्थ
5. उपहार
6. सब कुछ दिखाएँ

_एक नंबर भेजें।_`,

  buyerOnboardComplete: (name: string) =>
    `HastKala में स्वागत है, *${name}* जी 🛍️

पूरे भारत की महिला कारीगरों के हस्तनिर्मित उत्पाद देखें।`,

  // ----- Sakhi onboarding -----

  sakhiAskName: () =>
    `कृपया 📍 *चरण 1/3* — अपना *नाम* भेजें।

उदाहरण: प्रिया`,

  sakhiAskDistrict: () =>
    `आप किस *जिले* में काम करती हैं?

उदाहरण: धारवाड़`,

  sakhiAskGroups: () =>
    `आप किन कारीगरों, SHG या NGO के साथ काम करती हैं?

कुछ नाम भेजें — या *SKIP* टाइप करें।`,

  sakhiOnboardComplete: (name: string) =>
    `आपकी सखी प्रोफ़ाइल तैयार है ✅

स्वागत है, *${name}* जी 🌸
अब आप WhatsApp पर ही उत्पाद मंज़ूर कर सकती हैं और कारीगरों की मदद कर सकती हैं।`,

  // ----- Main menus -----

  sellerMenu: (name: string) =>
    `🌸 *नमस्ते ${name} जी, क्या करना चाहेंगी?*

1. नया उत्पाद जोड़ें
2. मेरे उत्पाद
3. ऑर्डर
4. खरीदार के अनुरोध
5. कमाई
6. और

_एक नंबर भेजें या विकल्प का नाम लिखें।_`,

  sellerMenuMore: () =>
    `*अधिक विकल्प:*

1. प्रोफ़ाइल बदलें
2. भाषा बदलें
3. कारीगर सखी से संपर्क
4. फोटो टिप्स
5. *🛍️ खरीदार मोड में जाएँ*
6. मदद

_एक नंबर भेजें या BACK लिखें।_`,

  buyerMenu: (name: string) =>
    `🛍️ *नमस्ते ${name} जी, क्या ढूँढ रहे हैं?*

1. उत्पाद देखें
2. लोकप्रिय
3. श्रेणियाँ
4. संदेश से खोजें
5. थोक ऑर्डर का अनुरोध
6. और

_एक नंबर भेजें या विकल्प का नाम लिखें।_`,

  buyerMenuMore: () =>
    `*अधिक विकल्प:*

1. मेरे ऑर्डर
2. सहेजे गए उत्पाद
3. स्थान बदलें
4. भाषा बदलें
5. *🌸 विक्रेता मोड में जाएँ*
6. मदद

_एक नंबर भेजें या BACK लिखें।_`,

  sakhiMenu: (name: string) =>
    `✅ *नमस्ते ${name} जी।*

1. लंबित उत्पाद
2. नए विक्रेता
3. ऑर्डर सहायता
4. खरीदार के अनुरोध
5. कारीगर कमाई
6. और

_एक नंबर भेजें।_`,

  sakhiMenuMore: () =>
    `*अधिक विकल्प:*

1. मेरी प्रोफ़ाइल
2. भाषा बदलें
3. मदद

_एक नंबर भेजें या BACK लिखें।_`,

  // ----- Add product -----

  addProductStart: () =>
    `🌸 आइए आपका उत्पाद जोड़ें।

*चरण 1 / 3:* कृपया उत्पाद की 1-3 *साफ़ फोटो* भेजें 📸

एक-एक करके भेज सकती हैं। पूरा होने पर *0* लिखें।

_टिप: अच्छी रोशनी, सादा बैकग्राउंड, पूरा उत्पाद दिखे।_`,

  addProductPhotoReceived: (count: number, max: number) =>
    `📸 फोटो ${count} / ${max} मिल गई ✅

और फोटो भेजें या *0* लिखें।`,

  addProductMaxPhotos: () =>
    `अधिकतम 3 फोटो हो गईं।

आगे बढ़ने के लिए *0* लिखें।`,

  addProductPhotosNeedFirst: () =>
    `कृपया पहले उत्पाद की *फोटो* भेजें 📸

फोटो मिलने पर मैं विवरण पूछूँगी।`,

  addProductAskDetails: () =>
    `*चरण 2 / 3:* अब उत्पाद के बारे में बताएँ।

आप *टाइप* कर सकती हैं या *वॉइस नोट* भेज सकती हैं।

कृपया बताएँ:
• उत्पाद का नाम
• कीमत (₹)
• कितने पीस उपलब्ध हैं
• सामग्री (वैकल्पिक)

उदाहरण: _हाथ से बना नारियल खोल का दीया, ₹600, 2 पीस_`,

  addProductCreating: () => `आपकी लिस्टिंग बनाई जा रही है... ✨`,

  addProductMissingPrice: () =>
    `फोटो और जानकारी मिल गई, लेकिन *कीमत* नहीं मिली।

कृपया कीमत भेजें।

उदाहरण: ₹600`,

  addProductMissingQuantity: () =>
    `कितने पीस उपलब्ध हैं?

उदाहरण: 2`,

  addProductMissingTitle: () =>
    `आपके उत्पाद का नाम क्या है?

उदाहरण: नारियल खोल दीया`,

  addProductDraftPreview: ({ title, price, quantity, material, category, description, photos }) => {
    const lines = [
      `*चरण 3 / 3: अपनी लिस्टिंग देखें*`,
      ``,
      `📦 *${title}*`,
      `💰 ₹${price}`,
      `📦 ${quantity} पीस उपलब्ध`,
    ];
    if (category) lines.push(`🏷️ ${category}`);
    if (material) lines.push(`🧵 ${material}`);
    lines.push(`📸 ${photos} फोटो`);
    if (description) {
      lines.push("");
      lines.push(`_${description}_`);
    }
    lines.push(
      "",
      `जवाब दें:`,
      `1. *पुष्टि करें* — HastKala पर लाइव करें`,
      `2. कीमत बदलें`,
      `3. मात्रा बदलें`,
      `4. नाम बदलें`,
      `5. विवरण बदलें`,
      `6. रद्द करें`,
    );
    return lines.join("\n");
  },

  addProductSubmitted: (_approvalUrl?: string) => {
    return `✅ आपका उत्पाद कारीगर सखी की समीक्षा के लिए भेज दिया गया है।

मंज़ूरी मिलने के बाद यह HastKala Haat पर लाइव होगा और आपको शेयर करने के लिए लिंक मिलेगा।

हम यहाँ सूचित करेंगे।

मेनू पर लौटने के लिए *MENU* लिखें।`;
  },

  addProductApproved: ({ title, publicUrl }) =>
    `🎉 बढ़िया खबर!

आपका उत्पाद *${title}* HastKala पर लाइव है।${publicUrl ? `\n\nदेखें: ${publicUrl}` : ""}

खरीदार अब ऑर्डर कर सकते हैं।`,

  addProductCancelled: () =>
    `लिस्टिंग रद्द कर दी गई।

मेनू पर लौटने के लिए *MENU* लिखें।`,

  addProductPriceUpdated: (price: number) => `कीमत ₹${price} कर दी गई ✅`,
  addProductQuantityUpdated: (quantity: number) => `मात्रा ${quantity} कर दी गई ✅`,
  addProductTitleUpdated: (title: string) => `नाम बदलकर *${title}* कर दिया ✅`,
  addProductDescriptionUpdated: () => `विवरण बदल दिया ✅`,

  addProductAskNewPrice: () =>
    `नई *कीमत* क्या है? (केवल नंबर)

उदाहरण: 700`,

  addProductAskNewQuantity: () =>
    `नई *मात्रा* क्या है?

उदाहरण: 3`,

  addProductAskNewTitle: () =>
    `नया *नाम* क्या है?

उदाहरण: इको नारियल दीया`,

  addProductAskNewDescription: () => `नया *विवरण* भेजें (1-3 वाक्य)।`,

  // ----- My products -----

  myProductsHeader: () => `📦 *आपके उत्पाद*`,

  myProductsEmpty: () =>
    `अभी कोई उत्पाद नहीं है।

पहला उत्पाद जोड़ने के लिए *ADD* लिखें।`,

  myProductsList: (items) => {
    const lines = [`📦 *आपके उत्पाद*`, ``];
    items.forEach((p, i) => {
      lines.push(`${i + 1}. *${p.title}*`);
      lines.push(`   ₹${p.price} · स्टॉक: ${p.quantity} · ${labelStatusHi(p.status)}`);
    });
    lines.push("");
    lines.push("_उत्पाद नंबर भेजें या BACK लिखें।_");
    return lines.join("\n");
  },

  myProductsManage: (title) =>
    `*${title}*

क्या करना चाहेंगी?

1. कीमत बदलें
2. स्टॉक बदलें
3. नाम बदलें
4. विवरण बदलें
5. 🗑️ उत्पाद हटाएं
6. लिंक देखें
7. वापस उत्पाद सूची पर

_एक नंबर भेजें।_`,

  myProductsStockUpdated: (quantity) => `स्टॉक ${quantity} कर दिया ✅`,

  myProductsSoldOut: (title) =>
    `*${title}* को आउट ऑफ स्टॉक कर दिया ✅
यह अब खरीदारों को नहीं दिखेगा।`,

  myProductsAskNewStock: () => `अभी कितने पीस उपलब्ध हैं?

उदाहरण: 5`,

  // ----- Orders -----

  ordersHeader: () => `📋 *आपके ऑर्डर*`,

  ordersEmpty: () =>
    `अभी कोई ऑर्डर नहीं है। खरीदार के ऑर्डर करते ही दिखेगा।

*MENU* लिखें वापस जाने के लिए।`,

  ordersList: (items) => {
    const lines = [`📋 *आपके ऑर्डर*`, ``];
    items.forEach((o, i) => {
      lines.push(`${i + 1}. *${o.productTitle}* — ₹${o.amount}`);
      lines.push(
        `   ${o.id} · ${labelOrderStatusHi(o.status)}${o.buyerCity ? ` · ${o.buyerCity}` : ""}`,
      );
    });
    lines.push("");
    lines.push("_ऑर्डर नंबर भेजें या BACK लिखें।_");
    return lines.join("\n");
  },

  orderDetail: ({ id, productTitle, quantity, amount, buyerCity, status }) =>
    `*ऑर्डर ${id}*

उत्पाद: ${productTitle}
मात्रा: ${quantity}
रकम: ₹${amount}
${buyerCity ? `शहर: ${buyerCity}\n` : ""}स्थिति: ${labelOrderStatusHi(status)}

जवाब दें:
1. ऑर्डर स्वीकारें
2. उपलब्ध नहीं
3. मदद चाहिए

_या BACK लिखें।_`,

  orderAccepted: () =>
    `ऑर्डर स्वीकार ✅

कृपया उत्पाद को सावधानी से पैक करें। कारीगर सखी पिकअप में मदद करेंगी।`,

  orderUnavailable: () =>
    `ऑर्डर को उपलब्ध नहीं चिह्नित कर दिया।

खरीदार को सूचित कर दिया जाएगा।`,

  // ----- Browse / search -----

  browseAskCategory: () =>
    `क्या देखना चाहेंगे?

1. घर की सजावट
2. कपड़े / वस्त्र
3. आभूषण
4. खाद्य पदार्थ
5. उपहार
6. सभी उत्पाद

_एक नंबर भेजें।_`,

  browseResults: (items) => {
    if (items.length === 0) return `इस श्रेणी में अभी कोई उत्पाद नहीं है।`;
    const lines = [`*यहाँ कुछ उत्पाद हैं:*`, ``];
    items.forEach((p) => lines.push(`${p.index}. ${p.title} — ₹${p.price}`));
    lines.push("");
    lines.push(`_विवरण देखने के लिए नंबर भेजें, या BACK लिखें।_`);
    return lines.join("\n");
  },

  browseEmpty: () =>
    `अभी कोई उत्पाद नहीं मिला। जल्द ही नए कारीगर जुड़ रहे हैं।

*BACK* लिखें वापस जाने के लिए।`,

  browseProductDetail: ({ title, price, artisanName, district, quantity, publicUrl }) => {
    const lines = [`*${title}*`, `💰 ₹${price}`, `📦 ${quantity} पीस उपलब्ध`];
    if (artisanName)
      lines.push(`👩 *${artisanName}* द्वारा बनाया${district ? ` (${district})` : ""}`);
    if (publicUrl) lines.push("", `🔗 ${publicUrl}`);
    lines.push("");
    lines.push("जवाब दें:");
    lines.push("1. अभी खरीदें");
    lines.push("2. बाद के लिए सहेजें");
    lines.push("3. ऐसे और");
    lines.push("4. वापस");
    return lines.join("\n");
  },

  trendingHeader: () => `🔥 *इस हफ्ते HastKala पर लोकप्रिय*`,

  searchPrompt: () =>
    `बताएँ क्या ढूँढ रहे हैं।

टाइप कर सकते हैं या वॉइस नोट भेज सकते हैं।

उदाहरण: _"₹700 से कम के दीये"_ या _"गृह प्रवेश के उपहार"_`,

  searchResults: (items) => {
    if (items.length === 0) return `कोई मिलान नहीं मिला। अलग खोज करें?`;
    const lines = [`*आपके लिए ये मिले:*`, ``];
    items.forEach((p) => lines.push(`${p.index}. ${p.title} — ₹${p.price}`));
    lines.push("");
    lines.push(`_देखने के लिए नंबर भेजें या BACK लिखें।_`);
    return lines.join("\n");
  },

  searchEmpty: (query) =>
    `_"${query}"_ के लिए कोई मिलान नहीं मिला।

अलग खोज करें या *BROWSE* लिखें।`,

  // ----- Buyer requests -----

  requestStart: () =>
    `🛒 *थोक या कस्टम ऑर्डर का अनुरोध*

बताएँ क्या चाहिए। टाइप कर सकते हैं या वॉइस नोट भेज सकते हैं।

उदाहरण:
• "किसी समारोह के लिए 250 इडली प्लेट"
• "शादी के लिए 50 रिटर्न गिफ्ट"
• "100 जूट बैग"`,

  requestAskDate: () =>
    `कब तक चाहिए?

उदाहरण: _25 दिसंबर_ या _अगले शनिवार_`,

  requestAskLocation: () =>
    `कहाँ डिलीवरी चाहिए?

उदाहरण: बेंगलुरु`,

  requestAskBudget: () =>
    `आपका *बजट* क्या है?

उदाहरण: ₹3000 से ₹4000`,

  requestPreview: ({ brief, quantity, deliveryDate, location, budgetMin, budgetMax, category }) => {
    const lines = [`📋 *आपका अनुरोध*`, ``];
    lines.push(`आइटम: ${brief}`);
    if (quantity) lines.push(`मात्रा: ${quantity}`);
    if (deliveryDate) lines.push(`कब तक: ${deliveryDate}`);
    if (location) lines.push(`स्थान: ${location}`);
    if (budgetMin && budgetMax) lines.push(`बजट: ₹${budgetMin} – ₹${budgetMax}`);
    else if (budgetMin) lines.push(`बजट: लगभग ₹${budgetMin}`);
    if (category) lines.push(`श्रेणी: ${category}`);
    lines.push("");
    lines.push("जवाब दें:");
    lines.push("1. पुष्टि और भेजें");
    lines.push("2. बदलें");
    lines.push("3. रद्द करें");
    return lines.join("\n");
  },

  requestBroadcasted: (requestId: string) =>
    `✅ आपका अनुरोध आपके पास के सत्यापित विक्रेताओं को भेज दिया गया है।

कोटेशन यहीं मिलेंगे, आमतौर पर 2-6 घंटे में।

अनुरोध आईडी: *${requestId}*

*MENU* लिखें वापस जाने के लिए।`,

  requestEmpty: () =>
    `अभी कोई अनुरोध नहीं है।

*REQUEST* लिखें नया बनाने के लिए।`,

  // ----- Seller quote -----

  quoteIncomingRequest: ({
    requestId,
    brief,
    deliveryDate,
    location,
    budgetMin,
    budgetMax,
    distanceKm,
  }) => {
    const lines = [`🔔 *आपके पास नया खरीदार अनुरोध*`, ``];
    lines.push(`अनुरोध *${requestId}*`);
    lines.push(`आइटम: ${brief}`);
    if (deliveryDate) lines.push(`कब तक: ${deliveryDate}`);
    if (location)
      lines.push(
        `स्थान: ${location}${distanceKm !== undefined ? ` (आपसे ${distanceKm} किमी)` : ""}`,
      );
    if (budgetMin && budgetMax) lines.push(`बजट: ₹${budgetMin} – ₹${budgetMax}`);
    lines.push("");
    lines.push("क्या आप कर सकती हैं?");
    lines.push("1. कोटेशन भेजें");
    lines.push("2. नहीं");
    lines.push("3. और जानकारी");
    lines.push("");
    lines.push("_इन अलर्ट को बंद करने के लिए STOP REQUESTS लिखें।_");
    return lines.join("\n");
  },

  quoteAskPrice: () =>
    `कुल *कीमत* क्या होगी? (केवल नंबर)

उदाहरण: 3500`,

  quoteAskDelivery: () =>
    `कब तक पहुँचा सकती हैं?

उदाहरण: _शुक्रवार सुबह_, _शनिवार 8 बजे तक_`,

  quoteAskNote: () =>
    `खरीदार के लिए कोई *नोट*? (वैकल्पिक — SKIP लिखें)

उदाहरण: _हस्तचित्रित, खाद्य-सुरक्षित ग्लेज़।_`,

  quotePreview: ({ price, deliveryNote, quoteNote }) => {
    const lines = [`💼 *आपका कोटेशन*`, ``];
    lines.push(`कीमत: ₹${price}`);
    if (deliveryNote) lines.push(`डिलीवरी: ${deliveryNote}`);
    if (quoteNote) lines.push(`नोट: ${quoteNote}`);
    lines.push("");
    lines.push("जवाब दें:");
    lines.push("1. कोटेशन भेजें");
    lines.push("2. बदलें");
    lines.push("3. रद्द करें");
    return lines.join("\n");
  },

  quoteSubmitted: () =>
    `कोटेशन भेज दिया ✅

खरीदार जवाब देंगे, हम सूचित करेंगे।`,

  quoteCancelled: () => `कोटेशन रद्द कर दिया।`,

  quoteAccepted: () =>
    `🎉 आपका कोटेशन स्वीकार किया गया!

कारीगर सखी डिलीवरी के लिए संपर्क करेंगी।

*MENU* लिखें वापस जाने के लिए।`,

  // ----- Buyer view quotes -----

  quotesHeader: (brief: string, count: number) => `📨 *${count}* कोटेशन मिले: _${brief}_`,

  quotesList: (items) => {
    const lines: string[] = [];
    items.forEach((q) => {
      lines.push(`${q.index}. *${q.sellerName}* — ₹${q.price}`);
      if (q.deliveryNote) lines.push(`   ${q.deliveryNote}`);
    });
    lines.push("");
    lines.push("_देखने के लिए नंबर भेजें या BACK लिखें।_");
    return lines.join("\n");
  },

  quoteDetail: ({ sellerName, price, deliveryNote, quoteNote }) => {
    const lines = [`*${sellerName} का कोटेशन*`, ``];
    lines.push(`कीमत: ₹${price}`);
    if (deliveryNote) lines.push(`डिलीवरी: ${deliveryNote}`);
    if (quoteNote) lines.push(`नोट: ${quoteNote}`);
    lines.push("");
    lines.push("जवाब दें:");
    lines.push("1. स्वीकारें");
    lines.push("2. अस्वीकार");
    lines.push("3. वापस");
    return lines.join("\n");
  },

  quoteRejected: () => `कोटेशन अस्वीकार। विक्रेता को सूचित कर दिया जाएगा।`,

  // ----- Sakhi flows -----

  sakhiPendingHeader: () => `📋 *लंबित मंज़ूरियाँ*`,

  sakhiPendingEmpty: () =>
    `अभी कोई उत्पाद लंबित नहीं है। 👏

*MENU* लिखें वापस जाने के लिए।`,

  sakhiPendingList: (items) => {
    const lines = [`📋 *लंबित मंज़ूरियाँ*`, ``];
    items.forEach((p) => {
      lines.push(`${p.index}. *${p.title}*`);
      lines.push(`   ${p.artisanName} (${p.district})`);
    });
    lines.push("");
    lines.push("_देखने के लिए नंबर भेजें या BACK लिखें।_");
    return lines.join("\n");
  },

  sakhiPendingDetail: ({ title, description, price, quantity, artisanName, district }) =>
    [
      `*${title}*`,
      `₹${price} · ${quantity} पीस`,
      `${artisanName} (${district}) द्वारा`,
      ``,
      `_${description}_`,
      ``,
      `जवाब दें:`,
      `1. मंज़ूर करें`,
      `2. अस्वीकार करें`,
      `3. वापस`,
    ].join("\n"),

  sakhiApproved: (title: string) =>
    `*${title}* मंज़ूर ✅
कारीगर को सूचित कर दिया गया, उत्पाद लाइव है।`,

  sakhiRejected: (title: string) =>
    `*${title}* अस्वीकार।
कारीगर को सूचित कर दिया गया।`,

  // ----- Generic -----

  help: () =>
    `*HastKala कमांड*

• *MENU* — मुख्य मेनू
• *BACK* — एक कदम पीछे
• *LANGUAGE* — भाषा बदलें
• *PROFILE* — प्रोफ़ाइल देखें
• *HELP* — यह सूची
• *HUMAN* — कारीगर सखी से बात

नंबर और विकल्प नाम दोनों चलते हैं।`,

  helpInState: () =>
    `अटक गए?

• *MENU* — मुख्य मेनू पर जाएँ
• *BACK* — एक कदम पीछे
• *HUMAN* — कारीगर सखी से बात`,

  invalidChoice: () =>
    `यह विकल्प नहीं है।

दिखाए गए नंबरों में से एक भेजें या *MENU* लिखें।`,

  unparseable: () =>
    `माफ़ कीजिए, समझ नहीं आया।

विकल्प देखने के लिए *MENU*, कमांड के लिए *HELP*, या मदद के लिए *HUMAN* लिखें।`,

  goingBack: () => `↩️ पीछे जा रहे हैं...`,

  cantGoBack: () => `आप शुरुआत में हैं। मुख्य मेनू के लिए *MENU* लिखें।`,

  errorBackend: () =>
    `HastKala सर्वर अभी व्यस्त है।

कृपया कुछ देर बाद कोशिश करें।`,

  errorGeneric: () => `कुछ गलत हो गया। *MENU* लिखें या *HUMAN* से सहायता लें।`,

  consentLine: () =>
    `_आपका फ़ोन नंबर निजी रहता है। आपका नाम, जिला और उत्पाद विवरण सार्वजनिक हो सकते हैं। रद्द करने के लिए कभी भी STOP लिखें।_`,

  resetConfirmed: () => `सेशन साफ़ ✅
शुरू करने के लिए *HI* लिखें।`,

  humanEscalated: () =>
    `🤝 एक कारीगर सखी जल्द ही आपसे संपर्क करेंगी।
आप यहीं WhatsApp पर बात जारी रख सकते हैं।`,

  notImplemented: () =>
    `यह सुविधा जल्द आ रही है ✨
*MENU* लिखें वापस जाने के लिए।`,

  exitGoodbye: (name?: string) =>
    `👋 ${name ? `अलविदा, ${name}!` : "अलविदा!"}
आपकी प्रोफ़ाइल सुरक्षित है।

जब वापस आना हो, *HI* लिखें। हम यहीं हैं। 🌸`,

  exitWelcomeBack: (name?: string) =>
    `🌸 ${name ? `वापसी पर स्वागत, ${name}!` : "वापसी पर स्वागत!"}
चलिए जहाँ छोड़ा था वहीं से शुरू करते हैं।`,

  alreadySubmitted: () =>
    `आपकी पिछली कार्रवाई पहले ही भेज दी गई है।
*MENU* लिखें कुछ और करने के लिए।`,

  englishHelper: (text: string) => `_${text}_`,

  draftCreated: (p: ProductDraftResponse) => {
    const link = p.approvalUrl ? `\n\n_वेबसाइट पर देखें:_ ${p.approvalUrl}` : "";
    return `आपका उत्पाद HastKala पर लाइव हो गया 🎉

📦 ${p.title}
💰 ₹${p.price}
📦 ${p.quantity} उपलब्ध${link}

*MENU* लिखें।`;
  },

  orderAlert: ({ productTitle, quantity, amount, buyerCity, buyerName, orderId }) => {
    const lines = [`🎉 *नया ऑर्डर मिला!*`, ``];
    lines.push(`उत्पाद: ${productTitle}`);
    lines.push(`मात्रा: ${quantity}`);
    lines.push(`रकम: ₹${amount}`);
    if (buyerName) lines.push(`खरीदार: ${buyerName}`);
    if (buyerCity) lines.push(`शहर: ${buyerCity}`);
    if (orderId) lines.push(`ऑर्डर आईडी: ${orderId}`);
    lines.push("");
    lines.push("कृपया उत्पाद को पैक करें। कारीगर सखी पिकअप में मदद करेंगी।");
    lines.push("ऑर्डर देखने के लिए *ORDERS* लिखें।");
    return lines.join("\n");
  },
};

function labelStatusHi(status: string): string {
  switch (status) {
    case "approved":
      return "✅ लाइव";
    case "pending_approval":
      return "⏳ मंज़ूरी का इंतज़ार";
    case "rejected":
      return "❌ अस्वीकार";
    case "sold_out":
      return "🚫 स्टॉक खत्म";
    case "draft":
      return "📝 ड्राफ्ट";
    default:
      return status;
  }
}

function labelOrderStatusHi(status: string): string {
  switch (status) {
    case "new":
      return "🆕 नया";
    case "confirmed":
      return "✅ पुष्टि";
    case "packed":
      return "📦 पैक";
    case "picked_up":
      return "🚚 पिकअप";
    case "delivered":
      return "📬 डिलीवर";
    case "paid":
      return "💰 भुगतान";
    case "cancelled":
      return "❌ रद्द";
    default:
      return status;
  }
}
