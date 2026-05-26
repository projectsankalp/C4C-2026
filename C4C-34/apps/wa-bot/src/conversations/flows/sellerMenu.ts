/**
 * Seller main menu + MORE submenu router.
 * Each menu pick transitions into the matching feature flow and (where the
 * flow needs to load data) immediately calls its `enter*` helper so the user
 * sees the next screen in one turn.
 */
import type { IncomingMessage, OutgoingReply, UserSession, Role } from "../../types";
import { getMessages } from "../messages";
import { transition, updateSession } from "../state";
import { matchOption, parseMenuChoice } from "../../utils/text";
import { enterMyProducts } from "./myProducts";
import { enterOrdersList } from "./sellerOrders";
import { enterSellerRequestList } from "./quote";
import { api } from "../../services/apiClient";
import { log } from "../../utils/logger";

const SELLER_MENU_ALIASES = [
  // Add product
  ["1", "add", "add product", "new", "new product",
    "ಉತ್ಪನ್ನ ಸೇರಿಸಿ", "ಹೊಸ ಉತ್ಪನ್ನ", "ಸೇರಿಸಿ",
    "उत्पाद जोड़ें", "नया उत्पाद", "जोड़ें", "naya product"],
  // My products
  ["2", "my products", "list", "list items", "show items", "my items", "products", "items",
    "ನನ್ನ ಉತ್ಪನ್ನಗಳು", "ಉತ್ಪನ್ನಗಳು",
    "मेरे उत्पाद", "मेरे प्रोडक्ट", "mere products", "meri cheezein", "mere items"],
  // Orders
  ["3", "orders", "my orders",
    "ಆರ್ಡರ್‌ಗಳು", "ನನ್ನ ಆರ್ಡರ್",
    "ऑर्डर", "मेरे ऑर्डर", "mere order"],
  // Buyer requests
  ["4", "buyer requests", "requests",
    "ಖರೀದಿದಾರರ ವಿನಂತಿಗಳು", "ವಿನಂತಿಗಳು",
    "खरीदार अनुरोध", "अनुरोध"],
  // Earnings
  ["5", "earnings", "income", "kamai",
    "ಆದಾಯ", "ಗಳಿಕೆ",
    "कमाई", "आमदनी"],
  // More
  ["6", "more", "ಇನ್ನಷ್ಟು", "और"],
];

const MORE_ALIASES = [
  ["1", "edit profile", "ಪ್ರೊಫೈಲ್ ಬದಲಿಸಿ", "प्रोफ़ाइल बदलें"],
  ["2", "language", "change language", "ಭಾಷೆ", "भाषा"],
  ["3", "contact sakhi", "sakhi", "ಸಖಿ", "सखी"],
  ["4", "photo tips", "tips", "ಫೋಟೋ ಟಿಪ್ಸ್", "फोटो टिप्स"],
  ["5", "buyer mode", "switch to buyer", "buyer", "shopping", "ಖರೀದಿದಾರ ಮೋಡ್", "खरीदार मोड"],
  ["6", "help", "ಸಹಾಯ", "मदद"],
];

export async function handleSellerMenu(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 6) ?? matchOption(msg.body, SELLER_MENU_ALIASES);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "SELLER_MENU" }];
  }

  switch (choice) {
    case 1:
      transition(s.phone, "ADD_PRODUCT_PHOTOS", { context: { addProduct: { photos: [] } } });
      return [{ text: m.addProductStart(), state: "ADD_PRODUCT_PHOTOS" }];
    case 2:
      return enterMyProducts(s);
    case 3:
      return enterOrdersList(s);
    case 4:
      return enterSellerRequestList(s);
    case 5:
      return enterEarnings(s);
    case 6:
      transition(s.phone, "SELLER_MENU_MORE");
      return [{ text: m.sellerMenuMore(), state: "SELLER_MENU_MORE" }];
  }

  return [{ text: m.invalidChoice(), state: "SELLER_MENU" }];
}

export async function handleSellerMenuMore(
  s: UserSession,
  msg: IncomingMessage,
): Promise<OutgoingReply[]> {
  const m = getMessages(s.language);
  const choice = parseMenuChoice(msg.body, 6) ?? matchOption(msg.body, MORE_ALIASES);
  if (!choice) {
    return [{ text: m.invalidChoice(), state: "SELLER_MENU_MORE" }];
  }

  switch (choice) {
    case 1: // Edit profile (deferred)
      return [{ text: m.notImplemented(), state: "SELLER_MENU_MORE" }];
    case 2: // Change language
      updateSession(s.phone, { stateStack: [] });
      transition(s.phone, "AWAITING_LANGUAGE");
      return [{ text: getMessages("en").greeting(), state: "AWAITING_LANGUAGE" }];
    case 3: // Contact Sakhi
      return [{ text: m.humanEscalated(), state: "SELLER_MENU_MORE" }];
    case 4: // Photo tips
      return [
        {
          text: "*Photo tips:*\n• Good natural light\n• Plain background (cloth or wall)\n• Show the full product\n• 2-3 angles helps buyers\n• No filters needed",
          state: "SELLER_MENU_MORE",
        },
      ];
    case 5: // Switch to Buyer mode — synthesize a "buyer" universal command
      // We can't import switchActiveRole (cycle); set body and re-route via
      // engine's universal command path. Cleanest: just emit a marker reply
      // the engine catches. Simpler: do it inline.
      return switchToBuyerInline(s);
    case 6:
      return [{ text: m.help(), state: "SELLER_MENU_MORE" }];
  }
  return [{ text: m.invalidChoice(), state: "SELLER_MENU_MORE" }];
}

