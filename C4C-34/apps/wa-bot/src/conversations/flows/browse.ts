/**
 * Browse + Search + Trending flows for buyers.
 *
 *   BROWSE_CATEGORIES     → 6-option category menu
 *   BROWSE_RESULTS        → list of products in chosen category
 *   BROWSE_PRODUCT_DETAIL → detail card for one selected product
 *   TRENDING_LIST         → top products this week (sort by recent)
 *   SEARCH_PROMPT         → free-text or voice search input
 *   SEARCH_RESULTS        → matching products
 */
import type { IncomingMessage, OutgoingReply, UserSession } from "../../types";
import { getMessages } from "../messages";
import { transition, updateSession } from "../state";
import { parseMenuChoice } from "../../utils/text";
import { listProducts } from "../../services/listingService";
import { api } from "../../services/apiClient";
import { transcribeAudio } from "./transcribe";
import { config } from "../../config";
import { extractBuyerDetails } from "../../services/buyerDetailsExtractor";

const CATEGORY_MAP: Array<{ choice: number; label: string; query?: string }> = [
  { choice: 1, label: "Home Decor", query: "Home Decor" },
  { choice: 2, label: "Textiles", query: "Textiles" },
  { choice: 3, label: "Jewellery", query: "Jewellery" },
  { choice: 4, label: "Food Products", query: "Food Products" },
  { choice: 5, label: "Gifts", query: "Gifts" },
  { choice: 6, label: "All" },
];

export async function handleBrowseCategories(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 6);
  if (!choice) return [{ text: m.invalidChoice(), state: "BROWSE_CATEGORIES" }];

  const cat = CATEGORY_MAP[choice - 1];
  const products = await listProducts({ category: cat.query, limit: 10 });

  if (products.length === 0) {
    return [{ text: m.browseEmpty(), state: "BROWSE_CATEGORIES" }];
  }

  const results = products.map((p, i) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    artisanName: p.artisan?.name,
    district: p.artisan?.district,
    quantity: p.quantity,
  }));

  updateSession(s.phone, { context: { browse: { category: cat.label, results } } });
  transition(s.phone, "BROWSE_RESULTS");

  const items = results.map((r, i) => ({ index: i + 1, title: r.title, price: r.price }));
  return [{ text: m.browseResults(items), state: "BROWSE_RESULTS" }];
}

export async function handleBrowseResults(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const list = s.context.browse?.results ?? [];
  const idx = parseMenuChoice(msg.body, list.length);
  if (!idx) return [{ text: m.invalidChoice(), state: "BROWSE_RESULTS" }];

  const selected = list[idx - 1];
  updateSession(s.phone, {
    context: { browse: { ...s.context.browse, selectedProductId: selected.id } },
  });
  transition(s.phone, "BROWSE_PRODUCT_DETAIL");

  return [
    {
      text: m.browseProductDetail({
        title: selected.title,
        price: selected.price,
        artisanName: selected.artisanName,
        district: selected.district,
        quantity: 1, // we don't always have it on the card; backend has it
        publicUrl: `${config.publicWebUrl}/products/${selected.id}`,
      }),
      state: "BROWSE_PRODUCT_DETAIL",
    },
  ];
}

