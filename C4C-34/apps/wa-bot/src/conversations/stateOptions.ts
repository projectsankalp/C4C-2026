/**
 * Per-state option catalogs for the NLU layer.
 *
 * The NLU service needs to know what options the user can pick at each state.
 * We define them once here so the engine can fetch them by state name.
 *
 * Used to translate "I want hindi" → optionIndex=2 in AWAITING_LANGUAGE,
 * "I'm a seller" → optionIndex=1 in AWAITING_ROLE, etc.
 */
import type { ConversationState } from "../types";
import type { NLUOption } from "../services/nluService";

const STATE_OPTIONS: Partial<Record<ConversationState, NLUOption[]>> = {
  AWAITING_LANGUAGE: [
    { index: 1, label: "English", aliases: ["english", "eng", "इंग्लिश", "ഇംഗ്ലീഷ്", "ஆங்கிலம்", "ಇಂಗ್ಲಿಷ್"] },
    { index: 2, label: "Hindi", aliases: ["hindi", "हिन्दी", "हिंदी", "हिन्दि"] },
    { index: 3, label: "Kannada", aliases: ["kannada", "ಕನ್ನಡ", "kannad"] },
    { index: 4, label: "Tamil", aliases: ["tamil", "தமிழ்", "tamizh"] },
    { index: 5, label: "Malayalam", aliases: ["malayalam", "മലയാളം", "malayali"] },
  ],

  AWAITING_REPLY_MODE: [
    {
      index: 1,
      label: "Text only",
      aliases: [
        "text",
        "text only",
        "only text",
        "no voice",
        "skip voice",
        "written",
        "टेक्स्ट",
        "लिखित",
        "ಪಠ್ಯ",
        "ಪಠ್ಯ ಮಾತ್ರ",
        "எழுத்து",
        "എഴുത്ത്",
      ],
    },
    {
      index: 2,
      label: "Voice only",
      aliases: [
        "voice",
        "voice only",
        "only voice",
        "audio",
        "audio only",
        "no text",
        "speak",
        "spoken",
        "आवाज़",
        "वॉइस",
        "ಧ್ವನಿ",
        "ಧ್ವನಿ ಮಾತ್ರ",
        "வாய்ஸ்",
        "ശബ്ദം",
      ],
    },
    {
      index: 3,
      label: "Both",
      aliases: [
        "both",
        "both text and voice",
        "text and voice",
        "voice and text",
        "all",
        "everything",
        "दोनों",
        "ಎರಡೂ",
        "இரண்டும்",
        "രണ്ടും",
      ],
    },
  ],

  AWAITING_ROLE: [
    {
      index: 1,
      label: "Seller / Artisan (I make and sell handmade products)",
      aliases: [
        "seller",
        "artisan",
        "i sell",
        "i make",
        "i want to sell",
        "sell products",
        // Hindi
        "विक्रेता",
        "कारीगर",
        "मैं बेचती हूँ",
        "बेचना है",
        "मैं बनाती हूँ",
        // Kannada
        "ಮಾರಾಟಗಾರ",
        "ಕುಶಲಕರ್ಮಿ",
        "ನಾನು ಮಾರುತ್ತೇನೆ",
        "ಮಾರಬೇಕು",
        // Malayalam
        "വിൽപ്പനക്കാരൻ",
        "വിൽക്കണം",
      ],
    },
    {
      index: 2,
      label: "Buyer (I want to buy from artisans)",
      aliases: [
        "buyer",
        "i want to buy",
        "shopper",
        "buy",
        // Hindi
        "खरीदार",
        "खरीदना है",
        "मुझे खरीदना है",
        // Kannada
        "ಖರೀದಿದಾರ",
        "ಕೊಳ್ಳಬೇಕು",
        "ನಾನು ಕೊಳ್ಳುತ್ತೇನೆ",
        // Malayalam
        "വാങ്ങാൻ",
      ],
    },
  ],

  TUTORIAL: [
    { index: 1, label: "Continue", aliases: ["continue", "next", "go on", "ok", "आगे", "ಮುಂದೆ", "मुंबई"] },
    { index: 2, label: "Replay video", aliases: ["replay", "again", "watch again", "फिर", "ಮತ್ತೆ"] },
  ],

  SELLER_ONBOARD_SHG_ASK: [
    { index: 1, label: "Yes — I'm in an SHG/group", aliases: ["yes", "haan", "हाँ", "ಹೌದು"] },
    { index: 2, label: "No", aliases: ["no", "nahi", "नहीं", "ಇಲ್ಲ"] },
  ],

  SELLER_ONBOARD_CRAFT: [
    { index: 1, label: "Handicrafts", aliases: ["handicraft", "crafts"] },
    { index: 2, label: "Textiles / Tailoring", aliases: ["textile", "tailoring", "cloth", "fabric"] },
    { index: 3, label: "Jewellery", aliases: ["jewelry", "jewellery", "ornaments"] },
    { index: 4, label: "Food Products", aliases: ["food", "snacks", "sweets"] },
    { index: 5, label: "Home Decor", aliases: ["home decor", "decoration", "lamp"] },
    { index: 6, label: "Other", aliases: ["other", "something else"] },
  ],

  SELLER_ONBOARD_SAKHI_HELP: [
    { index: 1, label: "Yes, please connect me with a Sakhi", aliases: ["yes", "connect", "haan"] },
    { index: 2, label: "Not right now", aliases: ["no", "later", "not now"] },
  ],

  BUYER_ONBOARD_INTERESTS: [
    { index: 1, label: "Home Decor", aliases: ["home decor", "decoration"] },
    { index: 2, label: "Clothing / Textiles", aliases: ["clothing", "textiles", "fabric"] },
    { index: 3, label: "Jewellery", aliases: ["jewelry", "jewellery"] },
    { index: 4, label: "Food Products", aliases: ["food"] },
    { index: 5, label: "Gifts", aliases: ["gifts", "presents"] },
    { index: 6, label: "Show everything", aliases: ["all", "everything"] },
  ],

  SELLER_MENU: [
    { index: 1, label: "Add Product", aliases: ["add", "new product", "list", "ಸೇರಿಸಿ", "ಉತ್ಪನ್ನ ಸೇರಿಸಿ", "जोड़ें", "नया उत्पाद", "naya product"] },
    { index: 2, label: "My Products", aliases: ["my products", "products", "listings", "ನನ್ನ ಉತ್ಪನ್ನಗಳು", "मेरे उत्पाद", "mere products"] },
    { index: 3, label: "Orders", aliases: ["orders", "ಆರ್ಡರ್", "ऑर्डर", "mere order"] },
    { index: 4, label: "Buyer Requests", aliases: ["requests", "buyer requests", "ವಿನಂತಿಗಳು", "अनुरोध"] },
    { index: 5, label: "Earnings", aliases: ["earnings", "money", "income", "ಆದಾಯ", "कमाई"] },
    { index: 6, label: "More", aliases: ["more", "other", "ಇನ್ನಷ್ಟು", "और"] },
  ],

  SELLER_MENU_MORE: [
    { index: 1, label: "Edit profile", aliases: ["edit profile", "profile"] },
    { index: 2, label: "Change language", aliases: ["language", "change language"] },
    { index: 3, label: "Contact Karigar Sakhi", aliases: ["sakhi", "contact sakhi"] },
    { index: 4, label: "Photo tips", aliases: ["photo", "tips"] },
    { index: 5, label: "Switch to Buyer mode", aliases: ["buyer mode", "switch to buyer", "buyer", "shopping", "shop"] },
    { index: 6, label: "Help", aliases: ["help"] },
  ],

  BUYER_MENU: [
    { index: 1, label: "Browse Products", aliases: ["browse", "products"] },
    { index: 2, label: "Trending Items", aliases: ["trending", "popular"] },
    { index: 3, label: "Categories", aliases: ["categories"] },
    { index: 4, label: "Search by Message", aliases: ["search", "find"] },
    { index: 5, label: "Request Bulk Order", aliases: ["request", "bulk"] },
    { index: 6, label: "More", aliases: ["more"] },
  ],

  BUYER_MENU_MORE: [
    { index: 1, label: "My Orders", aliases: ["my orders", "orders"] },
    { index: 2, label: "Saved Products", aliases: ["saved", "favorites"] },
    { index: 3, label: "Change Location", aliases: ["change location"] },
    { index: 4, label: "Change Language", aliases: ["language"] },
    { index: 5, label: "Switch to Seller mode", aliases: ["seller mode", "switch to seller", "seller", "sell"] },
    { index: 6, label: "Help", aliases: ["help"] },
  ],

  SAKHI_MENU: [
    { index: 1, label: "Pending Products", aliases: ["pending"] },
    { index: 2, label: "New Sellers", aliases: ["new sellers"] },
    { index: 3, label: "Orders to Support", aliases: ["orders"] },
    { index: 4, label: "Buyer Requests", aliases: ["requests"] },
    { index: 5, label: "Artisan Earnings", aliases: ["earnings"] },
    { index: 6, label: "More", aliases: ["more"] },
  ],

  ADD_PRODUCT_CONFIRM: [
    { index: 1, label: "Confirm — submit for approval", aliases: ["confirm", "yes", "ok", "submit"] },
    { index: 2, label: "Edit price", aliases: ["edit price", "change price"] },
    { index: 3, label: "Edit quantity", aliases: ["edit quantity", "change quantity"] },
    { index: 4, label: "Edit title", aliases: ["edit title", "change name"] },
    { index: 5, label: "Edit description", aliases: ["edit description"] },
    { index: 6, label: "Cancel", aliases: ["cancel", "no"] },
  ],

  REQUEST_CONFIRM: [
    { index: 1, label: "Confirm and broadcast", aliases: ["confirm", "send", "yes"] },
    { index: 2, label: "Edit", aliases: ["edit", "change"] },
    { index: 3, label: "Cancel", aliases: ["cancel", "no"] },
  ],

  QUOTE_VIEW_INCOMING: [
    { index: 1, label: "Send a quote", aliases: ["send quote", "quote", "yes"] },
    { index: 2, label: "Pass / not interested", aliases: ["pass", "skip", "no"] },
    { index: 3, label: "Need more details", aliases: ["details", "more info"] },
  ],

  QUOTE_CONFIRM: [
    { index: 1, label: "Send quote", aliases: ["send", "submit", "yes"] },
    { index: 2, label: "Edit", aliases: ["edit"] },
    { index: 3, label: "Cancel", aliases: ["cancel"] },
  ],

  ORDERS_MANAGE: [
    { index: 1, label: "Accept order", aliases: ["accept", "yes", "ok"] },
    { index: 2, label: "Not available", aliases: ["not available", "cancel", "no stock"] },
    { index: 3, label: "Need help", aliases: ["help"] },
  ],

  MY_PRODUCTS_MANAGE: [
    { index: 1, label: "Change price", aliases: ["price", "ಬೆಲೆ", "कीमत", "kimat"] },
    { index: 2, label: "Change stock", aliases: ["stock", "quantity", "ಸ್ಟಾಕ್", "स्टॉक"] },
    { index: 3, label: "Edit title", aliases: ["title", "name", "ಹೆಸರು", "नाम", "naam"] },
    { index: 4, label: "Edit description", aliases: ["description", "desc", "ವಿವರಣೆ", "विवरण"] },
    { index: 5, label: "Delete product", aliases: ["delete", "remove", "ಅಳಿಸಿ", "हटाओ", "hatao"] },
    { index: 6, label: "View product link", aliases: ["link", "ಲಿಂಕ್", "लिंक"] },
    { index: 7, label: "Back to my products", aliases: ["back", "ಹಿಂದೆ", "वापस"] },
  ],

  SAKHI_PENDING_DETAIL: [
    { index: 1, label: "Approve", aliases: ["approve", "yes", "ok"] },
    { index: 2, label: "Reject", aliases: ["reject", "no"] },
    { index: 3, label: "Back", aliases: ["back"] },
  ],

  BROWSE_CATEGORIES: [
    { index: 1, label: "Home Decor" },
    { index: 2, label: "Clothing / Textiles" },
    { index: 3, label: "Jewellery" },
    { index: 4, label: "Food Products" },
    { index: 5, label: "Gifts" },
    { index: 6, label: "All Products" },
  ],

  BROWSE_PRODUCT_DETAIL: [
    { index: 1, label: "Buy now", aliases: ["buy", "purchase"] },
    { index: 2, label: "Save for later", aliases: ["save", "favorite"] },
    { index: 3, label: "More like this", aliases: ["similar"] },
    { index: 4, label: "Back", aliases: ["back"] },
  ],
};