/**
 * Fetch and display earnings summary for the seller.
 */
async function enterEarnings(s: UserSession): Promise<OutgoingReply[]> {
  try {
    const artisanId = s.phone;
    const res = await api.get<any>(`/api/vendor/earnings`, { params: { phone: artisanId } });
    const d = res.data?.data;
    if (!d) throw new Error("No data");

    const recent = (d.recentOrders || [])
      .map((o: any, i: number) => {
        const date = new Date(o.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const paid = o.status === "delivered" ? "💰 Paid" : o.status === "shipped" ? "🚚 In transit" : "⏳ Pending";
        return `  ${i + 1}. ${o.product}\n     ₹${o.amount} • ${date} • ${paid}`;
      })
      .join("\n\n");

    const text = s.language === "hi"
      ? `💰 *आपकी कमाई*\n\n📊 इस महीने: ₹${d.monthEarnings.toLocaleString("en-IN")} (${d.monthOrders} ऑर्डर)\n📊 कुल: ₹${d.totalEarnings.toLocaleString("en-IN")} (${d.totalOrders} ऑर्डर)\n\n*लेन-देन इतिहास:*\n${recent || "  कोई नहीं"}\n\n_MENU लिखें वापस जाने के लिए_`
      : s.language === "kn"
        ? `💰 *ನಿಮ್ಮ ಆದಾಯ*\n\n📊 ಈ ತಿಂಗಳು: ₹${d.monthEarnings.toLocaleString("en-IN")} (${d.monthOrders} ಆರ್ಡರ್)\n📊 ಒಟ್ಟು: ₹${d.totalEarnings.toLocaleString("en-IN")} (${d.totalOrders} ಆರ್ಡರ್)\n\n*ವಹಿವಾಟು ಇತಿಹಾಸ:*\n${recent || "  ಯಾವುದೂ ಇಲ್ಲ"}\n\n_MENU ಬರೆಯಿರಿ ಹಿಂತಿರುಗಲು_`
        : `💰 *Your Earnings*\n\n📊 This month: ₹${d.monthEarnings.toLocaleString("en-IN")} (${d.monthOrders} orders)\n📊 All time: ₹${d.totalEarnings.toLocaleString("en-IN")} (${d.totalOrders} orders)\n\n*Transaction history:*\n${recent || "  None yet"}\n\n_Reply MENU to go back_`;

    return [{ text, state: "SELLER_MENU" }];
  } catch (err: any) {
    log.warn("EARNINGS_FETCH_FAILED", { message: err?.message });
    const m = getMessages(s.language);
    return [{ text: "💰 *Earnings*\n\nNo earnings data yet. Start selling to see your income here!\n\n_Reply MENU to go back_", state: "SELLER_MENU" }];
  }
}

/**
 * Inline buyer-switch helper used by the More menu. We avoid importing
 * switchActiveRole from engine.ts (would create a circular dep) so we
 * replicate the minimal logic here.
 */
function switchToBuyerInline(s: UserSession): OutgoingReply[] {
  const m = getMessages(s.language);
  const name = s.name || "";
  const roles: Role[] = s.roles.includes("buyer") ? s.roles : [...s.roles, "buyer"];
  updateSession(s.phone, { role: "buyer", roles });
  transition(s.phone, "BUYER_MENU");
  const banner =
    s.language === "hi"
      ? `🛍️ *आप अब खरीदार मोड में हैं${name ? `, ${name}` : ""}.*\n\n_विक्रेता मोड पर वापस जाने के लिए *SELLER* लिखें।_`
      : s.language === "kn"
        ? `🛍️ *ನೀವು ಈಗ ಖರೀದಿದಾರ ಮೋಡ್‌ನಲ್ಲಿದ್ದೀರಿ${name ? `, ${name}` : ""}.*\n\n_ಮಾರಾಟಗಾರ ಮೋಡ್‌ಗೆ ಮರಳಲು *SELLER* ಬರೆಯಿರಿ._`
        : `🛍️ *You're now in Buyer mode${name ? `, ${name}` : ""}.*\n\n_Reply *SELLER* anytime to switch back to selling._`;
  return [
    { text: banner, state: "BUYER_MENU" },
    { text: m.buyerMenu(name), state: "BUYER_MENU" },
  ];
}