export async function handleBrowseProductDetail(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 4);
  if (!choice) return [{ text: m.invalidChoice(), state: "BROWSE_PRODUCT_DETAIL" }];

  switch (choice) {
    case 1: {
      // Buy now → start in-WhatsApp purchase flow
      const productId = s.context.browse?.selectedProductId;
      const result = s.context.browse?.results?.find((r: any) => r.id === productId);
      if (!result) return [{ text: m.invalidChoice(), state: "BROWSE_PRODUCT_DETAIL" }];

      // Fetch seller phone from product detail
      let sellerPhone: string | undefined;
      try {
        const pRes = await api.get<any>(`/api/products/${productId}`);
        sellerPhone = pRes.data?.data?.artisan?.phone;
      } catch {}

      updateSession(s.phone, {
        context: {
          ...s.context,
          purchase: {
            productId: result.id,
            productTitle: result.title,
            productPrice: result.price,
            sellerName: result.artisanName,
            sellerPhone,
          },
        },
      });
      transition(s.phone, "BUYER_PURCHASE_DETAILS");
      const askDetails = s.language === "hi"
        ? `🛒 *${result.title}* — ₹${result.price}\n\nऑर्डर करने के लिए कृपया अपनी जानकारी भेजें:\n\n*आपका नाम, पता, और फ़ोन नंबर*\n\n_उदाहरण: राहुल, MG Road, बेंगलुरु, 9876543210_`
        : s.language === "kn"
          ? `🛒 *${result.title}* — ₹${result.price}\n\nಆರ್ಡರ್ ಮಾಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ:\n\n*ನಿಮ್ಮ ಹೆಸರು, ವಿಳಾಸ, ಮತ್ತು ಫೋನ್ ನಂಬರ್*\n\n_ಉದಾಹರಣೆ: ರಾಹುಲ್, MG Road, ಬೆಂಗಳೂರು, 9876543210_`
          : `🛒 *${result.title}* — ₹${result.price}\n\nTo place your order, please send your details:\n\n*Your name, delivery address, and phone number*\n\n_Example: Rahul, MG Road, Bengaluru, 9876543210_`;
      return [{ text: askDetails, state: "BUYER_PURCHASE_DETAILS" }];
    }
    case 2:
      return [{ text: m.notImplemented(), state: "BROWSE_PRODUCT_DETAIL" }];
    case 3:
      // "More like this" — re-run with same category
      transition(s.phone, "BROWSE_RESULTS");
      return [{ text: m.notImplemented(), state: "BROWSE_RESULTS" }];
    case 4:
      transition(s.phone, "BROWSE_RESULTS");
      return [
        {
          text: m.browseResults(
            (s.context.browse?.results ?? []).map((r, i) => ({
              index: i + 1,
              title: r.title,
              price: r.price,
            })),
          ),
          state: "BROWSE_RESULTS",
        },
      ];
  }
  return [{ text: m.invalidChoice(), state: "BROWSE_PRODUCT_DETAIL" }];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function handleSearchPrompt(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);

  let query = (msg.body || "").trim();

  // Voice search
  if (msg.hasAudio && !query) {
    const transcript = await transcribeAudio({
      audioBuffer: msg.audioBuffer,
      mimetype: msg.audioMimetype,
      language: s.language,
    });
    query = transcript.text;
  }

  if (!query) {
    return [{ text: m.searchPrompt(), state: "SEARCH_PROMPT" }];
  }

  const products = await listProducts({ search: query, limit: 10 });
  if (products.length === 0) {
    return [{ text: m.searchEmpty(query), state: "SEARCH_PROMPT" }];
  }

  const results = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    artisanName: p.artisan?.name,
    district: p.artisan?.district,
    quantity: p.quantity,
  }));

  updateSession(s.phone, { context: { browse: { results } } });
  transition(s.phone, "SEARCH_RESULTS");

  const items = results.map((r, i) => ({ index: i + 1, title: r.title, price: r.price }));
  return [{ text: m.searchResults(items), state: "SEARCH_RESULTS" }];
}

export async function handleSearchResults(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  // Reuse the browse-results handler — same shape.
  return handleBrowseResults(s, msg);
}

// ---------------------------------------------------------------------------
// Trending (just "all products", recent first)
// ---------------------------------------------------------------------------

export async function enterTrending(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  let products: any[] = [];
  try {
    const res = await api.get<any>(`/api/products/trending`);
    products = res.data?.data?.trending || [];
  } catch {
    // Fallback to regular listing
    products = (await listProducts({ limit: 5 })).map(p => ({
      id: p.id, title: p.title, price: p.price, orderCount: 0,
      artisanName: p.artisan?.name, district: p.artisan?.district,
    }));
  }
  if (products.length === 0) {
    return [{ text: m.browseEmpty(), state: "BUYER_MENU" }];
  }
  const results = products.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    artisanName: p.artisanName,
    district: p.district,
  }));
  updateSession(s.phone, { context: { browse: { results } } });
  transition(s.phone, "BROWSE_RESULTS");
  const items = results.map((r: any, i: number) => ({ index: i + 1, title: r.title, price: r.price }));
  return [
    { text: m.trendingHeader(), state: "BROWSE_RESULTS" },
    { text: m.browseResults(items), state: "BROWSE_RESULTS" },
  ];
}

// ---------------------------------------------------------------------------
// Buyer Purchase Flow (in-WhatsApp)
// ---------------------------------------------------------------------------

/**
 * Localized prompt asking for whichever buyer-detail fields are still missing.
 * Falls back to a single combined prompt if the user has provided nothing.
 */
