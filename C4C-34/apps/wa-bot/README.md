# HastKala BolKeBecho — WhatsApp Bot

> _Speak. Send a photo. List on the marketplace._

The artisan-facing layer of HastKala. A WhatsApp bot that takes a rural woman artisan from "hi" to a verified product listing without leaving her chat app.

## What it does, end to end

```
First contact (any number)
   └─ bilingual greeting → language pick → role pick → tutorial
        └─ role-specific onboarding (1 question per turn)
             └─ Seller / Buyer / Sakhi main menu
                  ├─ Seller: Add Product · My Products · Orders · Buyer Requests · Earnings
                  ├─ Buyer:  Browse · Trending · Categories · Search · Request Bulk Order
                  └─ Sakhi:  Pending Products · New Sellers · Orders · Requests · Earnings

Returning user (same phone)
   └─ skip everything → personalized welcome → main menu
```

Phone number is the identity. Onboarding never repeats.

## Three transports, one engine

The conversation logic in [`src/conversations/engine.ts`](src/conversations/engine.ts) is **transport-agnostic**. Three sources drive it:

1. **Real WhatsApp** via [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
2. **Browser simulator** at `http://localhost:5001/simulator/` — fallback if WhatsApp Web breaks during the demo.
3. **Test scripts** at `scripts/test-flow.ts` for headless verification.

Same engine, same replies, same backend calls. Demo path is identical regardless of transport.

## Languages

| Code | Language           | Status                                  |
| ---- | ------------------ | --------------------------------------- |
| `en` | English            | Complete                                |
| `hi` | Hindi (हिन्दी)     | Complete                                |
| `kn` | Kannada (ಕನ್ನಡ)    | Complete                                |
| `ta` | Tamil (தமிழ்)      | Falls back to English (TODO: translate) |
| `ml` | Malayalam (മലയാളം) | Falls back to English (TODO: translate) |

Switch language anytime by typing `LANGUAGE` / `भाषा` / `ಭಾಷೆ`.

## Universal commands (work in any state, any language)

| Command                      | Effect                                  |
| ---------------------------- | --------------------------------------- |
| `MENU` / `मेनू` / `ಮೆನು`     | Return to main menu                     |
| `BACK` / `पीछे` / `ಹಿಂದೆ`    | Pop one state off the stack             |
| `LANGUAGE` / `भाषा` / `ಭಾಷೆ` | Re-pick language                        |
| `HELP` / `मदद` / `ಸಹಾಯ`      | Show command list                       |
| `PROFILE`                    | View saved profile                      |
| `HUMAN`                      | Escalate to a Karigar Sakhi             |
| `RESET`                      | Full session reset                      |
| `STATUS`                     | Debug session state (handy on demo day) |

## The flagship feature: Buyer Requests + Seller Quotes

```
Buyer  ─▶ "I need 250 idli plates by next Saturday in Mangalore, ~₹3-4k"
            ↓
       category auto-classified, broadcast to matched verified sellers
            ↓
Seller ─▶ receives a structured prompt, replies with QUOTE → price → delivery → note
            ↓
Buyer  ─▶ sees a list of quotes, picks one, accepts
            ↓
       backend creates the order, both parties get WhatsApp confirmations
```

Matching is intentional, not magical:

- Seller's `craftCategory` matches the request's category
- Seller's `district` overlaps with `location`
- Seller `isVerified=true` and `requestAlertsEnabled=true`
- Daily alert cap to prevent notification fatigue
- `STOP REQUESTS` opts a seller out anytime

## Hallucination-free product creation

The old "one-shot AI generation" (everything in one prompt) caused the bot to invent prices, materials, and care instructions the artisan never said. Fixed with a 2-step contract:

1. **Extract** the artisan's facts (`extractService.ts`). If a field is missing, the AI returns `null` — no defaults, no guesses.
2. **Slot-fill** any missing fields by asking the artisan one short question at a time.
3. **Confirm** the draft with the artisan (CONFIRM / EDIT PRICE / EDIT QTY / EDIT TITLE / EDIT DESC / CANCEL).
4. **Polish** the description, tags, and care instructions in a second AI call grounded only on confirmed slots.

Artisan-stated facts are sacrosanct. AI only writes the prose.

## Quick start

```bash
cd apps/wa-bot
npm install

# 1. Configure (your phone digits + optional OpenAI key for Whisper)
npm run setup -- --phone 919876543210
# OR with Whisper:
npm run setup -- --phone 919876543210 --openai sk-your-key-here

# 2. In one terminal: backend (or our mock if Person 4's API isn't up)
npm run dev:mock-backend
# OR start the full backend in apps/api:
#   cd ../api && npm run dev

# 3. In another terminal: the bot
npm run dev

# 4. Scan the QR code with the demo WhatsApp number
# 5. Send "hi" from your demo phone
```

## Scripts

| Script                     | What it does                                   |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Boot WhatsApp + internal HTTP server           |
| `npm run dev:supervised`   | Run under crash-loop supervisor                |
| `npm run dev:simulator`    | Browser-only simulator on :5002                |
| `npm run dev:mock-backend` | Stand-in backend on :4000                      |
| `npm run setup`            | Configure phone allowlist + OpenAI key         |
| `npm run test:unit`        | 37 unit tests (Node's built-in runner)         |
| `npm run test:flow`        | Drive the engine headlessly through full flows |
| `npm run typecheck`        | Strict TypeScript check                        |
| `npm run build`            | Compile to `dist/`                             |

## Architecture

```
src/
├── config.ts                          # all env access
├── types.ts                           # shared types (UserSession, ExtractedFacts, ...)
├── index.ts                           # main entry (bot + internal HTTP server)
│
├── conversations/
│   ├── engine.ts                      # 🧠 transport-agnostic dispatcher
│   ├── state.ts                       # in-memory session map (stale after 12h)
│   │
│   ├── messages/                      # per-language copy registry
│   │   ├── types.ts                   # MessageRegistry interface
│   │   ├── en.ts · hi.ts · kn.ts      # complete translations
│   │   └── index.ts                   # router + LANGUAGE_META
│   │
│   └── flows/                         # state-handler modules
│       ├── identity.ts                # greeting → language → role → tutorial
│       ├── onboarding.ts              # seller / buyer / sakhi onboarding
│       ├── sellerMenu.ts              # seller main + MORE menus
│       ├── addProduct.ts              # photos → details → confirm
│       ├── myProducts.ts              # list + edit price/stock
│       ├── sellerOrders.ts            # accept / cancel orders
│       ├── buyerMenu.ts               # buyer main + MORE menus
│       ├── browse.ts                  # browse / search / trending
│       ├── request.ts                 # buyer creates a bulk request
│       ├── quote.ts                   # seller quotes + buyer reviews quotes
│       ├── sakhi.ts                   # pending product approvals
│       └── transcribe.ts              # voice-note bridge
│
├── openwa/
│   ├── createClient.ts                # whatsapp-web.js client + reliability
│   ├── handlers.ts                    # WA → engine adapter (LID resolution)
│   ├── media.ts                       # image/audio download + upload
│   └── sharedClient.ts                # late-bound client accessor
│
├── server/
│   └── internalServer.ts              # /health · /send-message · /simulator/*
│
├── services/
│   ├── apiClient.ts                   # axios wrapper for backend
│   ├── userService.ts                 # GET/PATCH /api/users/by-phone/:phone
│   ├── productService.ts              # POST /api/products/draft (with prefilled)
│   ├── extractService.ts              # 🆕 AI extract-only (no fabrication)
│   ├── transcribeService.ts           # Whisper / gpt-4o-transcribe
│   ├── listingService.ts              # GET /api/products + sellers/:id/products
│   ├── orderService.ts                # GET/PATCH vendor/orders
│   ├── requestService.ts              # buyer requests + quotes
│   ├── sakhiService.ts                # pending products + approve/reject
│   ├── uploadService.ts               # 🆕 real image upload (no placeholder)
│   ├── inboundService.ts              # audit log
│   └── artisanService.ts              # find-or-create artisan (legacy)
│
├── simulator/                         # standalone browser fallback (port 5002)
└── mock-backend/                      # tiny Express stub for Person 4
```

## Conversation state machine

Every state is a node in `ConversationState` (see [types.ts](src/types.ts)). The dispatcher in `engine.ts` is one switch statement. BACK pops a stack, capped at 10 entries.

Three onboarding paths, three main menus, plus the listing and request flows:

```
GREETING → AWAITING_LANGUAGE → AWAITING_ROLE → TUTORIAL
                                                  ↓
            ┌─────────────────────────────────────┼─────────────────────────────────────┐
            ▼                                     ▼                                     ▼
   SELLER_ONBOARD_*                      BUYER_ONBOARD_*                       SAKHI_ONBOARD_*
       (5 questions)                      (3 questions)                         (3 questions)
            ↓                                     ↓                                     ↓
       SELLER_MENU                            BUYER_MENU                            SAKHI_MENU
            ├─ ADD_PRODUCT_*                       ├─ BROWSE_*                          ├─ SAKHI_PENDING_*
            ├─ MY_PRODUCTS_*                       ├─ SEARCH_*                          ├─ (more)
            ├─ ORDERS_*                            ├─ REQUEST_*
            └─ QUOTE_*                             └─ QUOTE_BROWSE
```

## API contracts

### Bot → backend (we call)

```http
POST   /api/products/draft            # send confirmed slots, get pending_approval product
GET    /api/users/by-phone/:phone     # session resumption
PATCH  /api/users/by-phone/:phone     # save profile (language/role/onboarding)
GET    /api/products?category=...     # browse/search
GET    /api/sellers/:id/products      # "My Products" list
PATCH  /api/products/:id/stock        # quick stock update
PATCH  /api/products/:id              # full product edit
GET    /api/vendor/orders             # seller orders list
PATCH  /api/vendor/orders/:id/status  # accept / cancel
GET    /api/vendor/products/pending   # Sakhi: pending approvals
PATCH  /api/vendor/products/:id/approve
PATCH  /api/vendor/products/:id/reject
POST   /api/requests                  # buyer creates a request
GET    /api/requests?buyerPhone=...   # buyer's own requests
GET    /api/requests?matchSellerPhone=...  # seller's matched requests
POST   /api/requests/:id/quotes       # seller submits quote
GET    /api/requests/:id/quotes       # buyer sees all quotes
POST   /api/quotes/:id/accept
POST   /api/quotes/:id/reject
POST   /api/whatsapp/upload-image     # multipart image → Cloudinary URL
POST   /api/whatsapp/inbound          # best-effort audit log
```

### Backend → bot (backend calls us)

```http
POST http://localhost:5001/send-message
Content-Type: application/json
x-bot-secret: wa-demo-secret

{ "to": "919876543210", "message": "Your order is on the way." }
```

Used for order alerts, approval pings, request broadcasts, quote-accepted notifications.

## Three layers of fallback

| Backend layer                 | When it kicks in                                        |
| ----------------------------- | ------------------------------------------------------- |
| Real backend at `BACKEND_URL` | Default (Person 4 backend on `:5000`)                   |
| Mock backend on `:4000`       | When Person 4 backend isn't ready                       |
| `USE_MOCK_DRAFT=true`         | When no backend at all — bot synthesizes drafts locally |

| Transport layer                         | When it kicks in                |
| --------------------------------------- | ------------------------------- |
| Real WhatsApp                           | Default                         |
| Browser simulator at `:5001/simulator/` | When the QR session breaks live |
| `npm run test:flow`                     | Headless engine verification    |

## Safety & ethics

- Use a **spare WhatsApp number** as the bot. Never your personal one.
- `DEMO_MODE=true` + `ALLOWED_TEST_NUMBERS` — bot ignores anyone not on the list.
- No group reads, no broadcasts, no scraping.
- Phone numbers masked in logs.
- Buyer requests broadcast only to matched verified sellers, with daily caps and STOP REQUESTS opt-out.
- For production: WhatsApp Business Cloud API with opt-in. whatsapp-web.js is **demo-only**.

## What to say to a judge

> "For the hackathon we used a controlled WhatsApp Web automation bridge with test numbers only. Production architecture uses the official WhatsApp Business Cloud API with opt-in consent and approved templates. The core innovation is the workflow: a rural woman artisan goes from a WhatsApp message to a verified marketplace listing in under three minutes — in her own language."

## See also

- `RUNBOOK.md` — minute-by-minute demo day procedure
