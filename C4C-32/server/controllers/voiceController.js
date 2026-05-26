/**
 * POST /api/voice/parse
 * Body: { transcript: string }
 * Pure local NLP — no external API needed.
 * Returns: { route: string | null, label: string }
 *
 * Strategy: weighted intent scoring across all route categories.
 * Each spoken word votes for routes via signal maps. Highest score wins.
 */

const INTENT_MAP = [
  {
    route: '/',
    label: 'Home',
    signals: [
      'home', 'homepage', 'main', 'start', 'ghar', 'shuru', 'wapas',
      'back', 'mukhya', 'beginning', 'landing', 'index', 'go back',
    ],
  },
  {
    route: '/collections',
    label: 'Shop',
    signals: [
      'shop', 'shopping', 'products', 'catalog', 'browse', 'buy',
      'purchase', 'store', 'kharido', 'dukan', 'items', 'goods',
      'market', 'bazaar', 'bazar', 'collection', 'explore',
    ],
  },
  {
    route: '/categories',
    label: 'Categories',
    signals: [
      'categories', 'category', 'collections', 'types', 'kinds',
      'filter', 'craft', 'pottery', 'textile', 'jewelry', 'jewellery',
      'wood', 'metal', 'handloom', 'silk', 'saree',
    ],
  },
  {
    route: '/seller',
    label: 'Seller Dashboard',
    signals: [
      'seller', 'sell', 'selling', 'artisan', 'dashboard', 'upload',
      'product', 'add', 'list', 'listing', 'becho', 'dukan', 'shop',
      'my shop', 'my store', 'workshop', 'create',
    ],
  },
  {
    route: '/profile',
    label: 'My Profile',
    signals: [
      'profile', 'account', 'my account', 'settings', 'me', 'user',
      'personal', 'mera', 'khata', 'details', 'info', 'information',
    ],
  },
  {
    route: '/login',
    label: 'Login',
    signals: [
      'login', 'log in', 'sign in', 'signin', 'enter', 'access',
      'password', 'credentials', 'masukna', 'andar', 'auth',
    ],
  },
  {
    route: '/login?signup=true',
    label: 'Sign Up',
    signals: [
      'signup', 'sign up', 'register', 'registration', 'create account',
      'new account', 'join', 'nayi', 'naya', 'banana', 'create',
    ],
  },
  {
    route: '/artisans',
    label: 'Artisans Community',
    signals: [
      'artisans', 'community', 'rooms', 'forum', 'voice room', 'chat',
      'discuss', 'cooperative', 'circle', 'baat', 'samuday', 'group',
    ],
  },
  {
    route: '/help',
    label: 'Help & Support',
    signals: [
      'help', 'support', 'contact', 'assist', 'problem', 'issue',
      'madad', 'sahayata', 'query', 'question', 'faq', 'guide',
    ],
  },
  {
    route: 'OPEN_CART',
    label: 'Cart',
    signals: [
      'cart', 'basket', 'bag', 'shopping cart', 'shopping bag',
      'thela', 'kharidar', 'checkout', 'order', 'items', 'trolley',
    ],
  },
];

/**
 * Score a transcript against all intent signal lists.
 * Returns the route with the highest cumulative signal score.
 */
const matchIntent = (transcript) => {
  const words = transcript.toLowerCase().split(/\s+/);
  const scores = INTENT_MAP.map((intent) => {
    let score = 0;
    for (const signal of intent.signals) {
      // Full phrase match — high weight
      if (transcript.toLowerCase().includes(signal)) score += 3;
      // Individual word match — low weight
      for (const word of words) {
        if (signal === word) score += 2;
        else if (signal.startsWith(word) && word.length >= 3) score += 1;
      }
    }
    return { ...intent, score };
  });

  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.score > 0 ? { route: best.route, label: best.label } : { route: null, label: transcript };
};

const parseVoiceCommand = (req, res, next) => {
  const { transcript } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    res.status(400);
    return next(new Error('transcript is required'));
  }

  const result = matchIntent(transcript.trim());
  res.json(result);
};

module.exports = { parseVoiceCommand };
