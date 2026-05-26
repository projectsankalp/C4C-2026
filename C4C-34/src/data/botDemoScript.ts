/**
 * Canonical demo transcript for the home-page "See the bot live" section.
 *
 * Mirrors what `POST /wabot/demo/run` produces when the wa-bot service is
 * available. We ship it as a static fallback so the section always plays —
 * even if the bot is offline, has no QR scanned, or the user is offline.
 *
 * Two-line summaries are used on bot replies (instead of the engine's full
 * 400-char block messages) because long blocks don't read well at chat-bubble
 * width. The intent here is showcase, not byte-for-byte fidelity.
 */

export type DemoBubbleAuthor = "user" | "bot";

export type DemoBubble =
  | { id: string; author: DemoBubbleAuthor; kind: "text"; text: string; delay?: number }
  | {
      id: string;
      author: "user";
      kind: "image";
      imageUrl: string;
      caption?: string;
      delay?: number;
    }
  | {
      id: string;
      author: "bot";
      kind: "card";
      title: string;
      price: string;
      lines: string[];
      delay?: number;
    }
  | {
      id: string;
      author: "bot";
      kind: "success";
      title: string;
      subtitle: string;
      delay?: number;
    };

/** Plausible coconut-shell-lamp product photo (Unsplash, free use). */
export const DEMO_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80";

/**
 * Order matters. `delay` is the pause AFTER showing the bubble before the
 * next bubble's typing indicator appears. When unset, the component default
 * (~900ms) applies.
 */
export const DEMO_TRANSCRIPT: DemoBubble[] = [
  {
    id: "b-greet",
    author: "bot",
    kind: "text",
    text: "🙏 *Namaste!* Welcome to *HastKala BolKeBecho* — your WhatsApp shop assistant.\n\nI'll help you list and sell your handmade products.",
  },
  { id: "u-hi", author: "user", kind: "text", text: "hi" },
  {
    id: "b-lang",
    author: "bot",
    kind: "text",
    text: "Choose your language:\n\n*1.* English\n*2.* हिंदी\n*3.* ಕನ್ನಡ\n*4.* தமிழ்\n*5.* മലയാളം",
  },
  { id: "u-lang", author: "user", kind: "text", text: "1" },
  {
    id: "b-role",
    author: "bot",
    kind: "text",
    text: "Are you a:\n\n*1.* Seller (artisan / SHG)\n*2.* Buyer\n*3.* Karigar Sakhi (coordinator)",
  },
  { id: "u-role", author: "user", kind: "text", text: "1" },
  { id: "b-name", author: "bot", kind: "text", text: "Wonderful 🎨 What's your name?" },
  { id: "u-name", author: "user", kind: "text", text: "Lakshmi" },
  {
    id: "b-district",
    author: "bot",
    kind: "text",
    text: "Hello *Lakshmi*! Which district are you from?",
    delay: 900,
  },
  { id: "u-district", author: "user", kind: "text", text: "Dakshina Kannada" },
  {
    id: "b-craft",
    author: "bot",
    kind: "text",
    text: "What do you make?\n\n*1.* Handloom\n*2.* Pottery\n*3.* Embroidery\n*4.* Jewellery\n*5.* Coconut shell craft\n*6.* Other",
  },
  { id: "u-craft", author: "user", kind: "text", text: "5" },
  {
    id: "b-add",
    author: "bot",
    kind: "text",
    text: "✅ Onboarding complete!\n\nWhat would you like to do?\n\n*1.* Add a product\n*2.* See my listings\n*3.* See my orders",
    delay: 900,
  },
  { id: "u-add", author: "user", kind: "text", text: "1" },
  {
    id: "b-photo",
    author: "bot",
    kind: "text",
    text: "📸 Send me a photo of your product. You can send several — reply *DONE* when you're finished.",
  },
  {
    id: "u-photo",
    author: "user",
    kind: "image",
    imageUrl: DEMO_PRODUCT_IMAGE,
    caption: "Coconut shell lamp",
    delay: 1300,
  },
  {
    id: "b-photo-ack",
    author: "bot",
    kind: "text",
    text: "Got the photo ✓\n\nSend more photos, or reply *DONE* to continue.",
  },
  { id: "u-done", author: "user", kind: "text", text: "DONE" },
  {
    id: "b-details",
    author: "bot",
    kind: "text",
    text: "Now tell me about it. You can speak it as a voice note or type:\n\n• *What is it?*\n• *Price?*\n• *How many available?*",
  },
  {
    id: "u-details",
    author: "user",
    kind: "text",
    text: "Handmade coconut shell lamp, ₹600, 2 pieces available",
  },
  {
    id: "b-thinking",
    author: "bot",
    kind: "text",
    text: "✨ Let me draft your listing…",
    delay: 1400,
  },
  {
    id: "b-draft",
    author: "bot",
    kind: "card",
    title: "Handcrafted Coconut Shell Lamp",
    price: "₹600",
    lines: [
      "Polished coconut shell lamp from Dakshina Kannada — warm ambient glow, eco-friendly, made by hand.",
      "Category: Coconut Shell Craft  ·  Available: 2",
      "Material: Natural coconut shell, brass fittings",
    ],
    delay: 1500,
  },
  {
    id: "b-confirm",
    author: "bot",
    kind: "text",
    text: "Does this look right?\n\n*1.* Yes, send for approval\n*2.* Edit\n*3.* Cancel",
  },
  { id: "u-confirm", author: "user", kind: "text", text: "1" },
  {
    id: "b-success",
    author: "bot",
    kind: "success",
    title: "Sent to your Karigar Sakhi",
    subtitle: "You'll get a WhatsApp ping the moment a buyer orders.",
    delay: 900,
  },
];
