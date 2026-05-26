/**
 * Kannada (ಕನ್ನಡ) copy for HastKala BolKeBecho.
 * Tone: respectful (ನೀವು form), warm, simple Kannada (no Sanskritized vocabulary).
 * Reading level: rural Karnataka 8th grade.
 *
 * Translation choices:
 *   product = ಉತ್ಪನ್ನ
 *   price = ಬೆಲೆ
 *   quantity = ಪ್ರಮಾಣ
 *   piece = ತುಂಡು (units)
 *   photo = ಫೋಟೋ
 *   approval = ಅನುಮೋದನೆ
 *   request = ವಿನಂತಿ
 *   quote = ಬೆಲೆ ಪತ್ರ (price letter / quote)
 */
import type { MessageRegistry } from "./types";
import type { ProductDraftResponse } from "../../types";

export const kn: MessageRegistry = {
  // ----- First-time setup -----

  greeting: () =>
    `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

ನಮಸ್ಕಾರ 🙏 ಸ್ವಾಗತ!

ನಾವು ಮಹಿಳಾ ಕುಶಲಕರ್ಮಿಗಳಿಗೆ ಕೈಯಾರೆ ಮಾಡಿದ ಉತ್ಪನ್ನಗಳನ್ನು *ನೇರವಾಗಿ* ಗ್ರಾಹಕರಿಗೆ ಮಾರಲು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ — ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ.

💬 *ಏನಾದರೂ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ವಾಯ್ಸ್ ನೋಟ್ ಕಳುಹಿಸಿ — ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ!*

ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ / Choose your language:

1. English
2. हिन्दी (Hindi)
3. ಕನ್ನಡ
4. தமிழ் (Tamil)
5. മലയാളം (Malayalam)

_ಪ್ರಾರಂಭಿಸಲು ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  languageInvalid: () =>
    `ದಯವಿಟ್ಟು 1 ರಿಂದ 5ರ ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ.

1. English
2. हिन्दी
3. ಕನ್ನಡ
4. தமிழ்
5. മലയാളം`,

  languageConfirmed: (language: string) =>
    `ಚೆನ್ನಾಗಿದೆ ✅ ${language} ಆಯ್ಕೆಯಾಯಿತು.

💡 _ವಾಯ್ಸ್ ನೋಟ್‌ಗಳನ್ನೂ ಕಳುಹಿಸಬಹುದು. ಬಿಡಲು *EXIT*, ಮರಳಲು *MENU* ಬರೆಯಿರಿ._

ಭಾಷೆ ಬದಲಿಸಲು ಯಾವಾಗ ಬೇಕಾದರೂ *LANGUAGE* ಎಂದು ಬರೆಯಿರಿ.`,

  languageInstructions: () =>
    `📚 *ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ಸಣ್ಣ ಮಾರ್ಗದರ್ಶಿ*

✍️  *ಟೈಪ್* ಮಾಡಿ ಏನಾದರೂ ಕೇಳಲು
🎙️  *ವಾಯ್ಸ್ ನೋಟ್* — ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ
1️⃣  *ಸಂಖ್ಯೆ* ಮೆನುವಿನಿಂದ ಆಯ್ಕೆ ಮಾಡಲು
🌐  *MENU* — ಮುಖ್ಯ ಮೆನುಗೆ ಮರಳಲು
↩️  *BACK* — ಒಂದು ಹೆಜ್ಜೆ ಹಿಂದೆ
👋  *EXIT* — ಬಿಡಲು (ನಿಮ್ಮ ಡೇಟಾ ಸುರಕ್ಷಿತ)
🤝  *HUMAN* — ಕರಿಗರ್ ಸಖಿ ಜೊತೆ ಮಾತನಾಡಲು

_ಸಿದ್ಧವೇ? ಪ್ರಾರಂಭಿಸೋಣ._`,

  replyModeAsk: () =>
    `ನಾನು ಹೇಗೆ ಉತ್ತರಿಸಲಿ?

1. 📝 ಟೆಕ್ಸ್ಟ್ ಮಾತ್ರ
2. 🎙️ ವಾಯ್ಸ್ ಮಾತ್ರ
3. 📝+🎙️ ಎರಡೂ (ಟೆಕ್ಸ್ಟ್ + ವಾಯ್ಸ್)

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  roleAsk: () =>
    `ನೀವು ಯಾರು?

1. *ಮಾರಾಟಗಾರ* — ನಾನು ಕೈಯಾರೆ ಮಾಡಿದ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರುತ್ತೇನೆ
2. *ಖರೀದಿದಾರ* — ನಾನು ಕುಶಲಕರ್ಮಿಗಳಿಂದ ಖರೀದಿಸಬೇಕು

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  roleInvalid: () => `ದಯವಿಟ್ಟು 1 ಅಥವಾ 2 ಕಳುಹಿಸಿ.`,

  roleConfirmed: (role) => {
    const label = { seller: "ಮಾರಾಟಗಾರ / ಕುಶಲಕರ್ಮಿ", buyer: "ಖರೀದಿದಾರ", sakhi: "ಕಾರಿಗರ್ ಸಖಿ" }[role];
    return `ಸ್ವಾಗತ 🌸 ನೀವು *${label}* ಆಗಿ ಸೇರುತ್ತಿದ್ದೀರಿ.`;
  },

  tutorial: (videoUrl: string) =>
    `HastKala ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂಬ 1 ನಿಮಿಷದ ಮಾರ್ಗದರ್ಶಿ 🎥

${videoUrl}

ಉತ್ತರಿಸಿ:
1. ಮುಂದುವರಿಯಿರಿ
2. ವೀಡಿಯೋ ಮತ್ತೆ ನೋಡಿ`,

  tutorialPostText: (role) =>
    role === "buyer"
      ? `*ಸುಲಭ ಹೆಜ್ಜೆಗಳು:*

1. ಉತ್ಪನ್ನ ಹುಡುಕಿ
2. ನಿಮ್ಮ ಬಜೆಟ್ ಬರೆಯಿರಿ
3. ನೀವು ಮೊದಲು ಖರೀದಿಸಿದ ವಸ್ತು ಸೈಟ್‌ನಲ್ಲಿ ಇದೆಯೇ ಎಂದು ನೋಡಿ, ಮತ್ತೆ ಖರೀದಿಸಲು
4. ಖರೀದಿದಾರರ ಆರ್ಡರ್ ಇತಿಹಾಸ ನೋಡಿ
5. ಇತ್ಯಾದಿ

_ಮುಂದುವರಿಯಲು 1 ಕಳುಹಿಸಿ._`
      : `*ಸುಲಭ ಹೆಜ್ಜೆಗಳು:*

1. ಉತ್ಪನ್ನದ ಫೋಟೋ ಕಳುಹಿಸಿ
2. ಬೆಲೆ ಮತ್ತು ವಿವರ ಹೇಳಿ
3. ದೃಢೀಕರಿಸಿ — ಉತ್ಪನ್ನ HastKala ನಲ್ಲಿ ಲೈವ್ ಆಗುತ್ತದೆ
4. ಗ್ರಾಹಕರು ಆರ್ಡರ್ ಮಾಡಿದಾಗ — WhatsApp ನಲ್ಲಿ ಸೂಚನೆ ಸಿಗುತ್ತದೆ

_ಮುಂದುವರಿಯಲು 1 ಕಳುಹಿಸಿ._`,

  // ----- Seller community / certification gate -----

  sellerPrecheckName: () =>
    `🌸 *HastKala ಮಾರಾಟಗಾರರಿಗೆ ಸ್ವಾಗತ!*

ಸಮುದಾಯದ ಲಿಂಕ್ ಕಳುಹಿಸುವ ಮೊದಲು ನಮ್ಮ ಪ್ರತಿನಿಧಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಕೆಲ ವಿವರಗಳು ಬೇಕಿವೆ.

📍 *ಹಂತ 1/3* — ನಿಮ್ಮ *ಪೂರ್ಣ ಹೆಸರು* ಏನು?

_ಉದಾಹರಣೆ: ಲಕ್ಷ್ಮಿ ದೇವಿ_`,

  sellerPrecheckAddress: () =>
    `📍 📍 *ಹಂತ 2/3* — ನಿಮ್ಮ *ಪೂರ್ಣ ವಿಳಾಸ* ಏನು?

ಇದರಿಂದ ನಿಮ್ಮ ಸಮೀಪದ ಖರೀದಿದಾರರನ್ನು ತೋರಿಸಲು ಮತ್ತು ಪಿಕಪ್ ವ್ಯವಸ್ಥೆ ಮಾಡಲು ಸಹಾಯವಾಗುತ್ತದೆ.

_ಉದಾಹರಣೆ: ಮನೆ 45, ಮುಖ್ಯ ರಸ್ತೆ, ಮಂಗಳೂರು, ದಕ್ಷಿಣ ಕನ್ನಡ, ಕರ್ನಾಟಕ 575001_`,

  sellerPrecheckContact: (currentPhone: string) =>
    `📞 📍 *ಹಂತ 3/3* — ನಿಮ್ಮ *ಉತ್ತಮ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ* ಏನು?

ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ, ಅಥವಾ ಇದೇ WhatsApp ಸಂಖ್ಯೆ ಬಳಸಲು *0* ಬರೆಯಿರಿ (${currentPhone}).

_ಉದಾಹರಣೆ: 9876543210_`,

  sellerCommunityJoin: (communityLink: string) =>
    `✅ *ಸಿಕ್ಕಿತು, ಧನ್ಯವಾದಗಳು!*

ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ. ಈಗ *7-ದಿನದ Seller Cohort*ಗೆ ಸೇರಿ — ಇದು ಉಚಿತ WhatsApp ಸಮುದಾಯ:

✅ ಕೆಲಸ ಮಾಡುವ ರೀತಿ ಕಲಿಯಿರಿ
✅ ಇತರ ಕುಶಲಕರ್ಮಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಮಾಡಿ
✅ ಖರೀದಿದಾರರ ನಂಬಿಕೆ ಗಳಿಸಿ
✅ *HastKala Seller Certificate* ಪಡೆಯಿರಿ

👉 *ಇಲ್ಲಿ ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ:*
${communityLink}

*HastKala ಸಮುದಾಯದ ಪ್ರತಿನಿಧಿ* ಶೀಘ್ರವೇ cohortಗೆ ಸೇರುವ ಔಪಚಾರಿಕತೆಗಾಗಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.

7-ದಿನದ ಕಾರ್ಯಾಗಾರದ ನಂತರ ಸರ್ಟಿಫಿಕೇಟ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಇಲ್ಲಿ WhatsAppನಲ್ಲಿ ಬರುತ್ತದೆ ಮತ್ತು ಮಾರಾಟಗಾರ ಖಾತೆ ತಕ್ಷಣ ತೆರೆಯುತ್ತದೆ.

_ಖರೀದಿದಾರರಾಗಿ ಖರೀದಿಸಲು *BUYER* ಬರೆಯಿರಿ, ಅಥವಾ ಹೊಸದಾಗಿ ಪ್ರಾರಂಭಿಸಲು *RESET* ಬರೆಯಿರಿ._`,

  sellerCommunityWaiting: () =>
    `⏳ *ನಿಮ್ಮ ಸರ್ಟಿಫಿಕೇಟ್‌ಗಾಗಿ ಕಾಯುತ್ತಿದ್ದೇವೆ!*

7-ದಿನದ cohort ಮುಗಿದ ನಂತರ ಸಮುದಾಯ ತಂಡ ನಿಮ್ಮ ಸರ್ಟಿಫಿಕೇಟ್ ಜಾರಿ ಮಾಡುತ್ತದೆ. *ಖಾತೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರೆಯುತ್ತದೆ* — ಸರ್ಟಿಫಿಕೇಟ್ ಸಿದ್ಧವಾದ ತಕ್ಷಣ ಇಲ್ಲಿ WhatsAppನಲ್ಲಿ ಸಿಗುತ್ತದೆ.

_ಅಲ್ಲಿಯವರೆಗೆ ನೋಡಬಹುದು:_
• ಉತ್ಪನ್ನ ನೋಡಲು *BROWSE* ಬರೆಯಿರಿ
• ಹುಡುಕಲು *SEARCH* ಬರೆಯಿರಿ`,

  sellerCommunityAlreadyJoined: () =>
    `✅ *ಎಲ್ಲ ಸಿದ್ಧ.*

ನಮ್ಮ ಸಮುದಾಯ ಪ್ರತಿನಿಧಿ ಶೀಘ್ರವೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ. 7-ದಿನದ cohort ಮುಗಿದ ನಂತರ ಸರ್ಟಿಫಿಕೇಟ್ ಇಲ್ಲಿ WhatsAppನಲ್ಲಿ ಬರುತ್ತದೆ ಮತ್ತು ಮಾರಾಟಗಾರ ಖಾತೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರೆಯುತ್ತದೆ.

_ಬೇರೇನೂ ಮಾಡಬೇಕಿಲ್ಲ — ಕೇವಲ ಕಾರ್ಯಾಗಾರ ಮುಗಿಸಿ._`,

  sellerLockedMenu: () =>
    `🔒 *ನಿಮ್ಮ ಮಾರಾಟಗಾರ ಖಾತೆ ಇನ್ನೂ ತೆರೆದಿಲ್ಲ.*

HastKalaನಲ್ಲಿ ಮಾರಾಟ ಮಾಡಲು:

1️⃣ HastKala ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ (ಲಿಂಕ್‌ಗೆ *JOIN* ಬರೆಯಿರಿ)
2️⃣ 7-ದಿನದ cohort ಮುಗಿಸಿ
3️⃣ ನಿಮ್ಮ ಸರ್ಟಿಫಿಕೇಟ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಜಾರಿಯಾಗುತ್ತದೆ
4️⃣ ಖಾತೆ ತಕ್ಷಣ ತೆರೆಯುತ್ತದೆ — ನಾವು ಇಲ್ಲಿ ಸೂಚಿಸುತ್ತೇವೆ

_ಅಲ್ಲಿಯವರೆಗೆ ಖರೀದಿದಾರರಾಗಿ ನೋಡಬಹುದು:_
• ಉತ್ಪನ್ನ ನೋಡಲು *BROWSE* ಬರೆಯಿರಿ
• ಹುಡುಕಲು *SEARCH* ಬರೆಯಿರಿ`,

  sellerCertUnlocked: (name: string) =>
    `🎉 *ಅಭಿನಂದನೆ${name ? `, ${name} ಅವರೇ` : ""}!*

ನೀವು HastKala 7-ದಿನದ Seller Cohort ಮುಗಿಸಿದ್ದೀರಿ ✅

ನಿಮ್ಮ *HastKala Seller Certificate* ಕೆಳಗೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ 👇

ನಿಮ್ಮ ಮಾರಾಟಗಾರ ಖಾತೆ ಈಗ *UNLOCKED* ಆಗಿದೆ 🔓

ಈಗ ನೀವು:
• ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಬಹುದು ಮತ್ತು ಆರ್ಡರ್ ಪಡೆಯಬಹುದು
• ಬಲ್ಕ್ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕ ಮಾಡಬಹುದು
• ಗಳಿಕೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನೋಡಬಹುದು

_HastKala ಕುಟುಂಬಕ್ಕೆ ಸ್ವಾಗತ! ಪ್ರಾರಂಭಿಸೋಣ._`,

  sellerCertPdfCaption: (name: string) =>
    `📜 *HastKala Seller Certificate*${name ? ` — ${name}` : ""}

ನೀವು HastKala 7-ದಿನದ Seller Cohort ಮುಗಿಸಿದ್ದೀರಿ ಎಂದು ಪ್ರಮಾಣೀಕರಿಸುವ ಅಧಿಕೃತ ಸರ್ಟಿಫಿಕೇಟ್ ಇದು.

_ಇದನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಇಡಿ — ಇದು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ನಲ್ಲಿ ನಿಮ್ಮ ನಂಬಿಕೆಯ ಪ್ರಮಾಣ._`,

  sellerCertTextFallback: (name: string) =>
    `📜 *HastKala Seller Certificate*

✅ *${name || "ನೀವು"}* HastKala 7-ದಿನದ Seller Cohort ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿಸಿದ್ದೀರಿ ಎಂದು ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ.

ನೀವು ಈಗ ಪರಿಶೀಲಿತ HastKala ಮಾರಾಟಗಾರರು. ಸಮುದಾಯಕ್ಕೆ ಸ್ವಾಗತ! 🌸

_Certificate ID: HK-${Date.now().toString(36).toUpperCase()}_`,

  // ----- Returning user -----

  welcomeBack: (name?: string) => (name ? `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

ಮತ್ತೆ ಸ್ವಾಗತ, ${name} ಅವರೇ 🌸

💬 _ಏನಾದರೂ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ವಾಯ್ಸ್ ನೋಟ್ ಕಳುಹಿಸಿ — ನಾನು ಇಲ್ಲಿದ್ದೇನೆ!_` : `━━━━━━━━━━━━━━━━━━━━
🪷 *HastKala BolKeBecho*
━━━━━━━━━━━━━━━━━━━━

ಮತ್ತೆ ಸ್ವಾಗತ 🌸

💬 _ಏನಾದರೂ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ವಾಯ್ಸ್ ನೋಟ್ ಕಳುಹಿಸಿ — ನಾನು ಇಲ್ಲಿದ್ದೇನೆ!_`),

  whichRole: () =>
    `ಹೇಗೆ ಮುಂದುವರಿಯುತ್ತೀರಿ?

1. ಮಾರಾಟಗಾರ ಮೆನು
2. ಖರೀದಿದಾರ ಮೆನು

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  // ----- Seller onboarding -----

  sellerAskName: () =>
    `ದಯವಿಟ್ಟು 📍 *ಹಂತ 1/3* — ನಿಮ್ಮ *ಹೆಸರು* ಕಳುಹಿಸಿ.

ಉದಾಹರಣೆ: ಲಕ್ಷ್ಮಿ`,

  sellerAskDistrict: () =>
    `📍 *ಹಂತ 2/3* — ನೀವು ಯಾವ *ಜಿಲ್ಲೆ*ಯಿಂದ?

ಉದಾಹರಣೆ: ದಕ್ಷಿಣ ಕನ್ನಡ`,

  sellerAskCraft: () =>
    `ನೀವು ಏನು ಮಾಡುತ್ತೀರಿ?

1. ಕರಕುಶಲ ವಸ್ತುಗಳು
2. ಬಟ್ಟೆ / ಹೊಲಿಗೆ
3. ಆಭರಣ
4. ಆಹಾರ ಪದಾರ್ಥಗಳು
5. ಮನೆ ಅಲಂಕಾರ
6. ಬೇರೆ

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  sellerAskShg: () =>
    `ನೀವು SHG, NGO ಅಥವಾ ಕುಶಲಕರ್ಮಿ ಗುಂಪಿನ ಸದಸ್ಯರೇ?

1. ಹೌದು
2. ಇಲ್ಲ`,

  sellerAskShgName: () =>
    `ದಯವಿಟ್ಟು *ಗುಂಪಿನ ಹೆಸರು* ಕಳುಹಿಸಿ.

ಉದಾಹರಣೆ: ಸಖಿ ಮಹಿಳಾ SHG`,

  sellerAskSakhiHelp: () =>
    `ನಿಮ್ಮ ಬಳಿಯ *ಕಾರಿಗರ್ ಸಖಿ* ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲಿ?

1. ಹೌದು, ಸಂಪರ್ಕಿಸಿ
2. ಈಗ ಬೇಡ`,

  sellerOnboardComplete: (name: string) =>
    `ನಿಮ್ಮ ಮಾರಾಟಗಾರ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ ✅

HastKalaಗೆ ಸ್ವಾಗತ, *${name}* ಅವರೇ 🌸
ಈಗ ನೀವು WhatsAppನಲ್ಲೇ ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಬಹುದು ಮತ್ತು ಆರ್ಡರ್ ಪಡೆಯಬಹುದು.`,

  // ----- Buyer onboarding -----

  buyerAskName: () =>
    `ನಿಮ್ಮನ್ನು ಏನೆಂದು ಕರೆಯಬೇಕು?

ಉದಾಹರಣೆ: ರಾಹುಲ್`,

  buyerAskLocation: () =>
    `ನೀವು ಯಾವ *ನಗರ*ದಲ್ಲಿದ್ದೀರಿ?

ಸಮೀಪದ ಕುಶಲಕರ್ಮಿಗಳನ್ನು ತೋರಿಸಲು ಸಹಾಯವಾಗುತ್ತದೆ.

ಉದಾಹರಣೆ: ಬೆಂಗಳೂರು`,

  buyerAskInterests: () =>
    `ನಿಮ್ಮ ಆಸಕ್ತಿ ಯಾವುದು?

1. ಮನೆ ಅಲಂಕಾರ
2. ಬಟ್ಟೆ / ವಸ್ತ್ರ
3. ಆಭರಣ
4. ಆಹಾರ ಪದಾರ್ಥಗಳು
5. ಉಡುಗೊರೆ
6. ಎಲ್ಲವನ್ನೂ ತೋರಿಸಿ

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  buyerOnboardComplete: (name: string) =>
    `HastKalaಗೆ ಸ್ವಾಗತ, *${name}* ಅವರೇ 🛍️

ಭಾರತದಾದ್ಯಂತ ಮಹಿಳಾ ಕುಶಲಕರ್ಮಿಗಳ ಕೈಯಾರೆ ಮಾಡಿದ ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ.`,

  // ----- Sakhi onboarding -----

  sakhiAskName: () =>
    `ದಯವಿಟ್ಟು 📍 *ಹಂತ 1/3* — ನಿಮ್ಮ *ಹೆಸರು* ಕಳುಹಿಸಿ.

ಉದಾಹರಣೆ: ಪ್ರಿಯಾ`,

  sakhiAskDistrict: () =>
    `ನೀವು ಯಾವ *ಜಿಲ್ಲೆ*ಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?

ಉದಾಹರಣೆ: ಧಾರವಾಡ`,

  sakhiAskGroups: () =>
    `ನೀವು ಯಾವ ಕುಶಲಕರ್ಮಿಗಳು, SHGಗಳು ಅಥವಾ NGOಗಳ ಜೊತೆ ಕೆಲಸ ಮಾಡುತ್ತೀರಿ?

ಕೆಲವು ಹೆಸರು ಕಳುಹಿಸಿ — ಅಥವಾ *SKIP* ಬರೆಯಿರಿ.`,

  sakhiOnboardComplete: (name: string) =>
    `ನಿಮ್ಮ ಸಖಿ ಪ್ರೊಫೈಲ್ ಸಿದ್ಧವಾಗಿದೆ ✅

ಸ್ವಾಗತ, *${name}* ಅವರೇ 🌸
ಈಗ ನೀವು WhatsAppನಲ್ಲೇ ಉತ್ಪನ್ನಗಳನ್ನು ಅನುಮೋದಿಸಬಹುದು ಮತ್ತು ಕುಶಲಕರ್ಮಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡಬಹುದು.`,

  // ----- Main menus -----

  sellerMenu: (name: string) =>
    `🌸 *ನಮಸ್ಕಾರ ${name} ಅವರೇ, ಏನು ಮಾಡಬೇಕು?*

1. ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ
2. ನನ್ನ ಉತ್ಪನ್ನಗಳು
3. ಆರ್ಡರ್‌ಗಳು
4. ಖರೀದಿದಾರರ ವಿನಂತಿಗಳು
5. ಗಳಿಕೆ
6. ಇನ್ನಷ್ಟು

_ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ ಆಯ್ಕೆಯ ಹೆಸರು ಬರೆಯಿರಿ._`,

  sellerMenuMore: () =>
    `*ಇನ್ನಷ್ಟು ಆಯ್ಕೆಗಳು:*

1. ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ
2. ಭಾಷೆ ಬದಲಿಸಿ
3. ಕಾರಿಗರ್ ಸಖಿ ಸಂಪರ್ಕ
4. ಫೋಟೋ ಸಲಹೆಗಳು
5. *🛍️ ಖರೀದಿದಾರ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ*
6. ಸಹಾಯ

_ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._`,

  buyerMenu: (name: string) =>
    `🛍️ *ನಮಸ್ಕಾರ ${name} ಅವರೇ, ಏನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?*

1. ಉತ್ಪನ್ನಗಳನ್ನು ನೋಡಿ
2. ಜನಪ್ರಿಯ
3. ವಿಭಾಗಗಳು
4. ಸಂದೇಶದಿಂದ ಹುಡುಕಿ
5. ಬಲ್ಕ್ ಆರ್ಡರ್ ವಿನಂತಿ
6. ಇನ್ನಷ್ಟು

_ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ ಆಯ್ಕೆಯ ಹೆಸರು ಬರೆಯಿರಿ._`,

  buyerMenuMore: () =>
    `*ಇನ್ನಷ್ಟು ಆಯ್ಕೆಗಳು:*

1. ನನ್ನ ಆರ್ಡರ್‌ಗಳು
2. ಉಳಿಸಿದ ಉತ್ಪನ್ನಗಳು
3. ಸ್ಥಳ ಬದಲಿಸಿ
4. ಭಾಷೆ ಬದಲಿಸಿ
5. *🌸 ಮಾರಾಟಗಾರ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ*
6. ಸಹಾಯ

_ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._`,

  sakhiMenu: (name: string) =>
    `✅ *ನಮಸ್ಕಾರ ${name} ಅವರೇ.*

1. ಬಾಕಿ ಉತ್ಪನ್ನಗಳು
2. ಹೊಸ ಮಾರಾಟಗಾರರು
3. ಆರ್ಡರ್ ಸಹಾಯ
4. ಖರೀದಿದಾರರ ವಿನಂತಿಗಳು
5. ಕುಶಲಕರ್ಮಿ ಗಳಿಕೆ
6. ಇನ್ನಷ್ಟು

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  sakhiMenuMore: () =>
    `*ಇನ್ನಷ್ಟು ಆಯ್ಕೆಗಳು:*

1. ನನ್ನ ಪ್ರೊಫೈಲ್
2. ಭಾಷೆ ಬದಲಿಸಿ
3. ಸಹಾಯ

_ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._`,

  // ----- Add product -----

  addProductStart: () =>
    `🌸 ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಸೇರಿಸೋಣ.

*ಹಂತ 1 / 3:* ದಯವಿಟ್ಟು 1-3 *ಸ್ಪಷ್ಟ ಉತ್ಪನ್ನ ಫೋಟೋ* ಕಳುಹಿಸಿ 📸

ಒಂದೊಂದಾಗಿ ಕಳುಹಿಸಬಹುದು. ಮುಗಿದ ನಂತರ *0* ಎಂದು ಬರೆಯಿರಿ.

_ಸಲಹೆ: ಉತ್ತಮ ಬೆಳಕು, ಸರಳ ಹಿನ್ನೆಲೆ, ಪೂರ್ಣ ಉತ್ಪನ್ನ ಕಾಣಬೇಕು._`,

  addProductPhotoReceived: (count: number, max: number) =>
    `📸 ಫೋಟೋ ${count} / ${max} ಪಡೆಯಲಾಗಿದೆ ✅

ಇನ್ನೊಂದು ಫೋಟೋ ಕಳುಹಿಸಿ ಅಥವಾ *0* ಬರೆಯಿರಿ.`,

  addProductMaxPhotos: () =>
    `ಗರಿಷ್ಠ 3 ಫೋಟೋ ಆಗಿದೆ.

ಮುಂದುವರಿಯಲು *0* ಬರೆಯಿರಿ.`,

  addProductPhotosNeedFirst: () =>
    `ದಯವಿಟ್ಟು ಮೊದಲು ಉತ್ಪನ್ನದ *ಫೋಟೋ* ಕಳುಹಿಸಿ 📸

ಫೋಟೋ ಸಿಕ್ಕ ನಂತರ ವಿವರ ಕೇಳುತ್ತೇನೆ.`,

  addProductAskDetails: () =>
    `*ಹಂತ 2 / 3:* ಈಗ ಉತ್ಪನ್ನದ ಬಗ್ಗೆ ಹೇಳಿ.

ನೀವು *ಬರೆಯಬಹುದು* ಅಥವಾ *ವಾಯ್ಸ್ ನೋಟ್* ಕಳುಹಿಸಬಹುದು.

ದಯವಿಟ್ಟು ಒಳಗೊಂಡಿರಿ:
• ಉತ್ಪನ್ನದ ಹೆಸರು
• ಬೆಲೆ (₹)
• ಲಭ್ಯವಿರುವ ತುಂಡುಗಳು
• ವಸ್ತು (ಐಚ್ಛಿಕ)

ಉದಾಹರಣೆ: _ಕೈಯಾರೆ ಮಾಡಿದ ತೆಂಗಿನ ಚಿಪ್ಪಿನ ದೀಪ, ₹600, 2 ತುಂಡು_`,

  addProductCreating: () => `ನಿಮ್ಮ ಲಿಸ್ಟಿಂಗ್ ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇನೆ... ✨`,

  addProductMissingPrice: () =>
    `ಫೋಟೋ ಮತ್ತು ವಿವರ ಸಿಕ್ಕಿತು, ಆದರೆ *ಬೆಲೆ* ಸಿಗಲಿಲ್ಲ.

ದಯವಿಟ್ಟು ಬೆಲೆ ಕಳುಹಿಸಿ.

ಉದಾಹರಣೆ: ₹600`,

  addProductMissingQuantity: () =>
    `ಎಷ್ಟು ತುಂಡುಗಳು ಲಭ್ಯವಿವೆ?

ಉದಾಹರಣೆ: 2`,

  addProductMissingTitle: () =>
    `ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಹೆಸರೇನು?

ಉದಾಹರಣೆ: ತೆಂಗಿನ ಚಿಪ್ಪಿನ ದೀಪ`,

  addProductDraftPreview: ({ title, price, quantity, material, category, description, photos }) => {
    const lines = [
      `*ಹಂತ 3 / 3: ನಿಮ್ಮ ಲಿಸ್ಟಿಂಗ್ ಪರಿಶೀಲಿಸಿ*`,
      ``,
      `📦 *${title}*`,
      `💰 ₹${price}`,
      `📦 ${quantity} ತುಂಡು ಲಭ್ಯ`,
    ];
    if (category) lines.push(`🏷️ ${category}`);
    if (material) lines.push(`🧵 ${material}`);
    lines.push(`📸 ${photos} ಫೋಟೋ`);
    if (description) {
      lines.push("");
      lines.push(`_${description}_`);
    }
    lines.push(
      "",
      `ಉತ್ತರಿಸಿ:`,
      `1. *ದೃಢೀಕರಿಸಿ* — HastKalaನಲ್ಲಿ ಲೈವ್ ಮಾಡಿ`,
      `2. ಬೆಲೆ ಬದಲಿಸಿ`,
      `3. ಪ್ರಮಾಣ ಬದಲಿಸಿ`,
      `4. ಹೆಸರು ಬದಲಿಸಿ`,
      `5. ವಿವರ ಬದಲಿಸಿ`,
      `6. ರದ್ದುಗೊಳಿಸಿ`,
    );
    return lines.join("\n");
  },

  addProductSubmitted: (_approvalUrl?: string) => {
    return `✅ ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಕರಿಗರ್ ಸಖಿಯ ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.

ಅನುಮೋದನೆಯ ನಂತರ ಇದು HastKala Haat ನಲ್ಲಿ ಲೈವ್ ಆಗುತ್ತದೆ ಮತ್ತು ನಿಮಗೆ ಶೇರ್ ಮಾಡಲು ಲಿಂಕ್ ಸಿಗುತ್ತದೆ.

ನಾವು ಇಲ್ಲಿ ತಿಳಿಸುತ್ತೇವೆ.

ಮೆನುಗೆ ಮರಳಲು *MENU* ಬರೆಯಿರಿ.`;
  },

  addProductApproved: ({ title, publicUrl }) =>
    `🎉 ಒಳ್ಳೆಯ ಸುದ್ದಿ!

ನಿಮ್ಮ ಉತ್ಪನ್ನ *${title}* HastKalaನಲ್ಲಿ ಲೈವ್ ಆಗಿದೆ.${publicUrl ? `\n\nನೋಡಿ: ${publicUrl}` : ""}

ಗ್ರಾಹಕರು ಈಗ ಆರ್ಡರ್ ಮಾಡಬಹುದು.`,

  addProductCancelled: () =>
    `ಲಿಸ್ಟಿಂಗ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.

ಮೆನುಗೆ ಮರಳಲು *MENU* ಬರೆಯಿರಿ.`,

  addProductPriceUpdated: (price: number) => `ಬೆಲೆಯನ್ನು ₹${price} ಗೆ ಬದಲಿಸಲಾಗಿದೆ ✅`,
  addProductQuantityUpdated: (quantity: number) => `ಪ್ರಮಾಣವನ್ನು ${quantity} ಕ್ಕೆ ಬದಲಿಸಲಾಗಿದೆ ✅`,
  addProductTitleUpdated: (title: string) => `ಹೆಸರನ್ನು *${title}* ಗೆ ಬದಲಿಸಲಾಗಿದೆ ✅`,
  addProductDescriptionUpdated: () => `ವಿವರಣೆಯನ್ನು ಬದಲಿಸಲಾಗಿದೆ ✅`,

  addProductAskNewPrice: () =>
    `ಹೊಸ *ಬೆಲೆ* ಎಷ್ಟು? (ಸಂಖ್ಯೆ ಮಾತ್ರ)

ಉದಾಹರಣೆ: 700`,

  addProductAskNewQuantity: () =>
    `ಹೊಸ *ಪ್ರಮಾಣ* ಎಷ್ಟು?

ಉದಾಹರಣೆ: 3`,

  addProductAskNewTitle: () =>
    `ಹೊಸ *ಹೆಸರು* ಏನು?

ಉದಾಹರಣೆ: ಇಕೋ ತೆಂಗಿನ ದೀಪ`,

  addProductAskNewDescription: () => `ಹೊಸ *ವಿವರಣೆ* ಕಳುಹಿಸಿ (1-3 ವಾಕ್ಯ).`,

  // ----- My products -----

  myProductsHeader: () => `📦 *ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳು*`,

  myProductsEmpty: () =>
    `ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನವಿಲ್ಲ.

ಮೊದಲ ಉತ್ಪನ್ನ ಸೇರಿಸಲು *ADD* ಬರೆಯಿರಿ.`,

  myProductsList: (items) => {
    const lines = [`📦 *ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳು*`, ``];
    items.forEach((p, i) => {
      lines.push(`${i + 1}. *${p.title}*`);
      lines.push(`   ₹${p.price} · ಸ್ಟಾಕ್: ${p.quantity} · ${labelStatusKn(p.status)}`);
    });
    lines.push("");
    lines.push("_ಉತ್ಪನ್ನ ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._");
    return lines.join("\n");
  },

  myProductsManage: (title) =>
    `*${title}*

ಏನು ಮಾಡಬೇಕು?

1. ಬೆಲೆ ಬದಲಿಸಿ
2. ಸ್ಟಾಕ್ ಬದಲಿಸಿ
3. ಹೆಸರು ಬದಲಿಸಿ
4. ವಿವರಣೆ ಬದಲಿಸಿ
5. 🗑️ ಉತ್ಪನ್ನ ಅಳಿಸಿ
6. ಲಿಂಕ್ ನೋಡಿ
7. ಉತ್ಪನ್ನ ಪಟ್ಟಿಗೆ ಮರಳಿ

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  myProductsStockUpdated: (quantity) => `ಸ್ಟಾಕ್ ${quantity} ಕ್ಕೆ ಬದಲಿಸಲಾಗಿದೆ ✅`,

  myProductsSoldOut: (title) =>
    `*${title}* ಮಾರಾಟವಾಯಿತು ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ ✅
ಇನ್ನು ಗ್ರಾಹಕರಿಗೆ ತೋರಿಸುವುದಿಲ್ಲ.`,

  myProductsAskNewStock: () =>
    `ಈಗ ಎಷ್ಟು ತುಂಡುಗಳು ಲಭ್ಯವಿವೆ?

ಉದಾಹರಣೆ: 5`,

  // ----- Orders -----

  ordersHeader: () => `📋 *ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು*`,

  ordersEmpty: () =>
    `ಇನ್ನೂ ಆರ್ಡರ್ ಬಂದಿಲ್ಲ. ಗ್ರಾಹಕರು ಆರ್ಡರ್ ಮಾಡಿದಾಗ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.

*MENU* ಬರೆಯಿರಿ ಮರಳಲು.`,

  ordersList: (items) => {
    const lines = [`📋 *ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು*`, ``];
    items.forEach((o, i) => {
      lines.push(`${i + 1}. *${o.productTitle}* — ₹${o.amount}`);
      lines.push(
        `   ${o.id} · ${labelOrderStatusKn(o.status)}${o.buyerCity ? ` · ${o.buyerCity}` : ""}`,
      );
    });
    lines.push("");
    lines.push("_ಆರ್ಡರ್ ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._");
    return lines.join("\n");
  },

  orderDetail: ({ id, productTitle, quantity, amount, buyerCity, status }) =>
    `*ಆರ್ಡರ್ ${id}*

ಉತ್ಪನ್ನ: ${productTitle}
ಪ್ರಮಾಣ: ${quantity}
ಮೊತ್ತ: ₹${amount}
${buyerCity ? `ನಗರ: ${buyerCity}\n` : ""}ಸ್ಥಿತಿ: ${labelOrderStatusKn(status)}

ಉತ್ತರಿಸಿ:
1. ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಿ
2. ಲಭ್ಯವಿಲ್ಲ
3. ಸಹಾಯ ಬೇಕು

_ಅಥವಾ BACK ಬರೆಯಿರಿ._`,

  orderAccepted: () =>
    `ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ ✅

ದಯವಿಟ್ಟು ಉತ್ಪನ್ನವನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪ್ಯಾಕ್ ಮಾಡಿ. ಕಾರಿಗರ್ ಸಖಿ ಪಿಕಪ್‌ಗೆ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.`,

  orderUnavailable: () =>
    `ಆರ್ಡರ್ ಲಭ್ಯವಿಲ್ಲ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.

ಗ್ರಾಹಕರಿಗೆ ಸೂಚಿಸಲಾಗುತ್ತದೆ.`,

  // ----- Browse / search -----

  browseAskCategory: () =>
    `ಏನು ನೋಡಬೇಕು?

1. ಮನೆ ಅಲಂಕಾರ
2. ಬಟ್ಟೆ / ವಸ್ತ್ರ
3. ಆಭರಣ
4. ಆಹಾರ ಪದಾರ್ಥ
5. ಉಡುಗೊರೆ
6. ಎಲ್ಲ ಉತ್ಪನ್ನಗಳು

_ಸಂಖ್ಯೆಯನ್ನು ಕಳುಹಿಸಿ._`,

  browseResults: (items) => {
    if (items.length === 0) return `ಈ ವಿಭಾಗದಲ್ಲಿ ಇನ್ನೂ ಉತ್ಪನ್ನವಿಲ್ಲ.`;
    const lines = [`*ಇಲ್ಲಿ ಕೆಲವು ಉತ್ಪನ್ನಗಳು:*`, ``];
    items.forEach((p) => lines.push(`${p.index}. ${p.title} — ₹${p.price}`));
    lines.push("");
    lines.push(`_ವಿವರ ನೋಡಲು ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._`);
    return lines.join("\n");
  },

  browseEmpty: () =>
    `ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನವಿಲ್ಲ. ಶೀಘ್ರವೇ ಹೊಸ ಕುಶಲಕರ್ಮಿಗಳು ಸೇರುತ್ತಿದ್ದಾರೆ.

*BACK* ಬರೆಯಿರಿ ಮರಳಲು.`,

  browseProductDetail: ({ title, price, artisanName, district, quantity, publicUrl }) => {
    const lines = [`*${title}*`, `💰 ₹${price}`, `📦 ${quantity} ತುಂಡು ಸ್ಟಾಕ್‌ನಲ್ಲಿ`];
    if (artisanName) lines.push(`👩 *${artisanName}* ಮಾಡಿದ್ದು${district ? ` (${district})` : ""}`);
    if (publicUrl) lines.push("", `🔗 ${publicUrl}`);
    lines.push("");
    lines.push("ಉತ್ತರಿಸಿ:");
    lines.push("1. ಈಗ ಖರೀದಿಸಿ");
    lines.push("2. ನಂತರಕ್ಕೆ ಉಳಿಸಿ");
    lines.push("3. ಇಂಥವೇ ಇನ್ನಷ್ಟು");
    lines.push("4. ಹಿಂದೆ");
    return lines.join("\n");
  },

  trendingHeader: () => `🔥 *ಈ ವಾರ HastKalaನಲ್ಲಿ ಜನಪ್ರಿಯ*`,

  searchPrompt: () =>
    `ಏನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ ಹೇಳಿ.

ಬರೆಯಬಹುದು ಅಥವಾ ವಾಯ್ಸ್ ನೋಟ್ ಕಳುಹಿಸಬಹುದು.

ಉದಾಹರಣೆ: _"₹700 ಗಿಂತ ಕಡಿಮೆ ದೀಪ"_ ಅಥವಾ _"ಗೃಹಪ್ರವೇಶದ ಉಡುಗೊರೆಗಳು"_`,

  searchResults: (items) => {
    if (items.length === 0) return `ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ. ಬೇರೆ ಹುಡುಕಿ?`;
    const lines = [`*ನಿಮಗಾಗಿ ಇವು ಸಿಕ್ಕವು:*`, ``];
    items.forEach((p) => lines.push(`${p.index}. ${p.title} — ₹${p.price}`));
    lines.push("");
    lines.push(`_ನೋಡಲು ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._`);
    return lines.join("\n");
  },

  searchEmpty: (query) =>
    `_"${query}"_ ಗೆ ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ.

ಬೇರೆ ಹುಡುಕಿ ಅಥವಾ *BROWSE* ಬರೆಯಿರಿ.`,

  // ----- Buyer requests -----

  requestStart: () =>
    `🛒 *ಬಲ್ಕ್ ಅಥವಾ ಕಸ್ಟಮ್ ಆರ್ಡರ್ ವಿನಂತಿ*

ಏನು ಬೇಕು ಹೇಳಿ. ಬರೆಯಬಹುದು ಅಥವಾ ವಾಯ್ಸ್ ನೋಟ್ ಕಳುಹಿಸಬಹುದು.

ಉದಾಹರಣೆಗಳು:
• "ಸಮಾರಂಭಕ್ಕಾಗಿ 250 ಇಡ್ಲಿ ಪ್ಲೇಟ್"
• "ಮದುವೆಗೆ 50 ರಿಟರ್ನ್ ಗಿಫ್ಟ್"
• "100 ಜ್ಯೂಟ್ ಬ್ಯಾಗ್"`,

  requestAskDate: () =>
    `ಯಾವಾಗ ಬೇಕು?

ಉದಾಹರಣೆ: _25 ಡಿಸೆಂಬರ್_ ಅಥವಾ _ಮುಂದಿನ ಶನಿವಾರ_`,

  requestAskLocation: () =>
    `ಎಲ್ಲಿ ಡೆಲಿವರಿ ಬೇಕು?

ಉದಾಹರಣೆ: ಬೆಂಗಳೂರು`,

  requestAskBudget: () =>
    `ನಿಮ್ಮ *ಬಜೆಟ್* ಎಷ್ಟು?

ಉದಾಹರಣೆ: ₹3000 ರಿಂದ ₹4000`,

  requestPreview: ({ brief, quantity, deliveryDate, location, budgetMin, budgetMax, category }) => {
    const lines = [`📋 *ನಿಮ್ಮ ವಿನಂತಿ*`, ``];
    lines.push(`ಐಟಂ: ${brief}`);
    if (quantity) lines.push(`ಪ್ರಮಾಣ: ${quantity}`);
    if (deliveryDate) lines.push(`ಯಾವಾಗ ಬೇಕು: ${deliveryDate}`);
    if (location) lines.push(`ಸ್ಥಳ: ${location}`);
    if (budgetMin && budgetMax) lines.push(`ಬಜೆಟ್: ₹${budgetMin} – ₹${budgetMax}`);
    else if (budgetMin) lines.push(`ಬಜೆಟ್: ಸುಮಾರು ₹${budgetMin}`);
    if (category) lines.push(`ವಿಭಾಗ: ${category}`);
    lines.push("");
    lines.push("ಉತ್ತರಿಸಿ:");
    lines.push("1. ದೃಢೀಕರಿಸಿ ಮತ್ತು ಕಳುಹಿಸಿ");
    lines.push("2. ಬದಲಿಸಿ");
    lines.push("3. ರದ್ದುಗೊಳಿಸಿ");
    return lines.join("\n");
  },

  requestBroadcasted: (requestId: string) =>
    `✅ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಮೀಪದ ಪರಿಶೀಲಿತ ಮಾರಾಟಗಾರರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.

ಬೆಲೆ ಪತ್ರಗಳು ಇಲ್ಲಿಯೇ ಸಿಗುತ್ತವೆ — ಸಾಮಾನ್ಯವಾಗಿ 2-6 ಗಂಟೆಯಲ್ಲಿ.

ವಿನಂತಿ ID: *${requestId}*

*MENU* ಬರೆಯಿರಿ ಮರಳಲು.`,

  requestEmpty: () =>
    `ಇನ್ನೂ ಯಾವುದೇ ವಿನಂತಿ ಇಲ್ಲ.

*REQUEST* ಬರೆಯಿರಿ ಹೊಸದನ್ನು ರಚಿಸಲು.`,

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
    const lines = [`🔔 *ಸಮೀಪದ ಹೊಸ ಖರೀದಿದಾರ ವಿನಂತಿ*`, ``];
    lines.push(`ವಿನಂತಿ *${requestId}*`);
    lines.push(`ಐಟಂ: ${brief}`);
    if (deliveryDate) lines.push(`ಯಾವಾಗ: ${deliveryDate}`);
    if (location)
      lines.push(
        `ಸ್ಥಳ: ${location}${distanceKm !== undefined ? ` (ನಿಮ್ಮಿಂದ ${distanceKm} ಕಿಮೀ)` : ""}`,
      );
    if (budgetMin && budgetMax) lines.push(`ಬಜೆಟ್: ₹${budgetMin} – ₹${budgetMax}`);
    lines.push("");
    lines.push("ನೀವು ಮಾಡಬಹುದೇ?");
    lines.push("1. ಬೆಲೆ ಪತ್ರ ಕಳುಹಿಸಿ");
    lines.push("2. ಬೇಡ");
    lines.push("3. ಇನ್ನಷ್ಟು ಮಾಹಿತಿ");
    lines.push("");
    lines.push("_ಈ ಸೂಚನೆಗಳನ್ನು ನಿಲ್ಲಿಸಲು STOP REQUESTS ಬರೆಯಿರಿ._");
    return lines.join("\n");
  },

  quoteAskPrice: () =>
    `ಒಟ್ಟು *ಬೆಲೆ* ಎಷ್ಟು? (ಸಂಖ್ಯೆ ಮಾತ್ರ)

ಉದಾಹರಣೆ: 3500`,

  quoteAskDelivery: () =>
    `ಯಾವಾಗ ತಲುಪಿಸಬಲ್ಲಿರಿ?

ಉದಾಹರಣೆ: _ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ_, _ಶನಿವಾರ 8 ಗಂಟೆಯೊಳಗೆ_`,

  quoteAskNote: () =>
    `ಖರೀದಿದಾರರಿಗೆ ಯಾವುದೇ *ಟಿಪ್ಪಣಿ*? (ಐಚ್ಛಿಕ — SKIP ಬರೆಯಿರಿ)

ಉದಾಹರಣೆ: _ಕೈಯಿಂದ ಬಣ್ಣ, ಆಹಾರ-ಸುರಕ್ಷಿತ ಗ್ಲೇಜ್._`,

  quotePreview: ({ price, deliveryNote, quoteNote }) => {
    const lines = [`💼 *ನಿಮ್ಮ ಬೆಲೆ ಪತ್ರ*`, ``];
    lines.push(`ಬೆಲೆ: ₹${price}`);
    if (deliveryNote) lines.push(`ಡೆಲಿವರಿ: ${deliveryNote}`);
    if (quoteNote) lines.push(`ಟಿಪ್ಪಣಿ: ${quoteNote}`);
    lines.push("");
    lines.push("ಉತ್ತರಿಸಿ:");
    lines.push("1. ಕಳುಹಿಸಿ");
    lines.push("2. ಬದಲಿಸಿ");
    lines.push("3. ರದ್ದುಗೊಳಿಸಿ");
    return lines.join("\n");
  },

  quoteSubmitted: () =>
    `ಬೆಲೆ ಪತ್ರ ಕಳುಹಿಸಲಾಗಿದೆ ✅

ಖರೀದಿದಾರರು ಪರಿಶೀಲಿಸಿ ಉತ್ತರಿಸುತ್ತಾರೆ.`,

  quoteCancelled: () => `ಬೆಲೆ ಪತ್ರ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ.`,

  quoteAccepted: () =>
    `🎉 ನಿಮ್ಮ ಬೆಲೆ ಪತ್ರ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!

ಕಾರಿಗರ್ ಸಖಿ ಡೆಲಿವರಿಗಾಗಿ ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.

*MENU* ಬರೆಯಿರಿ ಮರಳಲು.`,

  // ----- Buyer view quotes -----

  quotesHeader: (brief: string, count: number) => `📨 *${count}* ಬೆಲೆ ಪತ್ರ ಸಿಕ್ಕಿದೆ: _${brief}_`,

  quotesList: (items) => {
    const lines: string[] = [];
    items.forEach((q) => {
      lines.push(`${q.index}. *${q.sellerName}* — ₹${q.price}`);
      if (q.deliveryNote) lines.push(`   ${q.deliveryNote}`);
    });
    lines.push("");
    lines.push("_ನೋಡಲು ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._");
    return lines.join("\n");
  },

  quoteDetail: ({ sellerName, price, deliveryNote, quoteNote }) => {
    const lines = [`*${sellerName} ಅವರ ಬೆಲೆ ಪತ್ರ*`, ``];
    lines.push(`ಬೆಲೆ: ₹${price}`);
    if (deliveryNote) lines.push(`ಡೆಲಿವರಿ: ${deliveryNote}`);
    if (quoteNote) lines.push(`ಟಿಪ್ಪಣಿ: ${quoteNote}`);
    lines.push("");
    lines.push("ಉತ್ತರಿಸಿ:");
    lines.push("1. ಸ್ವೀಕರಿಸಿ");
    lines.push("2. ತಿರಸ್ಕರಿಸಿ");
    lines.push("3. ಹಿಂದೆ");
    return lines.join("\n");
  },

  quoteRejected: () => `ಬೆಲೆ ಪತ್ರ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ. ಮಾರಾಟಗಾರರಿಗೆ ಸೂಚಿಸಲಾಗುತ್ತದೆ.`,

  // ----- Sakhi flows -----

  sakhiPendingHeader: () => `📋 *ಬಾಕಿ ಅನುಮೋದನೆಗಳು*`,

  sakhiPendingEmpty: () =>
    `ಸದ್ಯಕ್ಕೆ ಯಾವುದೇ ಉತ್ಪನ್ನ ಬಾಕಿ ಇಲ್ಲ. 👏

*MENU* ಬರೆಯಿರಿ ಮರಳಲು.`,

  sakhiPendingList: (items) => {
    const lines = [`📋 *ಬಾಕಿ ಅನುಮೋದನೆಗಳು*`, ``];
    items.forEach((p) => {
      lines.push(`${p.index}. *${p.title}*`);
      lines.push(`   ${p.artisanName} (${p.district})`);
    });
    lines.push("");
    lines.push("_ನೋಡಲು ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ ಅಥವಾ BACK ಬರೆಯಿರಿ._");
    return lines.join("\n");
  },

  sakhiPendingDetail: ({ title, description, price, quantity, artisanName, district }) =>
    [
      `*${title}*`,
      `₹${price} · ${quantity} ತುಂಡು`,
      `${artisanName} (${district}) ಅವರು ಸೇರಿಸಿದ್ದು`,
      ``,
      `_${description}_`,
      ``,
      `ಉತ್ತರಿಸಿ:`,
      `1. ಅನುಮೋದಿಸಿ`,
      `2. ತಿರಸ್ಕರಿಸಿ`,
      `3. ಹಿಂದೆ`,
    ].join("\n"),

  sakhiApproved: (title: string) =>
    `*${title}* ಅನುಮೋದಿಸಲಾಗಿದೆ ✅
ಕುಶಲಕರ್ಮಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ ಮತ್ತು ಉತ್ಪನ್ನ ಲೈವ್ ಆಗಿದೆ.`,

  sakhiRejected: (title: string) =>
    `*${title}* ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.
ಕುಶಲಕರ್ಮಿಗೆ ಸೂಚಿಸಲಾಗಿದೆ.`,

  // ----- Generic -----

  help: () =>
    `*HastKala ಕಮಾಂಡ್‌ಗಳು*

• *MENU* — ಮುಖ್ಯ ಮೆನು
• *BACK* — ಒಂದು ಹೆಜ್ಜೆ ಹಿಂದೆ
• *LANGUAGE* — ಭಾಷೆ ಬದಲಿಸಿ
• *PROFILE* — ಪ್ರೊಫೈಲ್ ನೋಡಿ
• *HELP* — ಈ ಪಟ್ಟಿ
• *HUMAN* — ಕಾರಿಗರ್ ಸಖಿ ಜೊತೆ ಮಾತಾಡಿ

ಸಂಖ್ಯೆ ಮತ್ತು ಆಯ್ಕೆಯ ಹೆಸರು ಎರಡೂ ಕೆಲಸ ಮಾಡುತ್ತವೆ.`,

  helpInState: () =>
    `ಕಷ್ಟ ಆಯ್ತಾ?

• *MENU* — ಮುಖ್ಯ ಮೆನುಗೆ ಹೋಗಿ
• *BACK* — ಒಂದು ಹೆಜ್ಜೆ ಹಿಂದೆ
• *HUMAN* — ಸಖಿ ಜೊತೆ ಮಾತಾಡಿ`,

  invalidChoice: () =>
    `ಅದು ಆಯ್ಕೆಯಲ್ಲ.

ತೋರಿಸಿದ ಸಂಖ್ಯೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಕಳುಹಿಸಿ ಅಥವಾ *MENU* ಬರೆಯಿರಿ.`,

  unparseable: () =>
    `ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ.

ಆಯ್ಕೆಗಳಿಗಾಗಿ *MENU*, ಕಮಾಂಡ್‌ಗಳಿಗಾಗಿ *HELP*, ಸಹಾಯಕ್ಕಾಗಿ *HUMAN* ಬರೆಯಿರಿ.`,

  goingBack: () => `↩️ ಹಿಂದೆ ಹೋಗುತ್ತಿದ್ದೇನೆ...`,

  cantGoBack: () => `ನೀವು ಪ್ರಾರಂಭದಲ್ಲಿದ್ದೀರಿ. ಮುಖ್ಯ ಮೆನುಗಾಗಿ *MENU* ಬರೆಯಿರಿ.`,

  errorBackend: () =>
    `HastKala ಸರ್ವರ್ ಈಗ ಬಿಡುವಿಲ್ಲ.

ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.`,

  errorGeneric: () => `ಏನೋ ತಪ್ಪಾಯಿತು. *MENU* ಬರೆಯಿರಿ ಅಥವಾ *HUMAN* ಸಂಪರ್ಕಿಸಿ.`,

  consentLine: () =>
    `_ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ ಖಾಸಗಿಯಾಗಿ ಉಳಿಯುತ್ತದೆ. ನಿಮ್ಮ ಹೆಸರು, ಜಿಲ್ಲೆ ಮತ್ತು ಉತ್ಪನ್ನ ವಿವರ ಸಾರ್ವಜನಿಕವಾಗಿ ಕಾಣಿಸಬಹುದು. ರದ್ದುಗೊಳಿಸಲು STOP ಬರೆಯಿರಿ._`,

  resetConfirmed: () =>
    `ಸೆಷನ್ ಸ್ಪಷ್ಟಗೊಳಿಸಲಾಗಿದೆ ✅
ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಲು *HI* ಬರೆಯಿರಿ.`,

  humanEscalated: () =>
    `🤝 ಕಾರಿಗರ್ ಸಖಿ ಶೀಘ್ರವೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.
ಇಲ್ಲಿಯೇ WhatsAppನಲ್ಲಿ ಮಾತುಕತೆ ಮುಂದುವರಿಸಬಹುದು.`,

  notImplemented: () =>
    `ಈ ಸೌಲಭ್ಯ ಶೀಘ್ರವೇ ಬರಲಿದೆ ✨
*MENU* ಬರೆಯಿರಿ ಮರಳಲು.`,

  exitGoodbye: (name?: string) =>
    `👋 ${name ? `ವಿದಾಯ, ${name}!` : "ವಿದಾಯ!"}
ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಿದೆ.

ಮತ್ತೆ ಬರಲು ಯಾವಾಗ ಬೇಕಾದರೂ *HI* ಬರೆಯಿರಿ. ನಾವು ಇಲ್ಲಿಯೇ ಇದ್ದೇವೆ. 🌸`,

  exitWelcomeBack: (name?: string) =>
    `🌸 ${name ? `ಮತ್ತೆ ಸ್ವಾಗತ, ${name}!` : "ಮತ್ತೆ ಸ್ವಾಗತ!"}
ನಾವು ಎಲ್ಲಿ ನಿಲ್ಲಿಸಿದೆವೋ ಅಲ್ಲಿಂದ ಮುಂದುವರಿಯೋಣ.`,

  alreadySubmitted: () =>
    `ನಿಮ್ಮ ಕಳೆದ ಕಾರ್ಯ ಈಗಾಗಲೇ ಸಲ್ಲಿಸಲಾಗಿದೆ.
*MENU* ಬರೆಯಿರಿ ಬೇರೆ ಏನನ್ನಾದರೂ ಮಾಡಲು.`,

  englishHelper: (text: string) => `_${text}_`,

  draftCreated: (p: ProductDraftResponse) => {
    const link = p.approvalUrl ? `\n\n_ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ನೋಡಿ:_ ${p.approvalUrl}` : "";
    return `ನಿಮ್ಮ ಉತ್ಪನ್ನ HastKalaನಲ್ಲಿ ಲೈವ್ ಆಗಿದೆ 🎉

📦 ${p.title}
💰 ₹${p.price}
📦 ${p.quantity} ಲಭ್ಯ${link}

*MENU* ಬರೆಯಿರಿ ಮರಳಲು.`;
  },

  orderAlert: ({ productTitle, quantity, amount, buyerCity, buyerName, orderId }) => {
    const lines = [`🎉 *ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ!*`, ``];
    lines.push(`ಉತ್ಪನ್ನ: ${productTitle}`);
    lines.push(`ಪ್ರಮಾಣ: ${quantity}`);
    lines.push(`ಮೊತ್ತ: ₹${amount}`);
    if (buyerName) lines.push(`ಖರೀದಿದಾರ: ${buyerName}`);
    if (buyerCity) lines.push(`ನಗರ: ${buyerCity}`);
    if (orderId) lines.push(`ಆರ್ಡರ್ ID: ${orderId}`);
    lines.push("");
    lines.push("ಉತ್ಪನ್ನವನ್ನು ಪ್ಯಾಕ್ ಮಾಡಿ. ಕಾರಿಗರ್ ಸಖಿ ಪಿಕಪ್‌ಗೆ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ.");
    lines.push("ಆರ್ಡರ್ ನೋಡಲು *ORDERS* ಬರೆಯಿರಿ.");
    return lines.join("\n");
  },
};

function labelStatusKn(status: string): string {
  switch (status) {
    case "approved":
      return "✅ ಲೈವ್";
    case "pending_approval":
      return "⏳ ಅನುಮೋದನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ";
    case "rejected":
      return "❌ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ";
    case "sold_out":
      return "🚫 ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ";
    case "draft":
      return "📝 ಡ್ರಾಫ್ಟ್";
    default:
      return status;
  }
}

function labelOrderStatusKn(status: string): string {
  switch (status) {
    case "new":
      return "🆕 ಹೊಸದು";
    case "confirmed":
      return "✅ ದೃಢೀಕರಿಸಲಾಗಿದೆ";
    case "packed":
      return "📦 ಪ್ಯಾಕ್";
    case "picked_up":
      return "🚚 ಪಿಕಪ್";
    case "delivered":
      return "📬 ತಲುಪಿಸಲಾಗಿದೆ";
    case "paid":
      return "💰 ಪಾವತಿಸಲಾಗಿದೆ";
    case "cancelled":
      return "❌ ರದ್ದು";
    default:
      return status;
  }
}
