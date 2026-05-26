/**
 * Buyer main menu + MORE submenu.
 */
import type { IncomingMessage, OutgoingReply, UserSession, Role } from "../../types";
import { getMessages } from "../messages";
import { transition, updateSession } from "../state";
import { matchOption, parseMenuChoice } from "../../utils/text";
import { api } from "../../services/apiClient";
import { enterTrending } from "./browse";

const BUYER_MENU_ALIASES = [
  ["1", "browse", "browse products",
    "ಉತ್ಪನ್ನಗಳು ನೋಡಿ", "ನೋಡಿ",
    "उत्पाद देखें", "देखें", "dekhein"],
  ["2", "trending", "popular", "hot",
    "ಟ್ರೆಂಡಿಂಗ್", "ಜನಪ್ರಿಯ",
    "ट्रेंडिंग", "लोकप्रिय"],
  ["3", "categories", "ವಿಭಾಗಗಳು", "श्रेणियाँ"],
  ["4", "search", "search by message",
    "ಹುಡುಕಿ", "खोजें", "search karo"],
  ["5", "request", "request bulk", "bulk order",
    "ವಿನಂತಿ", "ಬೃಹತ್ ಆರ್ಡರ್",
    "अनुरोध", "बल्क ऑर्डर"],
  ["6", "more", "ಇನ್ನಷ್ಟು", "और"],
];

const MORE_ALIASES = [
  ["1", "my orders", "ನನ್ನ ಆರ್ಡರ್", "मेरे ऑर्डर"],
  ["2", "saved", "ಉಳಿಸಿದ", "सेव किया"],
  ["3", "change location", "ಸ್ಥಳ ಬದಲಿಸಿ", "जगह बदलें"],
  ["4", "language", "ಭಾಷೆ", "भाषा"],
  ["5", "seller mode", "switch to seller", "seller", "sell", "ಮಾರಾಟಗಾರ ಮೋಡ್", "विक्रेता मोड"],
  ["6", "help", "ಸಹಾಯ", "मदद"],
];

export async function handleBuyerMenu(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 6) ?? matchOption(msg.body, BUYER_MENU_ALIASES);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "BUYER_MENU" }];
  }

  switch (choice) {
    case 1:
      transition(s.phone, "BROWSE_CATEGORIES");
      return [{ text: m.browseAskCategory(), state: "BROWSE_CATEGORIES" }];
    case 2:
      return enterTrending(s);
    case 3:
      transition(s.phone, "BROWSE_CATEGORIES");
      return [{ text: m.browseAskCategory(), state: "BROWSE_CATEGORIES" }];
    case 4:
      transition(s.phone, "SEARCH_PROMPT");
      return [{ text: m.searchPrompt(), state: "SEARCH_PROMPT" }];
    case 5:
      transition(s.phone, "REQUEST_BRIEF", { context: { request: {} } });
      return [{ text: m.requestStart(), state: "REQUEST_BRIEF" }];
    case 6:
      transition(s.phone, "BUYER_MENU_MORE");
      return [{ text: m.buyerMenuMore(), state: "BUYER_MENU_MORE" }];
  }
  return [{ text: m.invalidChoice(), state: "BUYER_MENU" }];
}

export async function handleBuyerMenuMore(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 6) ?? matchOption(msg.body, MORE_ALIASES);
  if (!choice) return [{ text: m.invalidChoice(), state: "BUYER_MENU_MORE" }];

  switch (choice) {
    case 1:
      return enterBuyerOrders(s);
    case 2:
    case 3:
      return [{ text: m.notImplemented(), state: "BUYER_MENU_MORE" }];
    case 4:
      updateSession(s.phone, { stateStack: [] });
      transition(s.phone, "AWAITING_LANGUAGE");
      return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
    case 5:
      return switchToSellerInline(s);
    case 6:
      return [{ text: m.help(), state: "BUYER_MENU_MORE" }];
  }
  return [{ text: m.invalidChoice(), state: "BUYER_MENU_MORE" }];
}

/**
 * Inline seller-switch helper. Buyers who have completed seller onboarding
 * (isCertified=true) jump straight to the seller menu. Otherwise we route
 * them through the certification gate.
 */
