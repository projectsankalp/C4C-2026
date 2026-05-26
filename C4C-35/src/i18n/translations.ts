export type Language = "en" | "hi" | "kn";

export type TranslationKey =
  | "app.title"
  | "app.tagline"
  | "app.footer.tagline"
  | "app.footer.empower"
  | "app.login.title"
  | "app.login.signin"
  | "app.login.register"
  | "app.login.guest"
  | "app.login.email"
  | "app.login.password"
  | "app.login.name"
  | "app.login.shopname"
  | "app.login.submit.signin"
  | "app.login.submit.signup"
  | "app.login.hero.title"
  | "app.login.hero.desc"
  | "app.login.hero.subtitle"
  | "app.login.hero.badge"
  | "app.login.demo"
  | "app.login.demo.autofill"
  | "app.login.title.signin"
  | "app.login.title.signup"
  | "app.login.guest.divider"
  | "app.login.footer.empower"
  | "app.login.footer.active"
  | "app.plan.create.title"
  | "app.plan.create.desc.text"
  | "app.plan.create.desc.image"
  | "app.plan.create.tab.text"
  | "app.plan.create.tab.image"
  | "app.plan.create.name"
  | "app.plan.create.name.hint"
  | "app.plan.create.desc"
  | "app.plan.create.desc.hint"
  | "app.plan.create.upload"
  | "app.plan.create.upload.drag"
  | "app.plan.create.upload.formats"
  | "app.plan.create.upload.badge"
  | "app.plan.create.upload.remove"
  | "app.plan.create.upload.success"
  | "app.plan.create.submit.text"
  | "app.plan.create.submit.image"
  | "app.plan.create.samples"
  | "app.plan.create.loading.text"
  | "app.plan.create.loading.image"
  | "app.plan.create.loading.subtitle"
  | "app.dashboard.pricing"
  | "app.dashboard.marketing"
  | "app.dashboard.outreach"
  | "app.dashboard.improvements"
  | "app.dashboard.strategy"
  | "app.dashboard.companion"
  | "app.dashboard.business"
  | "app.dashboard.imageAnalysis"
  | "app.dashboard.save"
  | "app.dashboard.journal"
  | "app.dashboard.journal.empty"
  | "app.dashboard.journal.delete"
  | "app.dashboard.masterPlan"
  | "app.dashboard.theme.sunny"
  | "app.dashboard.theme.midnight"
  | "app.dashboard.pricing.calculator"
  | "app.dashboard.pricing.rawMaterial"
  | "app.dashboard.pricing.hours"
  | "app.dashboard.pricing.skillWage"
  | "app.dashboard.pricing.profitMargin"
  | "app.dashboard.pricing.totalCost"
  | "app.dashboard.pricing.recommended"
  | "app.dashboard.pricing.pureProfit"
  | "app.dashboard.pricing.calculatorDesc"
  | "app.dashboard.marketing.post"
  | "app.dashboard.marketing.templates"
  | "app.dashboard.marketing.templates.desc"
  | "app.dashboard.marketing.template.festive"
  | "app.dashboard.marketing.template.launch"
  | "app.dashboard.marketing.template.limited"
  | "app.dashboard.marketing.template.daily"
  | "app.dashboard.marketing.caption"
  | "app.dashboard.marketing.productDescription"
  | "app.dashboard.marketing.cta"
  | "app.dashboard.marketing.visualPost"
  | "app.dashboard.marketing.copy.caption"
  | "app.dashboard.marketing.copy.desc"
  | "app.dashboard.marketing.copy.all"
  | "app.dashboard.outreach.message"
  | "app.dashboard.outreach.copy"
  | "app.dashboard.outreach.title"
  | "app.dashboard.outreach.immediate"
  | "app.dashboard.outreach.whereToPost"
  | "app.dashboard.outreach.conversionTips"
  | "app.dashboard.outreach.readyMessage"
  | "app.dashboard.outreach.copyMessage"
  | "app.dashboard.outreach.reset"
  | "app.dashboard.improvements.title"
  | "app.dashboard.improvements.pricePotential"
  | "app.dashboard.improvements.suggestion"
  | "app.dashboard.business.productsCreated"
  | "app.dashboard.business.revenue"
  | "app.dashboard.business.orderStatus"
  | "app.dashboard.business.pending"
  | "app.dashboard.business.sold"
  | "app.dashboard.business.delivered"
  | "app.dashboard.business.addSale"
  | "app.dashboard.business.customerName"
  | "app.dashboard.business.quantity"
  | "app.dashboard.business.pricePerUnit"
  | "app.dashboard.business.orderMilestone"
  | "app.dashboard.business.addOrder"
  | "app.dashboard.business.orderStream"
  | "app.dashboard.business.noSales"
  | "app.dashboard.business.tab.stats"
  | "app.dashboard.business.tab.profile"
  | "app.dashboard.business.tab.settings"
  | "app.dashboard.companion.title"
  | "app.dashboard.companion.quickQuestions"
  | "app.dashboard.companion.q1"
  | "app.dashboard.companion.q2"
  | "app.dashboard.companion.q3"
  | "app.dashboard.companion.q4"
  | "app.dashboard.companion.placeholder"
  | "app.header.journal"
  | "app.header.profile"
  | "app.header.guest"
  | "app.header.guestMode"
  | "app.header.logout"
  | "app.header.businessCoach"
  | "app.header.profileMenu"
  | "app.language.select"
  | "app.welcome.title"
  | "app.playbook.title"
  | "app.playbook.new"
  | "app.sidebar.rules.title"
  | "app.error.connection.title"
  | "app.error.connection.reset"
  | "app.settings.clearOrders"
  | "app.settings.resetOrders"
  | "app.settings.theme.light"
  | "app.settings.theme.dark"
  | "app.settings.storefront"
  | "app.settings.currency"
  | "app.settings.hourlyWage"
  | "app.settings.theme"
  | "app.settings.hardReset"
  | "app.business.tab.performance"
  | "app.business.subtab.profile"
  | "app.business.subtab.settings"
  | "app.business.orders"
  | "app.business.simulateSale"
  | "app.profile.customize"
  | "app.profile.brandShop"
  | "app.profile.contact"
  | "app.profile.brandMission"
  | "app.profile.resetMock"
  | "app.profile.myName"
  | "app.profile.shopName"
  | "app.profile.category"
  | "app.profile.whatsapp"
  | "app.profile.bio";

type Translations = Record<Language, Record<string, string>>;