function buyerDetailsAskPrompt(
  language: UserSession["language"],
  missing: { name: boolean; address: boolean; phone: boolean },
  productTitle: string,
  productPrice: number,
): string {
  const fieldList = (lang: typeof language): string => {
    const parts: string[] = [];
    if (lang === "hi") {
      if (missing.name) parts.push("नाम");
      if (missing.address) parts.push("पूरा डिलीवरी पता");
      if (missing.phone) parts.push("10-अंकीय फ़ोन नंबर");
    } else if (lang === "kn") {
      if (missing.name) parts.push("ಹೆಸರು");
      if (missing.address) parts.push("ಸಂಪೂರ್ಣ ವಿಳಾಸ");
      if (missing.phone) parts.push("10-ಅಂಕಿ ಫೋನ್ ನಂಬರ್");
    } else {
      if (missing.name) parts.push("name");
      if (missing.address) parts.push("full delivery address");
      if (missing.phone) parts.push("10-digit phone number");
    }
    return parts.join(lang === "hi" ? ", " : lang === "kn" ? ", " : ", ");
  };

  if (language === "hi") {
    return `🛒 *${productTitle}* — ₹${productPrice}\n\nऑर्डर पूरा करने के लिए कृपया भेजें:\n*${fieldList("hi")}*\n\nएक संदेश में बोलें या टाइप करें — किसी भी क्रम में।\n\n_उदाहरण: राहुल, MG Road, बेंगलुरु, 9876543210_`;
  }
  if (language === "kn") {
    return `🛒 *${productTitle}* — ₹${productPrice}\n\nಆರ್ಡರ್ ಮುಗಿಸಲು ದಯವಿಟ್ಟು ಕಳುಹಿಸಿ:\n*${fieldList("kn")}*\n\nಒಂದೇ ಸಂದೇಶದಲ್ಲಿ ಮಾತಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ — ಯಾವುದೇ ಕ್ರಮದಲ್ಲಿ.\n\n_ಉದಾಹರಣೆ: ರಾಹುಲ್, MG Road, ಬೆಂಗಳೂರು, 9876543210_`;
  }
  return `🛒 *${productTitle}* — ₹${productPrice}\n\nTo place your order, please share:\n*${fieldList("en")}*\n\nSay it or type it in one message — any order.\n\n_Example: Rahul, MG Road, Bengaluru, 9876543210_`;
}

export async function handleBuyerPurchaseDetails(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const text = (msg.body || "").trim();
  const purchase = s.context.purchase || {};
  const productTitle = purchase.productTitle || "Order";
  const productPrice = purchase.productPrice || 0;

  // Robust extraction: handles voice transcripts, multi-language, any
  // punctuation. Returns whatever fields it could identify.
  const extracted = await extractBuyerDetails(text);

  // Merge with whatever the user already provided in earlier turns.
  const merged = {
    ...purchase,
    buyerName: extracted.name || purchase.buyerName,
    buyerAddress: extracted.address || purchase.buyerAddress,
    buyerPhone: extracted.phone || purchase.buyerPhone,
  };
  updateSession(s.phone, { context: { ...s.context, purchase: merged } });

  const missing = {
    name: !merged.buyerName,
    address: !merged.buyerAddress,
    phone: !merged.buyerPhone,
  };

  // Still missing fields → ask only for what we don't have.
  if (missing.name || missing.address || missing.phone) {
    const ask = buyerDetailsAskPrompt(s.language, missing, productTitle, productPrice);
    return [{ text: ask, state: "BUYER_PURCHASE_DETAILS" }];
  }

  // All fields present → show summary and ask to confirm.
  transition(s.phone, "BUYER_PURCHASE_CONFIRM");
  const confirmMsg =
    s.language === "hi"
      ? `📋 *ऑर्डर सारांश:*\n\n🛒 ${productTitle} — ₹${productPrice}\n👤 ${merged.buyerName}\n📍 ${merged.buyerAddress}\n📞 ${merged.buyerPhone}\n\n1. ✅ ऑर्डर की पुष्टि करें\n2. ❌ रद्द करें`
      : s.language === "kn"
        ? `📋 *ಆರ್ಡರ್ ಸಾರಾಂಶ:*\n\n🛒 ${productTitle} — ₹${productPrice}\n👤 ${merged.buyerName}\n📍 ${merged.buyerAddress}\n📞 ${merged.buyerPhone}\n\n1. ✅ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ\n2. ❌ ರದ್ದುಮಾಡಿ`
        : `📋 *Order Summary:*\n\n🛒 ${productTitle} — ₹${productPrice}\n👤 ${merged.buyerName}\n📍 ${merged.buyerAddress}\n📞 ${merged.buyerPhone}\n\n1. ✅ Confirm order\n2. ❌ Cancel`;
  return [{ text: confirmMsg, state: "BUYER_PURCHASE_CONFIRM" }];
}

