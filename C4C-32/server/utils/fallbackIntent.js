// server/utils/fallbackIntent.js
/**
 * Simple deterministic intent matcher used as a fallback when Gemini is unavailable.
 * The INTENT_MAP mirrors the one used in the original VoiceNav controller.
 */

const INTENT_MAP = [
  { route: '/', label: 'Home', signals: ['home', 'main', 'start', 'ghar', 'welcome'] },
  { route: '/collections', label: 'Shop', signals: ['shop', 'products', 'catalog', 'browse', 'buy', 'kharido'] },
  { route: '/categories', label: 'Categories', signals: ['categories', 'category', 'types', 'craft', 'pottery'] },
  { route: '/seller', label: 'Seller Dashboard', signals: ['seller', 'artisan', 'dashboard', 'upload', 'list'] },
  { route: '/profile', label: 'My Profile', signals: ['profile', 'account', 'settings', 'me'] },
  { route: '/login', label: 'Login', signals: ['login', 'sign in', 'enter'] },
  { route: '/login?signup=true', label: 'Sign Up', signals: ['signup', 'register', 'create account'] },
  { route: '/artisans', label: 'Artisans Community', signals: ['artisans', 'community', 'forum'] },
  { route: '/help', label: 'Help & Support', signals: ['help', 'support', 'contact'] },
  { route: 'OPEN_CART', label: 'Cart', signals: ['cart', 'basket', 'bag', 'checkout'] },
];

/**
 * Return the best‑matching intent for a transcript.
 */
function matchIntent(transcript) {
  const lower = transcript.toLowerCase();
  const words = lower.split(/\s+/);
  let best = { route: null, label: transcript, score: 0 };
  for (const intent of INTENT_MAP) {
    let score = 0;
    for (const signal of intent.signals) {
      if (lower.includes(signal)) score += 3; // phrase present
      for (const w of words) {
        if (signal === w) score += 2;
        else if (signal.startsWith(w) && w.length >= 3) score += 1;
      }
    }
    if (score > best.score) {
      best = { route: intent.route, label: intent.label, score };
    }
  }
  return { route: best.route, label: best.label };
}

module.exports = { matchIntent };
