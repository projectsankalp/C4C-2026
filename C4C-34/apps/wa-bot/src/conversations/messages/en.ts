/**
 * English copy for HastKala BolKeBecho.
 * Tone: warm, dignified, low-jargon. Avoid charity language.
 * Format: short lines, numbered options, examples where helpful.
 */
import type { MessageRegistry } from "./types";
import type { ProductDraftResponse } from "../../types";

export const en: MessageRegistry = {
  // ----- First-time setup -----

  greeting: () =>
    `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

Namaste 🙏 Welcome!

We help women artisans sell handmade products *directly* to buyers — no middleman.

💬 *Just type or send a voice note — I'll guide you!*

Choose your language / भाषा चुनें:

1. English
2. हिन्दी (Hindi)
3. ಕನ್ನಡ (Kannada)
4. தமிழ் (Tamil)
5. മലയാളം (Malayalam)

_Reply with a number to get started._`,

  languageInvalid: () =>
    `Please reply with a number from 1 to 5.

1. English
2. हिन्दी
3. ಕನ್ನಡ
4. தமிழ்
5. മലയാളം`,

  languageConfirmed: (language: string) =>
    `Great ✅ ${language} selected.

💡 _Tip: voice notes work too. Type *EXIT* to leave, *MENU* anytime to come back._

You can change language anytime by typing *LANGUAGE*.`,

  languageInstructions: () =>
    `📚 *Quick guide before we start*

✍️  *Type* anything to chat
🎙️  *Voice notes* — speak in your own language
1️⃣  *Numbers* pick options from menus
🌐  *MENU* — return to main menu
↩️  *BACK* — one step back
👋  *EXIT* — leave (your data is saved)
🤝  *HUMAN* — talk to a Karigar Sakhi

_Ready? Let's go._`,

  replyModeAsk: () =>
    `How would you like me to reply?

1. 📝 Text only
2. 🎙️ Voice only
3. 📝+🎙️ Both (text + voice)

_Reply with a number._`,

  roleAsk: () =>
    `Who are you?

1. *Seller* — I make and sell handmade products
2. *Buyer* — I want to buy from artisans

_Reply with a number._`,

  roleInvalid: () => `Please reply 1 or 2 to choose your role.`,

  roleConfirmed: (role) => {
    const roleLabel = {
      seller: "Seller / Artisan",
      buyer: "Buyer",
      sakhi: "Karigar Sakhi",
    }[role];
    return `Welcome 🌸 You are joining as a *${roleLabel}*.`;
  },

  tutorial: (videoUrl: string) =>
    `Here is a 1-minute guide on how HastKala works 🎥

${videoUrl}

Reply:
1. Continue
2. Replay video`,

  tutorialPostText: (role) =>
    role === "buyer"
      ? `*Quick steps:*

1. Search the product
2. Type your budget
3. Check if an item you already purchased is online so you can buy it again
4. Buyer order history
5. Etc.

_Reply 1 to continue._`
      : `*Quick steps:*

1. Send a product photo
2. Tell us the price and details
3. Confirm and your product goes live on HastKala
4. Buyer orders — you get a WhatsApp alert

_Reply 1 to continue._`,

  // ----- Seller community / certification gate -----

  sellerPrecheckName: () =>
    `🌸 *Welcome, future HastKala seller!*

Before we send you the community link, we need a few quick details.

📍 *Step 1 of 3* — What is your *full name*?

_Example: Lakshmi Devi_`,

  sellerPrecheckAddress: () =>
    `📍 *Step 2 of 3* — What is your *full address*?

This helps us match you with buyers near you.

_Example: Near temple, Karkala, Udupi district_`,

  sellerPrecheckContact: (currentPhone: string) =>
    `📍 *Step 3 of 3* — What is your *best contact number*?

Reply with a number, or send *0* to use this WhatsApp number (${currentPhone}).

_Example: 9876543210_`,

  sellerCommunityJoin: (communityLink: string) =>
    `✅ *Got it. Thanks!*

Your details are saved. Now please *join our 7-day Seller Cohort* — a free WhatsApp community where you will:

✅ Learn how things work
✅ Connect with other artisans
✅ Build trust with buyers
✅ Earn your *HastKala Seller Certificate*

👉 *Join the community here:*
${communityLink}

A *HastKala community representative* will contact you shortly to complete the formalities for joining the cohort.

After the 7-day workshop you will automatically receive your certificate here on WhatsApp and your seller account will unlock instantly.

_Reply *BUYER* to shop as a buyer, or *RESET* to start from scratch._`,

  sellerCommunityWaiting: () =>
    `⏳ *We're waiting for your certificate!*

Once you complete the 7-day cohort, our community team will issue your certificate. *Your account will unlock automatically* — you'll get a WhatsApp message here the moment it's ready.

_While you wait:_
• Reply *BROWSE* to explore products
• Reply *SEARCH* to find something
• Reply *3* to switch to Buyer mode`,

  sellerCommunityAlreadyJoined: () =>
    `✅ *You're all set.*

Our community rep will reach out shortly. Once the 7-day cohort is done, your certificate will arrive here on WhatsApp and your seller account will unlock automatically.

_No need to do anything else — just complete the workshop._`,

  sellerLockedMenu: () =>
    `🔒 *Your seller account is not yet unlocked.*

To start selling on HastKala:

1️⃣ Join the HastKala community (reply *JOIN* to get the link)
2️⃣ Complete the 7-day cohort
3️⃣ Your certificate will be issued automatically
4️⃣ Your account unlocks instantly — we'll message you here

_In the meantime, you can browse as a buyer:_
• Reply *BROWSE* to explore products
• Reply *SEARCH* to find something specific`,

  sellerCertUnlocked: (name: string) =>
    `🎉 *Congratulations${name ? `, ${name}` : ""}!*

You have completed the HastKala 7-day Seller Cohort ✅

Your *HastKala Seller Certificate* is attached below 👇

Your full seller account is now *UNLOCKED* 🔓

You can now:
• Add products and receive orders
• Get matched with bulk buyers
• Access your earnings dashboard

_Welcome to the HastKala family! Let's get you set up._`,

  sellerCertPdfCaption: (name: string) =>
    `📜 *HastKala Seller Certificate*${name ? ` — ${name}` : ""}

This is your official certificate confirming you have completed the HastKala 7-day Seller Cohort.

_Keep this safe — it's your proof of trust on the platform._`,

  sellerCertTextFallback: (name: string) =>
    `📜 *HastKala Seller Certificate*

✅ This certifies that *${name || "you"}* has successfully completed the HastKala 7-day Seller Cohort.

You are now a verified HastKala seller. Welcome to the community! 🌸

_Certificate ID: HK-${Date.now().toString(36).toUpperCase()}_`,

  // ----- Returning user -----

  welcomeBack: (name?: string) => (name ? `━━━━━━━━━━━━━━━━━━━━\n🪷 *HastKala BolKeBecho*\n━━━━━━━━━━━━━━━━━━━━\n\nWelcome back, ${name} 🌸\n\n💬 _Type anything or send a voice note — I'm here to help!_` : `━━━━━━━━━━━━━━━━━━━━\n🪷 *HastKala BolKeBecho*\n━━━━━━━━━━━━━━━━━━━━\n\nWelcome back 🌸\n\n💬 _Type anything or send a voice note — I'm here to help!_`),

  whichRole: () =>
    `How would you like to continue?

1. Seller Menu
2. Buyer Menu

_Reply with a number._`,

  // ----- Seller onboarding -----

  sellerAskName: () =>
    `📍 *Step 1 of 3* — Please send your *name*.

_Example: Lakshmi_`,

  sellerAskDistrict: () =>
    `📍 *Step 2 of 3* — Which *district* are you from?

_Example: Dakshina Kannada_`,

  sellerAskCraft: () =>
    `📍 *Step 3 of 3* — What do you make?

1. Handicrafts
2. Textiles / Tailoring
3. Jewellery
4. Food products
5. Home decor
6. Other

_Reply with a number._`,

  sellerAskShg: () =>
    `Are you part of an SHG, NGO, or artisan group?

1. Yes
2. No`,

  sellerAskShgName: () =>
    `Please send the *group name*.

Example: Sakhi Mahila SHG`,

  sellerAskSakhiHelp: () =>
    `Would you like a *Karigar Sakhi* near you to help with listings and orders?

1. Yes, please connect me
2. Not right now`,

  sellerOnboardComplete: (name: string) =>
    `Your seller profile is ready ✅

Welcome to HastKala, *${name}* 🌸
You can now add products and receive orders directly on WhatsApp.`,

  // ----- Buyer onboarding -----

  buyerAskName: () =>
    `📍 *Step 1 of 3* — What should we call you?

_Example: Rahul_`,

  buyerAskLocation: () =>
    `📍 *Step 2 of 3* — Which *city* are you in?

We use this to show you artisans near you.

_Example: Bengaluru_`,

  buyerAskInterests: () =>
    `📍 *Step 3 of 3* — What are you interested in?

1. Home decor
2. Clothing / Textiles
3. Jewellery
4. Food products
5. Gifts
6. Show everything

_Reply with a number._`,

  buyerOnboardComplete: (name: string) =>
    `Welcome to HastKala, *${name}* 🛍️

Browse handmade products from women artisans across India.`,

  // ----- Sakhi onboarding -----

  sakhiAskName: () =>
    `Please send your *name*.

Example: Priya`,

  sakhiAskDistrict: () =>
    `Which *district* do you work in?

Example: Dharwad`,

  sakhiAskGroups: () =>
    `Which artisans, SHGs, or NGOs do you support?

You can name a few — or reply *SKIP*.`,

  sakhiOnboardComplete: (name: string) =>
    `Your Sakhi profile is ready ✅

Welcome, *${name}* 🌸
You can now approve product listings, verify artisans, and respond to buyer requests directly on WhatsApp.`,

  // ----- Main menus -----

  sellerMenu: (name: string) =>
    `🌸 *Hello ${name}, what would you like to do?*

1. Add Product
2. My Products
3. Orders
4. Buyer Requests
5. Earnings
6. More

_Reply with a number, or type the option name._`,

  sellerMenuMore: () =>
    `*More options:*

1. Edit profile
2. Change language
3. Contact Karigar Sakhi
4. Product photo tips
5. *🛍️ Switch to Buyer mode*
6. Help

_Reply with a number, or type BACK to return._`,

  buyerMenu: (name: string) =>
    `🛍️ *Namaste ${name}. What are you looking for?*

1. Browse Products
2. Trending Items 🔥
3. Categories
4. Search by Message
5. Request Bulk Order
6. More

_Reply with a number, or type the option name._`,

  buyerMenuMore: () =>
    `*More options:*

1. My Orders
2. Saved Products
3. Change Location
4. Change Language
5. *🌸 Switch to Seller mode*
6. Help

_Reply with a number, or type BACK to return._`,

  sakhiMenu: (name: string) =>
    `✅ *Namaste ${name}. Sakhi dashboard.*

1. Pending Products
2. New Sellers
3. Orders to Support
4. Buyer Requests
5. Artisan Earnings
6. More

_Reply with a number._`,

  sakhiMenuMore: () =>
    `*More options:*

1. My profile
2. Change language
3. Help

_Reply with a number, or type BACK to return._`,

  // ----- Add product -----

  addProductStart: () =>
    `🌸 Let's add your product.

*Step 1 of 3:* Please send 1-3 *clear product photos* 📸

You can send them one by one. Reply *0* when finished.

_Tip: good light, plain background, full product visible._`,

  addProductPhotoReceived: (count: number, max: number) =>
    `📸 Photo ${count} of ${max} received ✅

Send another photo, or reply *0* to continue.`,

  addProductMaxPhotos: () =>
    `You've added the maximum ${3} photos.

Reply *0* to continue.`,

  addProductPhotosNeedFirst: () =>
    `Please send a *product photo* first 📸

Once I have at least one photo, I'll ask for the details.`,

  addProductAskDetails: () =>
    `*Step 2 of 3:* Now tell us about your product.

You can *type* or send a *voice note*.

Please include:
• Product name
• Price (₹)
• Quantity available
• Material (optional)

Example: _Handmade coconut shell lamp, ₹600, 2 pieces_`,

  addProductCreating: () => `Creating your listing... ✨`,

  addProductMissingPrice: () =>
    `I have the photo and details, but the *price* is missing.

Please send the price.

Example: ₹600`,

  addProductMissingQuantity: () =>
    `How many pieces are available?

Example: 2`,

  addProductMissingTitle: () =>
    `What is your product called?

Example: Coconut Shell Lamp`,

  addProductDraftPreview: ({ title, price, quantity, material, category, description, photos }) => {
    const lines = [
      `*Step 3 of 3: Review your listing*`,
      ``,
      `📦 *${title}*`,
      `💰 ₹${price}`,
      `📦 ${quantity} ${quantity === 1 ? "piece" : "pieces"} available`,
    ];
    if (category) lines.push(`🏷️ ${category}`);
    if (material) lines.push(`🧵 ${material}`);
    lines.push(`📸 ${photos} photo${photos === 1 ? "" : "s"}`);
    if (description) {
      lines.push("");
      lines.push(`_${description}_`);
    }
    lines.push(
      "",
      `Reply:`,
      `1. *Confirm* — publish on HastKala`,
      `2. Edit price`,
      `3. Edit quantity`,
      `4. Edit title`,
      `5. Edit description`,
      `6. Cancel`,
    );
    return lines.join("\n");
  },

  addProductSubmitted: (_approvalUrl?: string) => {
    return `✅ Your listing has been sent to your Karigar Sakhi for review.

Once approved, your product will go live on HastKala Haat and you'll receive a link to share with buyers.

We'll notify you here when it's published.

Reply *MENU* to return.`;
  },

  addProductApproved: ({ title, publicUrl }) =>
    `🎉 Good news!

Your product *${title}* is now live on HastKala.${publicUrl ? `\n\nView: ${publicUrl}` : ""}

Buyers can now place orders. We'll notify you when an order arrives.`,

  addProductCancelled: () =>
    `Listing cancelled. No product was created.

Reply *MENU* to return.`,

  addProductPriceUpdated: (price: number) => `Price updated to ₹${price} ✅`,
  addProductQuantityUpdated: (quantity: number) => `Quantity updated to ${quantity} ✅`,
  addProductTitleUpdated: (title: string) => `Title updated to *${title}* ✅`,
  addProductDescriptionUpdated: () => `Description updated ✅`,

  addProductAskNewPrice: () =>
    `What's the new *price*? (numbers only)

Example: 700`,

  addProductAskNewQuantity: () =>
    `What's the new *quantity*?

Example: 3`,

  addProductAskNewTitle: () =>
    `What's the new *title*?

Example: Eco Coconut Shell Lamp`,

  addProductAskNewDescription: () => `Send the new *description* (1-3 sentences).`,

  // ----- My products -----

  myProductsHeader: () => `📦 *Your Products*`,

  myProductsEmpty: () =>
    `You don't have any products yet.

Reply *ADD* to add your first product.`,

  myProductsList: (items) => {
    const lines = [`📦 *Your Products*`, ``];
    items.forEach((p, i) => {
      lines.push(`${i + 1}. *${p.title}*`);
      lines.push(`   ₹${p.price} · Stock: ${p.quantity} · ${labelStatus(p.status)}`);
    });
    lines.push("");
    lines.push("_Reply with the product number to manage it, or BACK to return._");
    return lines.join("\n");
  },

  myProductsManage: (title) =>
    `*${title}*

What would you like to do?

1. Change price
2. Change stock
3. Edit title
4. Edit description
5. 🗑️ Delete product
6. View product link
7. Back to my products

_Reply with a number._`,

  myProductsStockUpdated: (quantity) => `Stock updated to ${quantity} ✅`,

  myProductsSoldOut: (title) =>
    `*${title}* marked as sold out ✅
It will no longer appear to buyers.`,

  myProductsAskNewStock: () =>
    `How many pieces are available now?

Example: 5`,

  // ----- Orders -----

  ordersHeader: () => `📋 *Your Orders*`,

  ordersEmpty: () =>
    `No orders yet. They will appear here as buyers place them.

Reply *MENU* to return.`,

  ordersList: (items) => {
    const lines = [`📋 *Your Orders*`, ``];
    items.forEach((o, i) => {
      lines.push(`${i + 1}. *${o.productTitle}* — ₹${o.amount}`);
      lines.push(
        `   ${o.id} · ${labelOrderStatus(o.status)}${o.buyerCity ? ` · ${o.buyerCity}` : ""}`,
      );
    });
    lines.push("");
    lines.push("_Reply with the order number to view, or BACK to return._");
    return lines.join("\n");
  },

  orderDetail: ({ id, productTitle, quantity, amount, buyerCity, status }) =>
    `*Order ${id}*

Product: ${productTitle}
Quantity: ${quantity}
Amount: ₹${amount}
${buyerCity ? `Buyer city: ${buyerCity}\n` : ""}Status: ${labelOrderStatus(status)}

Reply:
1. Accept order
2. Not available
3. Need help

_Or BACK to return._`,

  orderAccepted: () =>
    `Order accepted ✅

Please pack the product safely. Karigar Sakhi will help with pickup.`,

  orderUnavailable: () =>
    `We've marked the order as unavailable.

The buyer will be notified and Karigar Sakhi will reach out.`,

  // ----- Browse / search -----

  browseAskCategory: () =>
    `What would you like to browse?

1. Home Decor
2. Clothing / Textiles
3. Jewellery
4. Food Products
5. Gifts
6. All Products

_Reply with a number._`,

  browseResults: (items) => {
    if (items.length === 0) return `No products found in this category yet.`;
    const lines = [`*Here are some products:*`, ``];
    items.forEach((p) => {
      lines.push(`${p.index}. ${p.title} — ₹${p.price}`);
    });
    lines.push("");
    lines.push(`_Reply with a number to view details, or BACK to return._`);
    return lines.join("\n");
  },

  browseEmpty: () =>
    `No products found yet. Check back soon — new artisans are joining every day.

Reply *BACK* to return.`,

  browseProductDetail: ({ title, price, artisanName, district, quantity, publicUrl }) => {
    const lines = [
      `*${title}*`,
      `💰 ₹${price}`,
      `📦 ${quantity} ${quantity === 1 ? "piece" : "pieces"} in stock`,
    ];
    if (artisanName) lines.push(`👩 Made by *${artisanName}*${district ? ` (${district})` : ""}`);
    if (publicUrl) lines.push("", `🔗 ${publicUrl}`);
    lines.push("");
    lines.push("Reply:");
    lines.push("1. Buy now");
    lines.push("2. Save for later");
    lines.push("3. More like this");
    lines.push("4. Back");
    return lines.join("\n");
  },

  trendingHeader: () => `🔥 *Trending on HastKala this week*`,

  searchPrompt: () =>
    `Tell me what you're looking for.

You can type or send a voice note.

Example: _"handmade lamps under ₹700"_ or _"gifts for housewarming"_`,

  searchResults: (items) => {
    if (items.length === 0) return `No matches found. Try a different search?`;
    const lines = [`*Found these for you:*`, ``];
    items.forEach((p) => {
      lines.push(`${p.index}. ${p.title} — ₹${p.price}`);
    });
    lines.push("");
    lines.push(`_Reply with a number to view, or BACK to return._`);
    return lines.join("\n");
  },

  searchEmpty: (query) =>
    `No matches found for _"${query}"_.

Try a different search, or reply *BROWSE* to see all categories.`,

  // ----- Buyer requests -----

  requestStart: () =>
    `🛒 *Request a bulk or custom order*

Tell me what you need. You can type or send a voice note.

Examples:
• "250 idli plates for a function"
• "50 return gifts for a wedding"
• "100 handmade jute bags"`,

  requestAskDate: () =>
    `When do you need it by?

Example: _25 December_ or _next Saturday_`,

  requestAskLocation: () =>
    `Where should it be delivered?

Example: Bengaluru`,

  requestAskBudget: () =>
    `What's your *budget range*?

Example: ₹3000 to ₹4000`,

  requestPreview: ({ brief, quantity, deliveryDate, location, budgetMin, budgetMax, category }) => {
    const lines = [`📋 *Your Request*`, ``];
    lines.push(`Item: ${brief}`);
    if (quantity) lines.push(`Quantity: ${quantity}`);
    if (deliveryDate) lines.push(`Needed by: ${deliveryDate}`);
    if (location) lines.push(`Location: ${location}`);
    if (budgetMin && budgetMax) {
      lines.push(`Budget: ₹${budgetMin} – ₹${budgetMax}`);
    } else if (budgetMin) {
      lines.push(`Budget: around ₹${budgetMin}`);
    }
    if (category) lines.push(`Category: ${category}`);
    lines.push("");
    lines.push("Reply:");
    lines.push("1. Confirm and broadcast");
    lines.push("2. Edit");
    lines.push("3. Cancel");
    return lines.join("\n");
  },

  requestBroadcasted: (requestId: string) =>
    `✅ Your request has been sent to verified sellers near you.

You will receive quotes here as they come in. Usually within 2-6 hours.

Request ID: *${requestId}*

Reply *MENU* to return.`,

  requestEmpty: () =>
    `You haven't posted any requests yet.

Reply *REQUEST* to post one.`,

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
    const lines = [`🔔 *New buyer request near you*`, ``];
    lines.push(`Request *${requestId}*`);
    lines.push(`Item: ${brief}`);
    if (deliveryDate) lines.push(`Needed by: ${deliveryDate}`);
    if (location)
      lines.push(
        `Location: ${location}${distanceKm !== undefined ? ` (${distanceKm} km from you)` : ""}`,
      );
    if (budgetMin && budgetMax) lines.push(`Budget: ₹${budgetMin} – ₹${budgetMax}`);
    lines.push("");
    lines.push("Can you fulfill this?");
    lines.push("1. Send a quote");
    lines.push("2. Pass");
    lines.push("3. Need more details");
    lines.push("");
    lines.push("_Reply STOP REQUESTS to opt out of these alerts._");
    return lines.join("\n");
  },

  quoteAskPrice: () =>
    `What's your *total price*? (numbers only)

Example: 3500`,

  quoteAskDelivery: () =>
    `When can you deliver?

Example: _Friday morning_, _by 8 AM Saturday_`,

  quoteAskNote: () =>
    `Any *note* for the buyer? (Optional — type SKIP)

Example: _Hand-painted finish, food-safe glaze._`,

  quotePreview: ({ price, deliveryNote, quoteNote }) => {
    const lines = [`💼 *Your Quote*`, ``];
    lines.push(`Price: ₹${price}`);
    if (deliveryNote) lines.push(`Delivery: ${deliveryNote}`);
    if (quoteNote) lines.push(`Note: ${quoteNote}`);
    lines.push("");
    lines.push("Reply:");
    lines.push("1. Send quote");
    lines.push("2. Edit");
    lines.push("3. Cancel");
    return lines.join("\n");
  },

  quoteSubmitted: () =>
    `Quote sent ✅

The buyer will review and respond. We'll notify you here.`,

  quoteCancelled: () => `Quote cancelled.`,

  quoteAccepted: () =>
    `🎉 Your quote was accepted!

Karigar Sakhi will reach out to coordinate delivery.

Reply *MENU* to return.`,

  // ----- Buyer view quotes -----

  quotesHeader: (brief: string, count: number) =>
    `📨 *${count} ${count === 1 ? "quote" : "quotes"}* received for: _${brief}_`,

  quotesList: (items) => {
    const lines: string[] = [];
    items.forEach((q) => {
      lines.push(`${q.index}. *${q.sellerName}* — ₹${q.price}`);
      if (q.deliveryNote) lines.push(`   ${q.deliveryNote}`);
    });
    lines.push("");
    lines.push("_Reply with a number to view, or BACK to return._");
    return lines.join("\n");
  },

  quoteDetail: ({ sellerName, price, deliveryNote, quoteNote }) => {
    const lines = [`*Quote from ${sellerName}*`, ``];
    lines.push(`Price: ₹${price}`);
    if (deliveryNote) lines.push(`Delivery: ${deliveryNote}`);
    if (quoteNote) lines.push(`Note: ${quoteNote}`);
    lines.push("");
    lines.push("Reply:");
    lines.push("1. Accept");
    lines.push("2. Reject");
    lines.push("3. Back to quote list");
    return lines.join("\n");
  },

  quoteRejected: () => `Quote rejected. The seller will be notified.`,

  // ----- Sakhi flows -----

  sakhiPendingHeader: () => `📋 *Pending product approvals*`,

  sakhiPendingEmpty: () =>
    `No products pending approval right now. 👏

Reply *MENU* to return.`,

  sakhiPendingList: (items) => {
    const lines = [`📋 *Pending product approvals*`, ``];
    items.forEach((p) => {
      lines.push(`${p.index}. *${p.title}*`);
      lines.push(`   ${p.artisanName} (${p.district})`);
    });
    lines.push("");
    lines.push("_Reply with a number to review, or BACK to return._");
    return lines.join("\n");
  },

  sakhiPendingDetail: ({ title, description, price, quantity, artisanName, district }) => {
    const lines = [
      `*${title}*`,
      `₹${price} · ${quantity} ${quantity === 1 ? "piece" : "pieces"}`,
      `By ${artisanName} (${district})`,
      ``,
      `_${description}_`,
      ``,
      `Reply:`,
      `1. Approve`,
      `2. Reject`,
      `3. Back`,
    ];
    return lines.join("\n");
  },

  sakhiApproved: (title: string) =>
    `*${title}* approved ✅
The artisan will be notified and the product is now live.`,

  sakhiRejected: (title: string) =>
    `*${title}* rejected.
The artisan has been notified.`,

  // ----- Generic / commands / errors -----

  help: () =>
    `*HastKala Commands*

• *MENU* — return to main menu
• *BACK* — go back one step
• *LANGUAGE* — change language
• *PROFILE* — view your profile
• *HELP* — show this list
• *HUMAN* — talk to a Karigar Sakhi

Numbers and option names both work. _e.g._ "1" or "Add Product".`,

  helpInState: () =>
    `Stuck? Reply:

• *MENU* to return to the main menu
• *BACK* to go back one step
• *HUMAN* to reach a Karigar Sakhi`,

  invalidChoice: () =>
    `That's not one of the options.

Reply with one of the numbers shown, or *MENU* to start over.`,

  unparseable: () =>
    `Sorry, I didn't understand that.

Reply *MENU* to see options, *HELP* for commands, or *HUMAN* to reach a Karigar Sakhi.`,

  goingBack: () => `↩️ Going back...`,

  cantGoBack: () => `You're already at the start. Reply *MENU* to return to the main menu.`,

  errorBackend: () =>
    `Our HastKala server is busy right now.

Please try again in a moment.`,

  errorGeneric: () =>
    `Something went wrong on our side. Reply *MENU* to start fresh, or *HUMAN* to reach a Karigar Sakhi.`,

  consentLine: () =>
    `_Your phone number stays private. Your name, district, and product details may be shown publicly. Reply STOP anytime to cancel._`,

  resetConfirmed: () =>
    `Session cleared ✅
Reply *HI* to begin again.`,

  humanEscalated: () =>
    `🤝 A Karigar Sakhi will reach out to you shortly.
You'll continue this conversation here on WhatsApp.`,

  notImplemented: () =>
    `That feature is coming soon ✨
Reply *MENU* to return.`,

  exitGoodbye: (name?: string) =>
    `👋 ${name ? `Goodbye, ${name}!` : "Goodbye!"}
Your profile is saved.

Reply *HI* anytime to come back. We'll be right here. 🌸`,

  exitWelcomeBack: (name?: string) =>
    `🌸 ${name ? `Welcome back, ${name}!` : "Welcome back!"}
Picking up where we left off.`,

  alreadySubmitted: () =>
    `Your last action is already submitted.
Reply *MENU* to do something else.`,

  englishHelper: (text: string) => `_${text}_`,

  draftCreated: (p: ProductDraftResponse) => {
    const link = p.approvalUrl ? `\n\n_View on website:_ ${p.approvalUrl}` : "";
    return `Your product is live on HastKala 🎉

📦 ${p.title}
💰 ₹${p.price}
📦 ${p.quantity} available${link}

Reply *MENU* to return.`;
  },

  orderAlert: ({ productTitle, quantity, amount, buyerCity, buyerName, orderId }) => {
    const lines = [`🎉 *New order received!*`, ``];
    lines.push(`Product: ${productTitle}`);
    lines.push(`Quantity: ${quantity}`);
    lines.push(`Amount: ₹${amount}`);
    if (buyerName) lines.push(`Buyer: ${buyerName}`);
    if (buyerCity) lines.push(`City: ${buyerCity}`);
    if (orderId) lines.push(`Order ID: ${orderId}`);
    lines.push("");
    lines.push("Please pack the product. Karigar Sakhi will coordinate pickup.");
    lines.push("Reply *ORDERS* to manage your orders.");
    return lines.join("\n");
  },
};

// ---------------------------------------------------------------------------
// Helpers (English-specific labels for status enums)
// ---------------------------------------------------------------------------

function labelStatus(status: string): string {
  switch (status) {
    case "approved":
      return "✅ Live";
    case "pending_approval":
      return "⏳ Waiting approval";
    case "rejected":
      return "❌ Rejected";
    case "sold_out":
      return "🚫 Sold out";
    case "draft":
      return "📝 Draft";
    default:
      return status;
  }
}

function labelOrderStatus(status: string): string {
  switch (status) {
    case "new":
      return "🆕 New";
    case "confirmed":
      return "✅ Confirmed";
    case "packed":
      return "📦 Packed";
    case "picked_up":
      return "🚚 Picked up";
    case "delivered":
      return "📬 Delivered";
    case "paid":
      return "💰 Paid";
    case "cancelled":
      return "❌ Cancelled";
    default:
      return status;
  }
}