export async function handleBuyerPurchaseConfirm(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 2);

  if (choice === 2) {
    updateSession(s.phone, { context: { ...s.context, purchase: undefined } });
    transition(s.phone, "BUYER_MENU");
    const cancelled = s.language === "hi" ? "❌ ऑर्डर रद्द किया गया।" : s.language === "kn" ? "❌ ಆರ್ಡರ್ ರದ್ದಾಯಿತು." : "❌ Order cancelled.";
    return [{ text: cancelled, state: "BUYER_MENU" }, { text: m.buyerMenu(s.name || ""), state: "BUYER_MENU" }];
  }

  if (choice !== 1) {
    return [{ text: m.invalidChoice(), state: "BUYER_PURCHASE_CONFIRM" }];
  }

  const purchase = s.context.purchase;
  if (!purchase?.productId) {
    transition(s.phone, "BUYER_MENU");
    return [{ text: m.buyerMenu(s.name || ""), state: "BUYER_MENU" }];
  }

  // Create order via API
  let paymentLink = "";
  try {
    await api.post("/api/orders", {
      productId: purchase.productId,
      buyerName: purchase.buyerName,
      buyerPhone: purchase.buyerPhone,
      buyerAddress: purchase.buyerAddress,
      quantity: 1,
    });

    // Generate Razorpay payment link
    const rzpKeyId = process.env.RAZORPAY_KEY_ID;
    const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (rzpKeyId && rzpKeySecret && purchase.productPrice) {
      try {
        const rzpRes = await fetch("https://api.razorpay.com/v1/payment_links", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: purchase.productPrice * 100,
            currency: "INR",
            description: purchase.productTitle,
            customer: {
              name: purchase.buyerName,
              contact: `+${purchase.buyerPhone}`,
            },
            notify: { sms: false, email: false, whatsapp: false },
            callback_url: `${config.publicWebUrl}/order-success/new`,
            callback_method: "get",
          }),
        });
        if (rzpRes.ok) {
          const rzpData = await rzpRes.json() as any;
          paymentLink = rzpData.short_url || "";
        }
      } catch {}
    }
  } catch {}

  // Notify seller via WhatsApp bot internal server
  if (purchase.sellerPhone) {
    const sellerMsg = s.language === "hi"
      ? `🛍️ *नया ऑर्डर!*\n\n${purchase.productTitle} — ₹${purchase.productPrice}\n\n👤 खरीदार: ${purchase.buyerName}\n📍 ${purchase.buyerAddress}\n📞 ${purchase.buyerPhone}\n\n_ऑर्डर स्वीकार करने के लिए ORDERS लिखें।_`
      : `🛍️ *New Order!*\n\n${purchase.productTitle} — ₹${purchase.productPrice}\n\n👤 Buyer: ${purchase.buyerName}\n📍 ${purchase.buyerAddress}\n📞 ${purchase.buyerPhone}\n\n_Reply ORDERS to manage your orders._`;
    try {
      await api.post("/api/whatsapp/send", { phone: purchase.sellerPhone, message: sellerMsg });
    } catch {
      // Also try the bot's internal endpoint
      const { config: botConfig } = await import("../../config");
      fetch(`http://localhost:${botConfig.port}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bot-secret": botConfig.botSecret },
        body: JSON.stringify({ phone: purchase.sellerPhone, message: sellerMsg }),
      }).catch(() => {});
    }
  }

  // Confirm to buyer + share seller details
  updateSession(s.phone, { context: { ...s.context, purchase: undefined } });
  transition(s.phone, "BUYER_MENU");

  const paySection = paymentLink
    ? `\n\n💳 *Pay now:* ${paymentLink}`
    : "";

  const confirmed = s.language === "hi"
    ? `✅ *ऑर्डर की पुष्टि हो गई!*\n\n🛒 ${purchase.productTitle} — ₹${purchase.productPrice}${paySection}\n\n*विक्रेता विवरण:*\n👤 ${purchase.sellerName || "Artisan"}\n📞 ${purchase.sellerPhone || "जल्द साझा किया जाएगा"}\n\nविक्रेता को सूचित कर दिया गया है।\n\n_MENU लिखें वापस जाने के लिए_`
    : s.language === "kn"
      ? `✅ *ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!*\n\n🛒 ${purchase.productTitle} — ₹${purchase.productPrice}${paySection}\n\n*ಮಾರಾಟಗಾರ ವಿವರ:*\n👤 ${purchase.sellerName || "Artisan"}\n📞 ${purchase.sellerPhone || "ಶೀಘ್ರದಲ್ಲಿ ಹಂಚಲಾಗುವುದು"}\n\nಮಾರಾಟಗಾರರಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.\n\n_MENU ಬರೆಯಿರಿ ಹಿಂತಿರುಗಲು_`
      : `✅ *Order Confirmed!*\n\n🛒 ${purchase.productTitle} — ₹${purchase.productPrice}${paySection}\n\n*Seller details:*\n👤 ${purchase.sellerName || "Artisan"}\n📞 ${purchase.sellerPhone || "Will be shared soon"}\n\nThe seller has been notified.\n\n_Reply MENU to go back_`;

  return [{ text: confirmed, state: "BUYER_MENU" }];
}