export function getOptionsForState(state: ConversationState) {
  return STATE_OPTIONS[state] ?? [];
}

/** Human-readable description of what step the user is at, for NLU prompt context. */
export function describeState(state: ConversationState): string {
  const map: Partial<Record<ConversationState, string>> = {
    GREETING: "First contact, about to ask language",
    AWAITING_LANGUAGE: "Picking a language",
    AWAITING_REPLY_MODE: "Picking how replies are delivered: text only / voice only / both",
    AWAITING_ROLE: "Picking a role: seller, buyer, or sakhi",
    TUTORIAL: "Showing tutorial video, asking to continue or replay",
    SELLER_COMMUNITY_JOIN: "Asking seller to join WhatsApp community for 7-day cohort",
    SELLER_COMMUNITY_WAITING: "Seller has joined community, waiting for certificate",
    SELLER_LOCKED_MENU: "Seller account locked until certified",
    SELLER_PRECHECK_NAME: "Asking seller for their full name (pre-community)",
    SELLER_PRECHECK_ADDRESS: "Asking seller for their full postal address (pre-community)",
    SELLER_PRECHECK_CONTACT: "Asking seller for a contact number or SAME for WhatsApp number (pre-community)",
    SELLER_ONBOARD_NAME: "Asking seller for their name",
    SELLER_ONBOARD_DISTRICT: "Asking seller for their district",
    SELLER_ONBOARD_CRAFT: "Asking seller what craft they make",
    SELLER_ONBOARD_SHG_ASK: "Asking if seller is in an SHG/group",
    SELLER_ONBOARD_SHG_NAME: "Asking seller for the SHG name",
    SELLER_ONBOARD_SAKHI_HELP: "Asking seller if they want a Sakhi to help",
    BUYER_ONBOARD_NAME: "Asking buyer for their name",
    BUYER_ONBOARD_LOCATION: "Asking buyer for their city",
    BUYER_ONBOARD_INTERESTS: "Asking buyer what interests them",
    SAKHI_ONBOARD_NAME: "Asking Sakhi for their name",
    SAKHI_ONBOARD_DISTRICT: "Asking Sakhi for their district",
    SAKHI_ONBOARD_GROUPS: "Asking Sakhi which groups they support",
    SELLER_MENU: "Seller main menu",
    SELLER_MENU_MORE: "Seller's More submenu",
    BUYER_MENU: "Buyer main menu",
    BUYER_MENU_MORE: "Buyer's More submenu",
    SAKHI_MENU: "Sakhi main menu",
    SAKHI_MENU_MORE: "Sakhi's More submenu",
    ADD_PRODUCT_PHOTOS: "Asking seller to send product photos",
    ADD_PRODUCT_DETAILS: "Asking seller for product details (text or voice)",
    ADD_PRODUCT_CONFIRM: "Showing product draft for confirmation",
    ADD_PRODUCT_EDIT_PRICE: "Asking for new product price",
    ADD_PRODUCT_EDIT_QUANTITY: "Asking for new product quantity",
    ADD_PRODUCT_EDIT_TITLE: "Asking for new product title",
    ADD_PRODUCT_EDIT_DESCRIPTION: "Asking for new product description",
    MY_PRODUCTS_LIST: "Showing seller's product list",
    MY_PRODUCTS_MANAGE: "Managing one seller product",
    MY_PRODUCTS_EDIT_PRICE: "Asking for updated price",
    MY_PRODUCTS_EDIT_STOCK: "Asking for updated stock count",
    MY_PRODUCTS_EDIT_TITLE: "Asking for updated product title",
    MY_PRODUCTS_EDIT_DESC: "Asking for updated product description",
    ORDERS_LIST: "Showing seller's orders",
    ORDERS_MANAGE: "Managing one order",
    BROWSE_CATEGORIES: "Picking a product category",
    BROWSE_RESULTS: "Browsing search/category results",
    BROWSE_PRODUCT_DETAIL: "Viewing one product",
    SEARCH_PROMPT: "Asking buyer what they're looking for",
    SEARCH_RESULTS: "Showing search results",
    REQUEST_BRIEF: "Asking buyer to describe their bulk request",
    REQUEST_DELIVERY_DATE: "Asking when buyer needs delivery",
    REQUEST_LOCATION: "Asking buyer for delivery location",
    REQUEST_BUDGET: "Asking buyer for budget range",
    REQUEST_CONFIRM: "Confirming buyer's request",
    QUOTE_VIEW_INCOMING: "Showing seller a buyer request",
    QUOTE_PRICE: "Asking seller for quote price",
    QUOTE_DELIVERY: "Asking seller for delivery promise",
    QUOTE_NOTE: "Asking seller for an optional note",
    QUOTE_CONFIRM: "Confirming seller's quote",
    QUOTE_BROWSE: "Buyer browsing received quotes",
    SAKHI_PENDING_LIST: "Sakhi reviewing pending products",
    SAKHI_PENDING_DETAIL: "Sakhi reviewing one pending product",
  };
  return map[state] ?? state;
}
