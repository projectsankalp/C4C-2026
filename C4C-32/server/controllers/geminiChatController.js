/**
 * POST /api/gemini/chat
 * Body: { transcript: string, page?: string, language?: string }
 * Returns: { reply: string, source: 'gemini'|'fallback' }
 *
 * Uses the Gemini API with a rich system prompt containing full website context
 * so the bot gives answers grounded in actual KariGhar features.
 */

const KARIGHAR_CONTEXT = `
You are the KariGhar Assistant — a friendly, knowledgeable chatbot embedded in the KariGhar e-commerce website.
KariGhar is an Indian fair-trade artisan marketplace that connects rural artisans directly with customers, eliminating middlemen.

=== WEBSITE PAGES & FEATURES ===

HOME PAGE (/):
- Hero banner showcasing featured artisan collections
- "Our Story" section about KariGhar's mission to preserve Indian handicrafts
- Featured product carousel with handmade items
- Artisan spotlight stories (Parvati Devi — Ajrakh embroidery from Kutch, Meera Devi — terracotta pottery from Bhuj)
- Categories: Pottery & Ceramics, Hand-loom Textiles, Metalwork (Dhokra), Wooden Carvings

COLLECTIONS PAGE (/collections):
- Full product catalog with filters by craft type, price range, and region
- Craft types: Pottery & Ceramics, Hand-loom Textiles, Metalwork (Dhokra), Wooden Carvings
- Each product card shows: name, artisan name, price in INR (₹), craft type badge, and "Add to Cart" button
- Search bar for finding specific crafts

WORKSHOPS PAGE (/workshops):
- Information about artisan workshops and craft learning experiences

ARTISANS PAGE (/artisans):
- Profiles of master artisans with their stories, craft specialties, and regions
- Direct connection to artisan products

PRODUCT DETAIL PAGE (/product/:id):
- Full product details: images, description, artisan story, materials used
- Price with fair-trade breakdown
- "Add to Cart" button
- WhatsApp click-to-chat link to contact the artisan directly

SELLER DASHBOARD (/seller):
- For registered artisans/sellers only
- Upload new handcraft creations with images and voice descriptions
- Fair-Trade Pricing Calculator: factors in raw materials + ₹150/hour labor + packaging + platform fee
- WhatsApp Chat Link Generator: creates pre-formatted chat links for buyer-seller communication
- Voice recorder for audio product descriptions (helps low-literacy artisans)
- Order management and tracking

CART & CHECKOUT:
- Slide-out cart drawer accessible from the navbar cart icon
- Shows items, quantities, subtotal
- "Place Order" button for checkout

AUTH (Login/Signup):
- Phone number + OTP verification (mock OTP code: 1234)
- Role selection: Customer or Seller (Artisan)
- Profile photo upload
- Toggle between login and signup

HELP PAGE (/help):
- Support hub with FAQs and tutorials
- Available in Hindi and English

=== SHIPPING & PACKAGING ===
- 100% organic biodegradable honeycomb cardboard for fragile items
- Dried husk cushioning for pottery and ceramics
- Fully tracked global shipping

=== KEY VALUES ===
- Direct fair-trade: artisans get fair living wages (₹150/hour minimum)
- No middlemen — customers buy directly from artisans
- Preserving traditional Indian handicraft heritage
- Sustainable and eco-friendly packaging
- Multilingual support (English and Hindi)

=== RESPONSE RULES ===
1. Always answer based on the website context above. Do NOT make up features that don't exist.
2. Keep replies concise (2-3 sentences max unless the user asks for details).
3. Be warm, friendly, and use occasional Indian greetings (Namaste, etc.).
4. If the user asks about something not on the website, politely say you can help with KariGhar-related questions.
5. If asked in Hindi, respond in Hindi.
6. Use ₹ for prices, not $.
7. Guide users to specific pages when relevant (e.g., "Visit our Collections page to browse crafts").
`;

const asyncHandler = require('../utils/asyncHandler');

const chatWithGemini = asyncHandler(async (req, res, next) => {
  const { transcript, page, language } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    res.status(400);
    return next(new Error('transcript is required'));
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    res.status(500);
    return next(new Error('Gemini API key not configured'));
  }

  const pageHint = page ? `\nThe user is currently on page: ${page}` : '';
  const langHint = language ? `\nUser's selected language: ${language}` : '';

  const fullPrompt = `${KARIGHAR_CONTEXT}${pageHint}${langHint}\n\nUser message: "${transcript}"`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Gemini] API error:', errText);
      throw new Error(`Gemini API ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    if (!cleaned) throw new Error('Empty Gemini response');

    res.json({ reply: cleaned, source: 'gemini' });
  } catch (err) {
    console.error('[Gemini] Falling back:', err.message);

    // Intelligent fallback using keyword matching
    const query = transcript.toLowerCase();
    let fallback = "Namaste! I'm having trouble connecting right now. You can explore our Collections page for handmade crafts, or visit the Help page for FAQs. I'll be back shortly! 🙏";

    if (query.includes('price') || query.includes('cost') || query.includes('fair')) {
      fallback = "KariGhar ensures fair-trade pricing! Artisans earn at least ₹150/hour. Visit the Seller Dashboard to see our pricing calculator that factors in materials, labor, and packaging.";
    } else if (query.includes('ship') || query.includes('deliver') || query.includes('package')) {
      fallback = "We use 100% organic biodegradable honeycomb cardboard for fragile items like pottery. All orders come with full tracking. 📦";
    } else if (query.includes('login') || query.includes('sign') || query.includes('otp')) {
      fallback = "To sign in, enter your phone number and use OTP code 1234 for verification. You can register as a Customer or Seller (Artisan). 🔐";
    } else if (query.includes('cart') || query.includes('order') || query.includes('buy')) {
      fallback = "Simply click 'Add to Cart' on any product, then open the cart drawer from the top-right icon. Click 'Place Order' to complete your purchase! 🛒";
    } else if (query.includes('artisan') || query.includes('seller') || query.includes('craft')) {
      fallback = "Our artisans include master weavers and potters from across India. Visit the Artisans page to read their stories, or check Collections to browse their creations! 🎨";
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('namaste')) {
      fallback = "Namaste! 🙏 Welcome to KariGhar! I can help you browse handcrafted collections, learn about our artisans, understand our fair-trade model, or navigate the website. What would you like to know?";
    }

    res.json({ reply: fallback, source: 'fallback', error: err.message });
  }
});

module.exports = { chatWithGemini };
