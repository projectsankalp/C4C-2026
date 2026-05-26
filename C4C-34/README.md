<div align="center">

<img src="Logo/hastkala-banner.svg" alt="HastKala — from a voice note to a livelihood" width="100%" />

[![Live](https://img.shields.io/badge/live-cyberkunju.com-6B2E1F?style=flat-square)](https://cyberkunju.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp%20bot-%2B91%2090379%2078905-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/919037978905)
[![Languages](https://img.shields.io/badge/languages-5%20Indian-D9902F?style=flat-square)](#languages)
[![License](https://img.shields.io/badge/license-MIT-2E7D32?style=flat-square)](#license)

**Try it now** — send `hi` on WhatsApp to **[+91 90379 78905](https://wa.me/919037978905)**.

</div>

---

## Why this exists

Hundreds of initiatives are trying to bring women artisans online. Almost all of them ask her to learn something first — an app, a dashboard, a checkout flow, English. The ones that don't, leave her offline and invisible.

HastKala asks her to learn nothing. The whole journey — discovery, training, certification, listing, orders, payments, support — happens inside one app she already trusts: **WhatsApp**.

> _We are not asking women artisans to become digital sellers._  
> _We are making digital selling adapt to them._

---

## How it works

Three women, three different starting points. One platform that meets each of them where they are.

```
                                                                
                ┌──────────────────────────────────────┐        
                │         The Hesitant Artisan         │        
                │                                      │        
                │   joins via her community,           │        
                │   takes a 7-day workshop,            │        
                │   becomes a certified seller.        │        
                └──────────────────┬───────────────────┘        
                                   │                            
                                   ▼                            
                ┌──────────────────────────────────────┐        
                │        The Confident Artisan         │        
                │                                      │        
                │   sends a photo + voice note,        │        
                │   bot drafts the listing,            │        
                │   product goes live, orders flow.    │        
                └──────────────────┬───────────────────┘        
                                   │                            
                                   ▼                            
                ┌──────────────────────────────────────┐        
                │       The Entrepreneur Artisan       │        
                │                                      │        
                │   web dashboard for inventory,       │        
                │   network, bulk requests, payments   │        
                │   — full control, on her terms.      │        
                └──────────────────────────────────────┘        
```

She never has to leave WhatsApp until she chooses to.

---

## What's inside

### For the artisan (WhatsApp bot — `apps/wa-bot`)

- 5 languages: English, Hindi, Kannada, Tamil, Malayalam
- Voice-first input — she speaks; the bot listens, transcribes, confirms
- 7-day learning track inside WhatsApp → certificate as a real PDF
- Listing flow: photo + voice note → AI-cleaned catalog entry, pre-filled and editable
- Orders, customer details, payment links — all delivered as WhatsApp messages
- Persistent session — once paired, the bot survives restarts and deploys without re-pairing
- Allowlist for safety; demo mode for testing without leaking real numbers

### For the buyer (`src/`)

- Public marketplace at [cyberkunju.com](https://cyberkunju.com) — TanStack Start SSR
- Browse by craft, district, or category; product story on every listing
- WhatsApp-style purchase flow — name, address, phone, all in natural language
- Order tracking, certificate viewing, community network browsing
- Buyer-side OTP authentication via WhatsApp (no passwords)

### For the operations side (`apps/api` + `vendor_ui/`)

- Express + Prisma against Supabase Postgres
- Karigar Sakhi admin console — pending products, members, orders, certifications
- Activity feed — every approval, certificate, order, broadcast
- Razorpay payment links generated per order
- Cloudinary image hosting; OpenAI for AI extraction; Sarvam-ready for native Indic voice

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    cyberkunju.com (Cloudflare)              │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS
                ┌──────────▼──────────┐
                │  EC2 / Fedora 43    │
                │  nginx :443         │
                └──┬──────┬──────┬────┘
                   │      │      │
        ┌──────────▼┐  ┌──▼──┐  ┌▼──────────┐
        │ web :3000 │  │ api │  │ wabot     │
        │ TanStack  │  │5000 │  │ :5001     │
        │ Start SSR │  │     │  │ Chromium  │
        └───────────┘  └──┬──┘  └─────┬─────┘
                          │           │
                  ┌───────▼───┐   ┌───▼──────┐
                  │ Supabase  │   │ WhatsApp │
                  │ Postgres  │   │ Web      │
                  └───────────┘   └──────────┘
```

CI/CD: every push to `main` deploys via GitHub Actions, with smoke tests against both the origin and the public Cloudflare URL.

---

## Getting started

### Prerequisites

- Node 22+
- A Supabase Postgres `DATABASE_URL`
- An OpenAI API key
- A WhatsApp number for the bot (any Android phone or WhatsApp Web)

### Quick start (local dev)

```bash
# Clone
git clone https://github.com/cyberkunju/hastkala.git
cd hastkala

# Install root deps (frontend + shared)
npm install

# API
cd apps/api && npm install && npx prisma generate
cp .env.example .env  # fill in DATABASE_URL, OPENAI_API_KEY, etc.
npm run dev           # starts on :5000

# WhatsApp bot
cd ../wa-bot && npm install
cp .env.example .env  # fill in OPENAI_API_KEY, ALLOWED_TEST_NUMBERS
npm run dev           # starts on :5001 — scan the QR

# Frontend
cd ../.. && npm run dev   # starts on :3000
```

Or run everything together:

```bash
npm run dev:all
```

### Deploy

This repo deploys itself. Push to `main`, and the [`Deploy to EC2`](.github/workflows/deploy.yml) workflow:

1. SSHes to the configured EC2 instance
2. Pulls the commit
3. Builds API, bot, and frontend
4. Smart-restarts only the services whose `dist/` actually changed (preserves WhatsApp session)
5. Smoke-tests every public endpoint

Provisioning a fresh box is a one-shot script — see [`scripts/AWS-DEPLOY.md`](scripts/AWS-DEPLOY.md).

---

## Project layout

```
hastkala/
├── apps/
│   ├── api/                Express + Prisma backend
│   │   ├── prisma/         Schema (14 models: Artisan, Product, Order, …)
│   │   └── src/
│   │       ├── controllers/    Request handlers
│   │       ├── routes/         Express routers (/api/products, /api/orders, …)
│   │       ├── services/       AI, storage, WhatsApp integration
│   │       └── middleware/     Auth, error handling
│   │
│   └── wa-bot/             WhatsApp bot (whatsapp-web.js)
│       └── src/
│           ├── conversations/  ~70-state engine + per-flow handlers
│           ├── services/       Transcription, TTS, NLU, translation, Q&A
│           ├── server/         Internal HTTP server (:5001)
│           └── openwa/         WhatsApp Web client + supervisor
│
├── src/                    Buyer marketplace (TanStack Start)
│   ├── routes/             File-based routing
│   ├── components/         Layout, product, common
│   └── lib/                API client, i18n, Razorpay, types
│
├── vendor_ui/              Karigar Sakhi admin console (static HTML+JS)
├── scripts/                Deploy, bootstrap, runbooks
├── .github/workflows/      CI/CD
└── Logo/                   Brand assets
```

---

## The conversation engine

The bot is the heart of HastKala. It's a deterministic finite-state machine over **~70 conversation states**, with NLU + voice transcription as the input layer:

```
Voice/text in any language
         │
         ▼
  ┌──────────────┐    ┌──────────────────┐
  │  Transcribe  │───▶│  Universal cmds  │  RESET, MENU, BACK,
  │  (gpt-4o)    │    │                  │  HELP, LANGUAGE,
  └──────────────┘    └────────┬─────────┘  HUMAN, EXIT
                               │
                               ▼
                      ┌────────────────┐
                      │ NLU classifier │  Maps free text →
                      │ (gpt-4o-mini)  │  menu choice / nav
                      └────────┬───────┘
                               │
                               ▼
                      ┌────────────────┐
                      │ State dispatch │  ~70 states across
                      │                │  identity, seller,
                      └────────┬───────┘  buyer, sakhi flows
                               │
                               ▼
                      ┌────────────────┐
                      │ Translate +    │  ta/ml: gpt-4o-audio
                      │ TTS            │  en/hi/kn: gpt-4o-mini-tts
                      └────────────────┘  (Sarvam Bulbul if key set)
```

Voice-confirmation gates protect critical inputs (price, address, phone) — the bot reads back what it heard before committing.

---

## Languages

| Language  | Bot text       | Voice in | Voice out (TTS) |
| --------- | -------------- | -------- | --------------- |
| English   | Native pack    | ✅       | Native          |
| Hindi     | Native pack    | ✅       | Indic-tuned     |
| Kannada   | Native pack    | ✅       | Indic-tuned     |
| Tamil     | Runtime trans  | ✅       | Unified audio   |
| Malayalam | Runtime trans  | ✅       | Unified audio   |

Set `SARVAM_API_KEY` in `apps/wa-bot/.env` to switch the Indic stack to Sarvam Bulbul + Saaras for native-grade transcription and prosody.

---

## What's been built

| Module                          | Where                                                | Status    |
| ------------------------------- | ---------------------------------------------------- | --------- |
| WhatsApp bot                    | `apps/wa-bot`                                        | ✅ Live   |
| Voice transcription + TTS       | `services/transcribeService.ts`, `ttsService.ts`     | ✅ Live   |
| 5-language UI                   | `conversations/messages/{en,hi,kn}.ts` + runtime     | ✅ Live   |
| Product catalog API             | `apps/api/src/routes/product.routes.ts`              | ✅ Live   |
| Order management                | `apps/api/src/routes/order.routes.ts`                | ✅ Live   |
| Buyer marketplace               | `src/routes/`                                        | ✅ Live   |
| Karigar Sakhi admin (`/admin`)  | `src/routes/admin.tsx`                               | ✅ Live   |
| Community + certification       | `apps/api/src/routes/community.routes.ts`            | ✅ Live   |
| 7-day learning modules          | `apps/api/src/routes/community.routes.ts`            | ✅ Live   |
| Seller product CRUD (web)       | `src/routes/seller.tsx`                              | ✅ Live   |
| Direct order → seller WhatsApp  | `apps/api/src/controllers/order.controller.ts`       | ✅ Live   |
| Artisan talent-request alerts   | `apps/api/src/routes/network.routes.ts`              | ✅ Live   |
| Cloudinary image hosting        | `apps/api/src/services/storage.service.ts`           | ✅ Live   |
| BUY deeplink → purchase flow    | `apps/wa-bot/src/conversations/engine.ts`            | ✅ Live   |
| Autoplay bot demo on homepage   | `src/components/common/BotDemo.tsx`                  | ✅ Live   |
| WhatsApp CTA on homepage        | `src/routes/index.tsx`                               | ✅ Live   |
| RESET clears pending state      | `apps/wa-bot/src/conversations/engine.ts`            | ✅ Live   |
| Buyer requests + quotes         | `apps/api/src/routes/{request,quote}.routes.ts`      | ✅ Live   |
| Auto-deploy CI/CD               | `.github/workflows/deploy.yml`                       | ✅ Live   |

---

## The numbers

- **5** Indian languages
- **~70** conversation states in the bot engine
- **14** Prisma models
- **17** frontend routes
- **~25** API route files
- **1** app the artisan needs to know — WhatsApp

---

## Built for

[Project Sankalp / Code4Change Hackathon](#)  
**Problem statement**: W-1 — Artisan Women's Market Exclusion Across 15+ Craft Districts  
**Theme**: Women's Entrepreneurship & Economic Empowerment

---

## License

MIT — see [LICENSE](LICENSE).

The artisan stories, names, and example imagery are illustrative; production deployments must collect explicit consent before showcasing real artisans publicly.

---

<div align="center">

**HastKala** — _from a voice note to a livelihood_

</div>