export const translations: Translations = {
  en: {
    "app.title": "NAVYORA",
    "app.tagline": "Turning home creations into high-margin small business brands",
    "app.footer.tagline": "Designing real livelihood pathways, item margins, and warm customer connections.",
    "app.footer.empower": "Empowering Female Founders in India",
    "app.login.title": "Turn your handmade passions into high-margin brands!",
    "app.login.signin": "Sign In",
    "app.login.register": "Register Shop",
    "app.login.guest": "Explore workspace in Guest Mode",
    "app.login.email": "Your Email or Mobile Number",
    "app.login.password": "Security Password",
    "app.login.name": "Your Full Name",
    "app.login.shopname": "Enterprise/Shop Name (Optional)",
    "app.login.submit.signin": "Go to Workspace",
    "app.login.submit.signup": "Complete Onboarding",
    "app.login.hero.title": "Turn your handmade passions into high-margin brands!",
    "app.login.hero.desc": "Join thousands of craftswomen, home bakers, organic cosmetic makers, and local designers across India turning daily output into secure sustainable livelihoods.",
    "app.login.hero.subtitle": "Micro Entrepreneur Coach",
    "app.login.hero.badge": "✦ MADE FOR INDIAN CREATORS",
    "app.login.demo": "Use our instant tester credentials",
    "app.login.demo.autofill": "⚡ Click to Autofill & Login",
    "app.login.title.signin": "Partner Workspace Sign In",
    "app.login.title.signup": "Create Shop Account",
    "app.login.guest.divider": "Or Continue Instantly",
    "app.login.footer.empower": "Empowering Women Artisans",
    "app.login.footer.active": "🇮🇳 Active Worldwide",
    "app.plan.create.title": "Draft Your Product Idea",
    "app.plan.create.desc.text": "Select an inspiring template or write your own product details below. Navyora will generate a full, realistic launch playbook!",
    "app.plan.create.desc.image": "Upload a real photo of your product to get instantaneous packaging audits, styling suggestions, pricing bounds and hashtags!",
    "app.plan.create.tab.text": "1. Plan with Idea Text",
    "app.plan.create.tab.image": "2. Image Analysis Mode",
    "app.plan.create.name": "What is your product's name?",
    "app.plan.create.name.hint": "e.g., Silk Thread Bangles",
    "app.plan.create.desc": "Product Description (What materials or flavors do you use?)",
    "app.plan.create.desc.hint": "Helps us give detailed marketing copy",
    "app.plan.create.upload": "Upload Custom Product Picture",
    "app.plan.create.upload.drag": "Drag and drop your product photo here, or click to browse",
    "app.plan.create.upload.formats": "Supports JPG, JPEG, PNG formats. Max weight 10MB",
    "app.plan.create.upload.badge": "✦ Instant Visual Auditing Mode",
    "app.plan.create.upload.remove": "Remove selected photo",
    "app.plan.create.upload.success": "Photo loaded successfully!",
    "app.plan.create.submit.text": "Create Actionable Business Plan",
    "app.plan.create.submit.image": "Analyze Product Photo & Create Strategy Playbook",
    "app.plan.create.samples": "Quick Templates (Click to Auto-fill)",
    "app.plan.create.loading.text": "Navyora AI is reviewing...",
    "app.plan.create.loading.image": "Navyora AI is analyzing your image...",
    "app.plan.create.loading.subtitle": "Our tailored business logic is analyzing market demand.",
    "app.dashboard.pricing": "Pricing & Profits",
    "app.dashboard.marketing": "Marketing Kit",
    "app.dashboard.outreach": "First Customers",
    "app.dashboard.improvements": "Improvements",
    "app.dashboard.strategy": "Selling & Growth",
    "app.dashboard.companion": "Need Help? Companion Mode",
    "app.dashboard.business": "Business Dashboard",
    "app.dashboard.imageAnalysis": "Image Analysis",
    "app.dashboard.save": "Save Draft to Journal",
    "app.dashboard.journal": "Business Journal",
    "app.dashboard.journal.empty": "Your saved micro-plans will appear here. Submit some products below!",
    "app.dashboard.journal.delete": "Delete this saved draft",
    "app.dashboard.masterPlan": "Navyora Master Plan",
    "app.dashboard.theme.sunny": "Switch to Sunny Theme",
    "app.dashboard.theme.midnight": "Switch to Midnight Theme",
    "app.dashboard.pricing.calculator": "Personal Margin & Labor Calculator",
    "app.dashboard.pricing.rawMaterial": "Raw Ingredients Cost",
    "app.dashboard.pricing.hours": "Hour Cost of Crafting",
    "app.dashboard.pricing.skillWage": "Your Skill Wage",
    "app.dashboard.pricing.profitMargin": "Profit Margin",
    "app.dashboard.pricing.totalCost": "Total Cost of Unit",
    "app.dashboard.pricing.recommended": "Recommended",
    "app.dashboard.pricing.pureProfit": "Pure Hourly Profit",
    "app.dashboard.pricing.calculatorDesc": "Micro-entrepreneurs often forget to pay themselves! Enter your precise costs below to lock down your exact target prices.",
    "app.dashboard.marketing.post": "Post copy",
    "app.dashboard.marketing.templates": "Templates",
    "app.dashboard.marketing.templates.desc": "Pick a template to fill caption, description, tagline, and CTA. Edit anything before you copy and post.",
    "app.dashboard.marketing.template.festive": "Festive Offer",
    "app.dashboard.marketing.template.launch": "New Launch",
    "app.dashboard.marketing.template.limited": "Limited Offer",
    "app.dashboard.marketing.template.daily": "Daily Use",
    "app.dashboard.marketing.caption": "Caption",
    "app.dashboard.marketing.productDescription": "Product Description",
    "app.dashboard.marketing.cta": "CTA",
    "app.dashboard.marketing.visualPost": "Visual Post",
    "app.dashboard.marketing.copy.caption": "Copy caption",
    "app.dashboard.marketing.copy.desc": "Copy desc + CTA",
    "app.dashboard.marketing.copy.all": "Copy everything to post",
    "app.dashboard.outreach.message": "Ready-to-Send Message",
    "app.dashboard.outreach.copy": "Copy",
    "app.dashboard.outreach.title": "Get Your First Customers",
    "app.dashboard.outreach.immediate": "Immediate Actions",
    "app.dashboard.outreach.whereToPost": "Where to Post",
    "app.dashboard.outreach.conversionTips": "Conversion Tips",
    "app.dashboard.outreach.readyMessage": "Ready-to-Send Message",
    "app.dashboard.outreach.copyMessage": "Copy message & go",
    "app.dashboard.outreach.reset": "Reset to default draft",
    "app.dashboard.improvements.title": "Premium Action Steps",
    "app.dashboard.improvements.pricePotential": "Price potential",
    "app.dashboard.improvements.suggestion": "Suggestion",
    "app.dashboard.business.productsCreated": "Products Handcrafted",
    "app.dashboard.business.revenue": "Estimated Revenue",
    "app.dashboard.business.orderStatus": "Order Pipe Status",
    "app.dashboard.business.pending": "Pending Inquiries",
    "app.dashboard.business.sold": "Sold / Reserved",
    "app.dashboard.business.delivered": "Delivered & Paid",
    "app.dashboard.business.addSale": "Add Manual Sale",
    "app.dashboard.business.customerName": "Customer Name",
    "app.dashboard.business.quantity": "Quantity",
    "app.dashboard.business.pricePerUnit": "Price per unit",
    "app.dashboard.business.orderMilestone": "Order Milestone Status",
    "app.dashboard.business.addOrder": "Add Order",
    "app.dashboard.business.orderStream": "Active Order Stream",
    "app.dashboard.business.noSales": "No Sales Logged Yet",
    "app.dashboard.business.tab.stats": "Stats & Orders",
    "app.dashboard.business.tab.profile": "Creator Profile",
    "app.dashboard.business.tab.settings": "Shop Settings",
    "app.dashboard.companion.title": "Navyora AI Companion",
    "app.dashboard.companion.quickQuestions": "Tap to Ask Navyora Instant Questions:",
    "app.dashboard.companion.q1": "Can I increase my prices?",
    "app.dashboard.companion.q2": "Deliver outside my city?",
    "app.dashboard.companion.q3": "My creations aren't selling?",
    "app.dashboard.companion.q4": "Give Instagram Reels pitch idea",
    "app.dashboard.companion.placeholder": "Ask Navyora: pricing, scaling, WhatsApp script, delivery routes...",
    "app.header.journal": "Journal",
    "app.header.profile": "Business Profile",
    "app.header.guest": "Guest Profile",
    "app.header.guestMode": "Guest Mode",
    "app.header.logout": "Logout",
    "app.header.businessCoach": "Business Coach",
    "app.header.profileMenu": "Profile menu",
    "app.language.select": "Language",
    "app.welcome.title": "Turn your talent into a profitable business!",
    "app.playbook.title": "🎯 Your Interactive Playbook",
    "app.playbook.new": "Start New Input",
    "app.sidebar.rules.title": "Navyora Rules of Success",
    "app.error.connection.title": "⚠️ Connection Issue",
    "app.error.connection.reset": "Clear Application Cache & Reset",
    "app.settings.storefront": "Storefront Parameters & Customizations",
    "app.settings.currency": "Regional Currency Symbol",
    "app.settings.hourlyWage": "Base Hourly Labor Wage",
    "app.settings.theme": "Visual Color Theme",
    "app.settings.hardReset": "Hard Reset Operations",
    "app.settings.clearOrders": "Clear All Orders Record",
    "app.settings.resetOrders": "Reset Default Orders Listing",
    "app.settings.theme.light": "Switch to Light Theme",
    "app.settings.theme.dark": "Switch to Dark Theme",
    "app.business.tab.performance": "📊 Stats & Orders",
    "app.business.subtab.profile": "👩‍💼 Creator Profile",
    "app.business.subtab.settings": "⚙️ Shop Settings",
    "app.business.orders": "Orders",
    "app.business.simulateSale": "Simulate Sale",
    "app.profile.customize": "Customize Creator Profile",
    "app.profile.brandShop": "Brand Shop:",
    "app.profile.contact": "Contact:",
    "app.profile.brandMission": "Brand Mission:",
    "app.profile.resetMock": "Reset Mock Values",
    "app.profile.myName": "My Full Name",
    "app.profile.shopName": "Brand Shop Name",
    "app.profile.category": "Product Category Focus",
    "app.profile.whatsapp": "Whatsapp / Phone Number",
    "app.profile.bio": "Creator Passion / Shop Motivation",
  },
  hi: {
    "app.title": "NAVYORA",
    "app.tagline": "घर की बनाई चीज़ों को बड़े मुनाफ़े वाले ब्रांड में बदलना",
    "app.footer.tagline": "वास्तविक आजीविका पथ, उत्पाद मार्जिन और ग्राहक संबंध बनाना।",
    "app.footer.empower": "भारत में महिला उद्यमियों को सशक्त बनाना",
    "app.login.title": "अपने हाथों से बनी चीज़ों को बड़े मुनाफ़े वाले ब्रांड में बदलें!",
    "app.login.signin": "साइन इन",
    "app.login.register": "दुकान रजिस्टर करें",
    "app.login.guest": "अतिथि मोड में काम करें",
    "app.login.email": "आपका ईमेल या मोबाइल नंबर",
    "app.login.password": "सुरक्षा पासवर्ड",
    "app.login.name": "आपका पूरा नाम",
    "app.login.shopname": "उद्यम/दुकान का नाम (वैकल्पिक)",
    "app.login.submit.signin": "कार्यक्षेत्र में जाएं",
    "app.login.submit.signup": "पंजीकरण पूरा करें",
    "app.login.hero.title": "अपने हाथों से बनी चीज़ों को बड़े मुनाफ़े वाले ब्रांड में बदलें!",
    "app.login.hero.desc": "हजारों शिल्पकार महिलाओं, घरेलू बेकर्स, ऑर्गेनिक कॉस्मेटिक निर्माताओं और स्थानीय डिज़ाइनरों से जुड़ें।",
    "app.login.hero.subtitle": "माइक्रो उद्यमी कोच",
    "app.login.hero.badge": "✦ भारतीय रचनाकारों के लिए बनाया गया",
    "app.login.demo": "हमारे त्वरित परीक्षण क्रेडेंशियल का उपयोग करें",
    "app.login.demo.autofill": "⚡ ऑटोफिल और लॉगिन करें",
    "app.login.title.signin": "पार्टनर वर्कस्पेस साइन इन",
    "app.login.title.signup": "दुकान खाता बनाएं",
    "app.login.guest.divider": "या तुरंत जारी रखें",
    "app.login.footer.empower": "महिला कारीगरों को सशक्त बनाना",
    "app.login.footer.active": "🇮🇳 दुनिया भर में सक्रिय",
    "app.plan.create.title": "अपना उत्पाद विचार तैयार करें",
    "app.plan.create.desc.text": "एक प्रेरक टेम्पलेट चुनें या अपने उत्पाद विवरण लिखें। Navyora एक पूर्ण लॉन्च प्लेबुक तैयार करेगा!",
    "app.plan.create.desc.image": "अपने उत्पाद की फोटो अपलोड करें और तुरंत पैकेजिंग ऑडिट, स्टाइलिंग सुझाव, मूल्य निर्धारण और हैशटैग प्राप्त करें!",
    "app.plan.create.tab.text": "1. टेक्स्ट से योजना बनाएं",
    "app.plan.create.tab.image": "2. इमेज एनालिसिस मोड",
    "app.plan.create.name": "आपके उत्पाद का नाम क्या है?",
    "app.plan.create.name.hint": "जैसे, सिल्क थ्रेड बैंगल्स",
    "app.plan.create.desc": "उत्पाद विवरण (आप किन सामग्रियों का उपयोग करते हैं?)",
    "app.plan.create.desc.hint": "विस्तृत मार्केटिंग कॉपी बनाने में मदद करता है",
    "app.plan.create.upload": "अपने उत्पाद की फोटो अपलोड करें",
    "app.plan.create.upload.drag": "अपने उत्पाद की फोटो यहां खींचें और छोड़ें, या ब्राउज़ करें",
    "app.plan.create.upload.formats": "JPG, JPEG, PNG फॉर्मेट. अधिकतम 10MB",
    "app.plan.create.upload.badge": "✦ त्वरित दृश्य ऑडिट मोड",
    "app.plan.create.upload.remove": "चयनित फोटो हटाएं",
    "app.plan.create.upload.success": "फोटो सफलतापूर्वक लोड हुई!",
    "app.plan.create.submit.text": "कार्रवाई योग्य व्यवसाय योजना बनाएं",
    "app.plan.create.submit.image": "उत्पाद फोटो का विश्लेषण करें और रणनीति बनाएं",
    "app.plan.create.samples": "त्वरित टेम्पलेट (ऑटो-फिल के लिए क्लिक करें)",
    "app.plan.create.loading.text": "Navyora AI समीक्षा कर रहा है...",
    "app.plan.create.loading.image": "Navyora AI आपकी छवि का विश्लेषण कर रहा है...",
    "app.plan.create.loading.subtitle": "हमारा व्यवसाय तर्क बाजार मांग का विश्लेषण कर रहा है।",
    "app.dashboard.pricing": "मूल्य निर्धारण और लाभ",
    "app.dashboard.marketing": "मार्केटिंग किट",
    "app.dashboard.outreach": "पहले ग्राहक",
    "app.dashboard.improvements": "सुधार",
    "app.dashboard.strategy": "बिक्री और विकास",
    "app.dashboard.companion": "सहायता? कंपेनियन मोड",
    "app.dashboard.business": "व्यवसाय डैशबोर्ड",
    "app.dashboard.imageAnalysis": "छवि विश्लेषण",
    "app.dashboard.save": "जर्नल में सेव करें",
    "app.dashboard.journal": "व्यवसाय जर्नल",
    "app.dashboard.journal.empty": "आपके सेव किए गए माइक्रो-प्लान यहां दिखाई देंगे।",
    "app.dashboard.journal.delete": "इस सहेजे गए ड्राफ्ट को हटाएं",
    "app.dashboard.masterPlan": "Navyora मास्टर प्लान",
    "app.dashboard.theme.sunny": "उज्ज्वल थीम पर स्विच करें",
    "app.dashboard.theme.midnight": "डार्क थीम पर स्विच करें",
    "app.dashboard.pricing.calculator": "व्यक्तिगत मार्जिन और श्रम कैलकुलेटर",
    "app.dashboard.pricing.rawMaterial": "कच्चे माल की लागत",
    "app.dashboard.pricing.hours": "श्रम के घंटे",
    "app.dashboard.pricing.skillWage": "आपकी कुशल मजदूरी",
    "app.dashboard.pricing.profitMargin": "लाभ मार्जिन",
    "app.dashboard.pricing.totalCost": "कुल लागत",
    "app.dashboard.pricing.recommended": "अनुशंसित",
    "app.dashboard.pricing.pureProfit": "शुद्ध प्रति घंटा लाभ",
    "app.dashboard.pricing.calculatorDesc": "लघु उद्यमी अक्सर खुद को भुगतान करना भूल जाते हैं! अपनी सटीक लागत दर्ज करें।",
    "app.dashboard.marketing.post": "पोस्ट कॉपी",
    "app.dashboard.marketing.templates": "टेम्पलेट",
    "app.dashboard.marketing.templates.desc": "कैप्शन, विवरण, टैगलाइन और CTA भरने के लिए टेम्पलेट चुनें। कॉपी करने से पहले संपादित करें।",
    "app.dashboard.marketing.template.festive": "त्योहारी ऑफर",
    "app.dashboard.marketing.template.launch": "नया लॉन्च",
    "app.dashboard.marketing.template.limited": "सीमित ऑफर",
    "app.dashboard.marketing.template.daily": "दैनिक उपयोग",
    "app.dashboard.marketing.caption": "कैप्शन",
    "app.dashboard.marketing.productDescription": "उत्पाद विवरण",
    "app.dashboard.marketing.cta": "CTA",
    "app.dashboard.marketing.visualPost": "दृश्य पोस्ट",
    "app.dashboard.marketing.copy.caption": "कैप्शन कॉपी करें",
    "app.dashboard.marketing.copy.desc": "विवरण + CTA कॉपी करें",
    "app.dashboard.marketing.copy.all": "सब कॉपी करें",
    "app.dashboard.outreach.message": "भेजने के लिए तैयार संदेश",
    "app.dashboard.outreach.copy": "कॉपी करें",
    "app.dashboard.outreach.title": "अपने पहले ग्राहक प्राप्त करें",
    "app.dashboard.outreach.immediate": "तत्काल कार्रवाई",
    "app.dashboard.outreach.whereToPost": "कहां पोस्ट करें",
    "app.dashboard.outreach.conversionTips": "रूपांतरण टिप्स",
    "app.dashboard.outreach.readyMessage": "भेजने के लिए तैयार संदेश",
    "app.dashboard.outreach.copyMessage": "संदेश कॉपी करें",
    "app.dashboard.outreach.reset": "डिफ़ॉल्ट ड्राफ्ट रीसेट करें",
    "app.dashboard.improvements.title": "प्रीमियम कार्रवाई कदम",
    "app.dashboard.improvements.pricePotential": "मूल्य क्षमता",
    "app.dashboard.improvements.suggestion": "सुझाव",
    "app.dashboard.business.productsCreated": "उत्पाद तैयार",
    "app.dashboard.business.revenue": "अनुमानित राजस्व",
    "app.dashboard.business.orderStatus": "ऑर्डर पाइप स्थिति",
    "app.dashboard.business.pending": "लंबित पूछताछ",
    "app.dashboard.business.sold": "बिका / आरक्षित",
    "app.dashboard.business.delivered": "वितरित और भुगतान",
    "app.dashboard.business.addSale": "मैन्युअल बिक्री जोड़ें",
    "app.dashboard.business.customerName": "ग्राहक का नाम",
    "app.dashboard.business.quantity": "मात्रा",
    "app.dashboard.business.pricePerUnit": "प्रति यूनिट मूल्य",
    "app.dashboard.business.orderMilestone": "ऑर्डर माइलस्टोन स्थिति",
    "app.dashboard.business.addOrder": "ऑर्डर जोड़ें",
    "app.dashboard.business.orderStream": "सक्रिय ऑर्डर स्ट्रीम",
    "app.dashboard.business.noSales": "अभी तक कोई बिक्री नहीं",
    "app.dashboard.business.tab.stats": "स्टैट्स और ऑर्डर",
    "app.dashboard.business.tab.profile": "निर्माता प्रोफ़ाइल",
    "app.dashboard.business.tab.settings": "दुकान सेटिंग्स",
    "app.dashboard.companion.title": "Navyora AI सहचर",
    "app.dashboard.companion.quickQuestions": "Navyora से तुरंत प्रश्न पूछें:",
    "app.dashboard.companion.q1": "क्या मैं अपनी कीमतें बढ़ा सकता/सकती हूं?",
    "app.dashboard.companion.q2": "अपने शहर के बाहर बेचूं?",
    "app.dashboard.companion.q3": "मेरी क्रिएशन बिक नहीं रही?",
    "app.dashboard.companion.q4": "Instagram Reels पिच आइडिया दें",
    "app.dashboard.companion.placeholder": "Navyora से पूछें: मूल्य निर्धारण, स्केलिंग, WhatsApp स्क्रिप्ट...",
    "app.header.journal": "जर्नल",
    "app.header.profile": "व्यवसाय प्रोफ़ाइल",
    "app.header.guest": "अतिथि प्रोफ़ाइल",
    "app.header.guestMode": "अतिथि मोड",
    "app.header.logout": "लॉगआउट",
    "app.header.businessCoach": "व्यवसाय कोच",
    "app.header.profileMenu": "प्रोफ़ाइल मेनू",
    "app.language.select": "भाषा",
    "app.welcome.title": "अपनी प्रतिभा को लाभदायक व्यवसाय में बदलें!",
    "app.playbook.title": "🎯 आपकी इंटरैक्टिव प्लेबुक",
    "app.playbook.new": "नया इनपुट शुरू करें",
    "app.sidebar.rules.title": "Navyora सफलता के नियम",
    "app.error.connection.title": "⚠️ कनेक्शन समस्या",
    "app.error.connection.reset": "एप्लिकेशन कैश साफ़ करें और रीसेट करें",
    "app.settings.storefront": "स्टोरफ्रंट पैरामीटर और अनुकूलन",
    "app.settings.currency": "क्षेत्रीय मुद्रा प्रतीक",
    "app.settings.hourlyWage": "आधार प्रति घंटा श्रम मजदूरी",
    "app.settings.theme": "दृश्य रंग थीम",
    "app.settings.hardReset": "हार्ड रीसेट संचालन",
    "app.settings.clearOrders": "सभी ऑर्डर रिकॉर्ड साफ़ करें",
    "app.settings.resetOrders": "डिफ़ॉल्ट ऑर्डर सूची रीसेट करें",
    "app.settings.theme.light": "लाइट थीम पर स्विच करें",
    "app.settings.theme.dark": "डार्क थीम पर स्विच करें",
    "app.business.tab.performance": "📊 स्टैट्स और ऑर्डर",
    "app.business.subtab.profile": "👩‍💼 निर्माता प्रोफ़ाइल",
    "app.business.subtab.settings": "⚙️ दुकान सेटिंग्स",
    "app.business.orders": "ऑर्डर",
    "app.business.simulateSale": "बिक्री सिम्युलेट करें",
    "app.profile.customize": "निर्माता प्रोफ़ाइल अनुकूलित करें",
    "app.profile.brandShop": "ब्रांड दुकान:",
    "app.profile.contact": "संपर्क:",
    "app.profile.brandMission": "ब्रांड मिशन:",
    "app.profile.resetMock": "मॉक वैल्यू रीसेट करें",
    "app.profile.myName": "मेरा पूरा नाम",
    "app.profile.shopName": "ब्रांड दुकान का नाम",
    "app.profile.category": "उत्पाद श्रेणी फोकस",
    "app.profile.whatsapp": "WhatsApp / फोन नंबर",
    "app.profile.bio": "निर्माता जुनून / दुकान प्रेरणा",
  },
  kn: {
    "app.title": "NAVYORA",
    "app.tagline": "ಮನೆಯಲ್ಲಿ ತಯಾರಿಸಿದ ವಸ್ತುಗಳನ್ನು ಹೆಚ್ಚಿನ ಲಾಭದ ಬ್ರ್ಯಾಂಡ್ ಆಗಿ ಪರಿವರ್ತಿಸುವುದು",
    "app.footer.tagline": "ನೈಜ ಜೀವನೋಪಾಯ ಮಾರ್ಗಗಳು, ಉತ್ಪನ್ನ ಅಂಚುಗಳು ಮತ್ತು ಗ್ರಾಹಕ ಸಂಪರ್ಕಗಳನ್ನು ವಿನ್ಯಾಸಗೊಳಿಸುವುದು.",
    "app.footer.empower": "ಭಾರತದಲ್ಲಿ ಮಹಿಳಾ ಉದ್ಯಮಿಗಳನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು",
    "app.login.title": "ನಿಮ್ಮ ಕೈಯಿಂದ ಮಾಡಿದ ವಸ್ತುಗಳನ್ನು ಹೆಚ್ಚಿನ ಲಾಭದ ಬ್ರ್ಯಾಂಡ್ ಆಗಿ ಪರಿವರ್ತಿಸಿ!",
    "app.login.signin": "ಸೈನ್ ಇನ್",
    "app.login.register": "ಅಂಗಡಿ ನೋಂದಾಯಿಸಿ",
    "app.login.guest": "ಅತಿಥಿ ಮೋಡ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡಿ",
    "app.login.email": "ನಿಮ್ಮ ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "app.login.password": "ಸುರಕ್ಷತಾ ಪಾಸ್‌ವರ್ಡ್",
    "app.login.name": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು",
    "app.login.shopname": "ಉದ್ಯಮ/ಅಂಗಡಿ ಹೆಸರು (ಐಚ್ಛಿಕ)",
    "app.login.submit.signin": "ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಹೋಗಿ",
    "app.login.submit.signup": "ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ",
    "app.login.hero.title": "ನಿಮ್ಮ ಕೈಯಿಂದ ಮಾಡಿದ ವಸ್ತುಗಳನ್ನು ಹೆಚ್ಚಿನ ಲಾಭದ ಬ್ರ್ಯಾಂಡ್ ಆಗಿ ಪರಿವರ್ತಿಸಿ!",
    "app.login.hero.desc": "ಸಾವಿರಾರು ಕುಶಲಕರ್ಮಿ ಮಹಿಳೆಯರು, ಮನೆ ಬೇಕರ್ಸ್, ಸಾವಯವ ಕಾಸ್ಮೆಟಿಕ್ ತಯಾರಕರು ಮತ್ತು ಸ್ಥಳೀಯ ವಿನ್ಯಾಸಕರನ್ನು ಸೇರಿಕೊಳ್ಳಿ.",
    "app.login.hero.subtitle": "ಸೂಕ್ಷ್ಮ ಉದ್ಯಮಿ ಕೋಚ್",
    "app.login.hero.badge": "✦ ಭಾರತೀಯ ಸೃಷ್ಟಿಕರ್ತರಿಗಾಗಿ ಮಾಡಲಾಗಿದೆ",
    "app.login.demo": "ನಮ್ಮ ತ್ವರಿತ ಪರೀಕ್ಷಾ ರುಜುವಾತುಗಳನ್ನು ಬಳಸಿ",
    "app.login.demo.autofill": "⚡ ಆಟೋಫಿಲ್ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ",
    "app.login.title.signin": "ಪಾಲುದಾರ ಕಾರ್ಯಕ್ಷೇತ್ರ ಸೈನ್ ಇನ್",
    "app.login.title.signup": "ಅಂಗಡಿ ಖಾತೆ ರಚಿಸಿ",
    "app.login.guest.divider": "ಅಥವಾ ತಕ್ಷಣ ಮುಂದುವರಿಸಿ",
    "app.login.footer.empower": "ಮಹಿಳಾ ಕುಶಲಕರ್ಮಿಗಳನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು",
    "app.login.footer.active": "🇮🇳 ವಿಶ್ವದಾದ್ಯಂತ ಸಕ್ರಿಯ",
    "app.plan.create.title": "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಕಲ್ಪನೆಯನ್ನು ರಚಿಸಿ",
    "app.plan.create.desc.text": "ಸ್ಪೂರ್ತಿದಾಯಕ ಟೆಂಪ್ಲೇಟ್ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಉತ್ಪನ್ನ ವಿವರಗಳನ್ನು ಬರೆಯಿರಿ. Navyora ಪೂರ್ಣ ಲಾಂಚ್ ಪ್ಲೇಬುಕ್ ರಚಿಸುತ್ತದೆ!",
    "app.plan.create.desc.image": "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ತಕ್ಷಣದ ಪ್ಯಾಕೇಜಿಂಗ್ ಆಡಿಟ್, ಸ್ಟೈಲಿಂಗ್ ಸಲಹೆಗಳು, ಬೆಲೆ ಮತ್ತು ಹ್ಯಾಶ್‌ಟ್ಯಾಗ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ!",
    "app.plan.create.tab.text": "1. ಟೆಕ್ಸ್ಟ್ ಮೂಲಕ ಯೋಜನೆ",
    "app.plan.create.tab.image": "2. ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ ಮೋಡ್",
    "app.plan.create.name": "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಹೆಸರೇನು?",
    "app.plan.create.name.hint": "ಉದಾ., ಸಿಲ್ಕ್ ಥ್ರೆಡ್ ಬ್ಯಾಂಗಲ್ಸ್",
    "app.plan.create.desc": "ಉತ್ಪನ್ನ ವಿವರಣೆ (ನೀವು ಯಾವ ಸಾಮಗ್ರಿಗಳನ್ನು ಬಳಸುತ್ತೀರಿ?)",
    "app.plan.create.desc.hint": "ವಿವರವಾದ ಮಾರ್ಕೆಟಿಂಗ್ ಕಾಪಿ ನೀಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ",
    "app.plan.create.upload": "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "app.plan.create.upload.drag": "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಫೋಟೋ ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ, ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಿ",
    "app.plan.create.upload.formats": "JPG, JPEG, PNG ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು. ಗರಿಷ್ಠ 10MB",
    "app.plan.create.upload.badge": "✦ ತಕ್ಷಣದ ದೃಶ್ಯ ಆಡಿಟ್ ಮೋಡ್",
    "app.plan.create.upload.remove": "ಆಯ್ಕೆ ಮಾಡಿದ ಫೋಟೋ ತೆಗೆದುಹಾಕಿ",
    "app.plan.create.upload.success": "ಫೋಟೋ ಯಶಸ್ವಿಯಾಗಿ ಲೋಡ್ ಆಗಿದೆ!",
    "app.plan.create.submit.text": "ಕ್ರಿಯಾಶೀಲ ವ್ಯವಹಾರ ಯೋಜನೆ ರಚಿಸಿ",
    "app.plan.create.submit.image": "ಉತ್ಪನ್ನ ಫೋಟೋ ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ತಂತ್ರ ರಚಿಸಿ",
    "app.plan.create.samples": "ತ್ವರಿತ ಟೆಂಪ್ಲೇಟ್‌ಗಳು (ಆಟೋ-ಫಿಲ್ ಗಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ)",
    "app.plan.create.loading.text": "Navyora AI ಪರಿಶೀಲಿಸುತ್ತಿದೆ...",
    "app.plan.create.loading.image": "Navyora AI ನಿಮ್ಮ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    "app.plan.create.loading.subtitle": "ನಮ್ಮ ವ್ಯವಹಾರ ತರ್ಕವು ಮಾರುಕಟ್ಟೆ ಬೇಡಿಕೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ.",
    "app.dashboard.pricing": "ಬೆಲೆ ಮತ್ತು ಲಾಭ",
    "app.dashboard.marketing": "ಮಾರ್ಕೆಟಿಂಗ್ ಕಿಟ್",
    "app.dashboard.outreach": "ಮೊದಲ ಗ್ರಾಹಕರು",
    "app.dashboard.improvements": "ಸುಧಾರಣೆಗಳು",
    "app.dashboard.strategy": "ಮಾರಾಟ ಮತ್ತು ಬೆಳವಣಿಗೆ",
    "app.dashboard.companion": "ಸಹಾಯ ಬೇಕೇ? ಸಹಚರ ಮೋಡ್",
    "app.dashboard.business": "ವ್ಯವಹಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "app.dashboard.imageAnalysis": "ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ",
    "app.dashboard.save": "ಜರ್ನಲ್‌ನಲ್ಲಿ ಉಳಿಸಿ",
    "app.dashboard.journal": "ವ್ಯವಹಾರ ಜರ್ನಲ್",
    "app.dashboard.journal.empty": "ನಿಮ್ಮ ಉಳಿಸಿದ ಯೋಜನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    "app.dashboard.journal.delete": "ಈ ಉಳಿಸಿದ ಡ್ರಾಫ್ಟ್ ಅನ್ನು ಅಳಿಸಿ",
    "app.dashboard.masterPlan": "Navyora ಮಾಸ್ಟರ್ ಪ್ಲಾನ್",
    "app.dashboard.theme.sunny": "ಸನ್ನಿ ಥೀಮ್‌ಗೆ ಬದಲಿಸಿ",
    "app.dashboard.theme.midnight": "ಮಿಡ್‌ನೈಟ್ ಥೀಮ್‌ಗೆ ಬದಲಿಸಿ",
    "app.dashboard.pricing.calculator": "ವೈಯಕ್ತಿಕ ಅಂಚು ಮತ್ತು ಕಾರ್ಮಿಕ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    "app.dashboard.pricing.rawMaterial": "ಕಚ್ಚಾ ವಸ್ತು ವೆಚ್ಚ",
    "app.dashboard.pricing.hours": "ಕಾರ್ಮಿಕ ಗಂಟೆಗಳು",
    "app.dashboard.pricing.skillWage": "ನಿಮ್ಮ ಕೌಶಲ್ಯ ವೇತನ",
    "app.dashboard.pricing.profitMargin": "ಲಾಭಾಂಶ",
    "app.dashboard.pricing.totalCost": "ಒಟ್ಟು ವೆಚ್ಚ",
    "app.dashboard.pricing.recommended": "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
    "app.dashboard.pricing.pureProfit": "ನಿವ್ವಳ ಗಂಟೆಯ ಲಾಭ",
    "app.dashboard.pricing.calculatorDesc": "ಸೂಕ್ಷ್ಮ ಉದ್ಯಮಿಗಳು ತಮಗೆ ಪಾವತಿಸಲು ಮರೆಯುತ್ತಾರೆ! ನಿಮ್ಮ ನಿಖರ ವೆಚ್ಚಗಳನ್ನು ನಮೂದಿಸಿ.",
    "app.dashboard.marketing.post": "ಪೋಸ್ಟ್ ಕಾಪಿ",
    "app.dashboard.marketing.templates": "ಟೆಂಪ್ಲೇಟ್‌ಗಳು",
    "app.dashboard.marketing.templates.desc": "ಕ್ಯಾಪ್ಷನ್, ವಿವರಣೆ, ಟ್ಯಾಗ್‌ಲೈನ್ ಮತ್ತು CTA ತುಂಬಲು ಟೆಂಪ್ಲೇಟ್ ಆಯ್ಕೆಮಾಡಿ. ನಕಲಿಸುವ ಮೊದಲು ಸಂಪಾದಿಸಿ.",
    "app.dashboard.marketing.template.festive": "ಹಬ್ಬದ ಕೊಡುಗೆ",
    "app.dashboard.marketing.template.launch": "ಹೊಸ ಲಾಂಚ್",
    "app.dashboard.marketing.template.limited": "ಸೀಮಿತ ಕೊಡುಗೆ",
    "app.dashboard.marketing.template.daily": "ದೈನಂದಿನ ಬಳಕೆ",
    "app.dashboard.marketing.caption": "ಕ್ಯಾಪ್ಷನ್",
    "app.dashboard.marketing.productDescription": "ಉತ್ಪನ್ನ ವಿವರಣೆ",
    "app.dashboard.marketing.cta": "CTA",
    "app.dashboard.marketing.visualPost": "ದೃಶ್ಯ ಪೋಸ್ಟ್",
    "app.dashboard.marketing.copy.caption": "ಕ್ಯಾಪ್ಷನ್ ನಕಲಿಸಿ",
    "app.dashboard.marketing.copy.desc": "ವಿವರಣೆ + CTA ನಕಲಿಸಿ",
    "app.dashboard.marketing.copy.all": "ಎಲ್ಲವನ್ನೂ ನಕಲಿಸಿ",
    "app.dashboard.outreach.message": "ಕಳುಹಿಸಲು ಸಿದ್ಧವಾದ ಸಂದೇಶ",
    "app.dashboard.outreach.copy": "ನಕಲಿಸಿ",
    "app.dashboard.outreach.title": "ನಿಮ್ಮ ಮೊದಲ ಗ್ರಾಹಕರನ್ನು ಪಡೆಯಿರಿ",
    "app.dashboard.outreach.immediate": "ತಕ್ಷಣದ ಕ್ರಮಗಳು",
    "app.dashboard.outreach.whereToPost": "ಎಲ್ಲಿ ಪೋಸ್ಟ್ ಮಾಡಬೇಕು",
    "app.dashboard.outreach.conversionTips": "ಪರಿವರ್ತನೆ ಸಲಹೆಗಳು",
    "app.dashboard.outreach.readyMessage": "ಕಳುಹಿಸಲು ಸಿದ್ಧವಾದ ಸಂದೇಶ",
    "app.dashboard.outreach.copyMessage": "ಸಂದೇಶ ನಕಲಿಸಿ",
    "app.dashboard.outreach.reset": "ಡೀಫಾಲ್ಟ್ ಡ್ರಾಫ್ಟ್‌ಗೆ ಮರುಹೊಂದಿಸಿ",
    "app.dashboard.improvements.title": "ಪ್ರೀಮಿಯಂ ಕ್ರಿಯಾ ಹಂತಗಳು",
    "app.dashboard.improvements.pricePotential": "ಬೆಲೆ ಸಾಮರ್ಥ್ಯ",
    "app.dashboard.improvements.suggestion": "ಸಲಹೆ",
    "app.dashboard.business.productsCreated": "ಉತ್ಪನ್ನಗಳು ತಯಾರಿಸಲ್ಪಟ್ಟವು",
    "app.dashboard.business.revenue": "ಅಂದಾಜು ಆದಾಯ",
    "app.dashboard.business.orderStatus": "ಆರ್ಡರ್ ಪೈಪ್ ಸ್ಥಿತಿ",
    "app.dashboard.business.pending": "ಬಾಕಿ ಇರುವ ವಿಚಾರಣೆಗಳು",
    "app.dashboard.business.sold": "ಮಾರಾಟ / ಮೀಸಲು",
    "app.dashboard.business.delivered": "ವಿತರಿಸಲಾಗಿದೆ ಮತ್ತು ಪಾವತಿಸಲಾಗಿದೆ",
    "app.dashboard.business.addSale": "ಹಸ್ತಚಾಲಿತ ಮಾರಾಟ ಸೇರಿಸಿ",
    "app.dashboard.business.customerName": "ಗ್ರಾಹಕರ ಹೆಸರು",
    "app.dashboard.business.quantity": "ಪ್ರಮಾಣ",
    "app.dashboard.business.pricePerUnit": "ಪ್ರತಿ ಯೂನಿಟ್ ಬೆಲೆ",
    "app.dashboard.business.orderMilestone": "ಆರ್ಡರ್ ಮೈಲಿಗಲ್ಲು ಸ್ಥಿತಿ",
    "app.dashboard.business.addOrder": "ಆರ್ಡರ್ ಸೇರಿಸಿ",
    "app.dashboard.business.orderStream": "ಸಕ್ರಿಯ ಆರ್ಡರ್ ಸ್ಟ್ರೀಮ್",
    "app.dashboard.business.noSales": "ಇನ್ನೂ ಮಾರಾಟಗಳಿಲ್ಲ",
    "app.dashboard.business.tab.stats": "ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ಆರ್ಡರ್‌ಗಳು",
    "app.dashboard.business.tab.profile": "ಸೃಷ್ಟಿಕರ್ತ ಪ್ರೊಫೈಲ್",
    "app.dashboard.business.tab.settings": "ಅಂಗಡಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "app.dashboard.companion.title": "Navyora AI ಸಹಚರ",
    "app.dashboard.companion.quickQuestions": "Navyora ಗೆ ತಕ್ಷಣದ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ:",
    "app.dashboard.companion.q1": "ನಾನು ನನ್ನ ಬೆಲೆಗಳನ್ನು ಹೆಚ್ಚಿಸಬಹುದೇ?",
    "app.dashboard.companion.q2": "ನನ್ನ ನಗರದ ಹೊರಗೆ ಮಾರಾಟ?",
    "app.dashboard.companion.q3": "ನನ್ನ ಸೃಷ್ಟಿಗಳು ಮಾರಾಟವಾಗುತ್ತಿಲ್ಲವೇ?",
    "app.dashboard.companion.q4": "Instagram Reels ಪಿಚ್ ಐಡಿಯಾ ನೀಡಿ",
    "app.dashboard.companion.placeholder": "Navyora ಕೇಳಿ: ಬೆಲೆ, ಸ್ಕೇಲಿಂಗ್, WhatsApp ಸ್ಕ್ರಿಪ್ಟ್...",
    "app.header.journal": "ಜರ್ನಲ್",
    "app.header.profile": "ವ್ಯವಹಾರ ಪ್ರೊಫೈಲ್",
    "app.header.guest": "ಅತಿಥಿ ಪ್ರೊಫೈಲ್",
    "app.header.guestMode": "ಅತಿಥಿ ಮೋಡ್",
    "app.header.logout": "ಲಾಗೌಟ್",
    "app.header.businessCoach": "ವ್ಯವಹಾರ ಕೋಚ್",
    "app.header.profileMenu": "ಪ್ರೊಫೈಲ್ ಮೆನು",
    "app.language.select": "ಭಾಷೆ",
    "app.welcome.title": "ನಿಮ್ಮ ಪ್ರತಿಭೆಯನ್ನು ಲಾಭದಾಯಕ ವ್ಯವಹಾರವಾಗಿ ಪರಿವರ್ತಿಸಿ!",
    "app.playbook.title": "🎯 ನಿಮ್ಮ ಸಂವಾದಾತ್ಮಕ ಪ್ಲೇಬುಕ್",
    "app.playbook.new": "ಹೊಸ ಇನ್‌ಪುಟ್ ಪ್ರಾರಂಭಿಸಿ",
    "app.sidebar.rules.title": "Navyora ಯಶಸ್ಸಿನ ನಿಯಮಗಳು",
    "app.error.connection.title": "⚠️ ಸಂಪರ್ಕ ಸಮಸ್ಯೆ",
    "app.error.connection.reset": "ಅಪ್ಲಿಕೇಶನ್ ಕ್ಯಾಶ್ ತೆರವುಗೊಳಿಸಿ ಮತ್ತು ಮರುಹೊಂದಿಸಿ",
    "app.settings.storefront": "ಸ್ಟೋರ್ಫ್ರಂಟ್ ಪ್ಯಾರಾಮೀಟರ್‌ಗಳು ಮತ್ತು ಗ್ರಾಹಕೀಕರಣ",
    "app.settings.currency": "ಪ್ರಾದೇಶಿಕ ಕರೆನ್ಸಿ ಚಿಹ್ನೆ",
    "app.settings.hourlyWage": "ಮೂಲ ಗಂಟೆಯ ಕಾರ್ಮಿಕ ವೇತನ",
    "app.settings.theme": "ದೃಶ್ಯ ಬಣ್ಣ ಥೀಮ್",
    "app.settings.hardReset": "ಹಾರ್ಡ್ ರೀಸೆಟ್ ಕಾರ್ಯಾಚರಣೆಗಳು",
    "app.settings.clearOrders": "ಎಲ್ಲಾ ಆರ್ಡರ್ ದಾಖಲೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ",
    "app.settings.resetOrders": "ಡೀಫಾಲ್ಟ್ ಆರ್ಡರ್ ಪಟ್ಟಿಯನ್ನು ಮರುಹೊಂದಿಸಿ",
    "app.settings.theme.light": "ಲೈಟ್ ಥೀಮ್‌ಗೆ ಬದಲಿಸಿ",
    "app.settings.theme.dark": "ಡಾರ್ಕ್ ಥೀಮ್‌ಗೆ ಬದಲಿಸಿ",
    "app.business.tab.performance": "📊 ಅಂಕಿಅಂಶಗಳು ಮತ್ತು ಆರ್ಡರ್‌ಗಳು",
    "app.business.subtab.profile": "👩‍💼 ಸೃಷ್ಟಿಕರ್ತ ಪ್ರೊಫೈಲ್",
    "app.business.subtab.settings": "⚙️ ಅಂಗಡಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "app.business.orders": "ಆರ್ಡರ್‌ಗಳು",
    "app.business.simulateSale": "ಮಾರಾಟ ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ",
    "app.profile.customize": "ಸೃಷ್ಟಿಕರ್ತ ಪ್ರೊಫೈಲ್ ಗ್ರಾಹಕೀಕರಿಸಿ",
    "app.profile.brandShop": "ಬ್ರ್ಯಾಂಡ್ ಅಂಗಡಿ:",
    "app.profile.contact": "ಸಂಪರ್ಕ:",
    "app.profile.brandMission": "ಬ್ರ್ಯಾಂಡ್ ಧ್ಯೇಯ:",
    "app.profile.resetMock": "ಮಾಕ್ ಮೌಲ್ಯಗಳನ್ನು ಮರುಹೊಂದಿಸಿ",
    "app.profile.myName": "ನನ್ನ ಪೂರ್ಣ ಹೆಸರು",
    "app.profile.shopName": "ಬ್ರ್ಯಾಂಡ್ ಅಂಗಡಿ ಹೆಸರು",
    "app.profile.category": "ಉತ್ಪನ್ನ ವರ್ಗ ಗಮನ",
    "app.profile.whatsapp": "WhatsApp / ಫೋನ್ ಸಂಖ್ಯೆ",
    "app.profile.bio": "ಸೃಷ್ಟಿಕರ್ತ ಉತ್ಸಾಹ / ಅಂಗಡಿ ಪ್ರೇರಣೆ",
  },
};