function switchToSellerInline(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  const name = s.name || "";

  // Buyer wanting to become a seller without certification → community gate
  if (!s.isCertified) {
    const roles: Role[] = s.roles.includes("seller") ? s.roles : [...s.roles, "seller"];
    updateSession(s.phone, { role: "seller", roles });
    transition(s.phone, "SELLER_PRECHECK_NAME");
    const banner =
      s.language === "hi"
        ? `🌸 *आप अब विक्रेता मोड में हैं${name ? `, ${name}` : ""}.*\n\n_खरीदार मोड पर जाने के लिए *BUYER* लिखें।_`
        : s.language === "kn"
          ? `🌸 *ನೀವು ಈಗ ಮಾರಾಟಗಾರ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ${name ? `, ${name}` : ""}.*\n\n_ಖರೀದಿದಾರ ಮೋಡ್‌ಗೆ ಹೋಗಲು *BUYER* ಬರೆಯಿರಿ._`
          : `🌸 *You're now in Seller mode${name ? `, ${name}` : ""}.*\n\n_Reply *BUYER* anytime to shop as a buyer._`;
    return [
      { text: banner, state: "SELLER_PRECHECK_NAME" },
      { text: m.sellerPrecheckName(), state: "SELLER_PRECHECK_NAME" },
    ];
  }

  const roles: Role[] = s.roles.includes("seller") ? s.roles : [...s.roles, "seller"];
  updateSession(s.phone, { role: "seller", roles });
  transition(s.phone, "SELLER_MENU");
  const banner =
    s.language === "hi"
      ? `🌸 *आप अब विक्रेता मोड में हैं${name ? `, ${name}` : ""}.*\n\n_खरीदार मोड पर जाने के लिए *BUYER* लिखें।_`
      : s.language === "kn"
        ? `🌸 *ನೀವು ಈಗ ಮಾರಾಟಗಾರ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ${name ? `, ${name}` : ""}.*\n\n_ಖರೀದಿದಾರ ಮೋಡ್‌ಗೆ ಹೋಗಲು *BUYER* ಬರೆಯಿರಿ._`
        : `🌸 *You're now in Seller mode${name ? `, ${name}` : ""}.*\n\n_Reply *BUYER* anytime to shop as a buyer._`;
  return [
    { text: banner, state: "SELLER_MENU" },
    { text: m.sellerMenu(name), state: "SELLER_MENU" },
  ];
}

/**
 * Fetch and display buyer's past orders.
 */
async function enterBuyerOrders(s: UserSession): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  try {
    const res = await api.get<any>("/api/orders", { params: { buyerPhone: s.phone, limit: 10 } });
    const orders = res.data?.data?.orders || [];
    if (orders.length === 0) {
      const empty = s.language === "hi"
        ? "📦 *आपके ऑर्डर*\n\nअभी तक कोई ऑर्डर नहीं। ब्राउज़ करें और खरीदें!\n\n_MENU लिखें वापस जाने के लिए_"
        : s.language === "kn"
          ? "📦 *ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು*\n\nಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ. ಬ್ರೌಸ್ ಮಾಡಿ ಮತ್ತು ಖರೀದಿಸಿ!\n\n_MENU ಬರೆಯಿರಿ ಹಿಂತಿರುಗಲು_"
          : "📦 *Your Orders*\n\nNo orders yet. Browse and buy something!\n\n_Reply MENU to go back_";
      return [{ text: empty, state: "BUYER_MENU" }];
    }
    const list = orders.map((o: any, i: number) => {
      const status = o.status === "delivered" ? "✅ Delivered" : o.status === "shipped" ? "🚚 Shipped" : "⏳ Processing";
      return `  ${i + 1}. *${o.product?.title || "Product"}* — ₹${o.totalAmount}\n     ${status}`;
    }).join("\n\n");

    const header = s.language === "hi"
      ? `📦 *आपके ऑर्डर (${orders.length}):*\n\n${list}\n\n_MENU लिखें वापस जाने के लिए_`
      : s.language === "kn"
        ? `📦 *ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು (${orders.length}):*\n\n${list}\n\n_MENU ಬರೆಯಿರಿ ಹಿಂತಿರುಗಲು_`
        : `📦 *Your Orders (${orders.length}):*\n\n${list}\n\n_Reply MENU to go back_`;
    return [{ text: header, state: "BUYER_MENU" }];
  } catch {
    return [{ text: "📦 Could not fetch orders. Try again later.\n\n_Reply MENU to go back_", state: "BUYER_MENU" }];
  }
}
