<div align="center">
  <h1>Navyora</h1>
  <p><strong>AI-Powered Micro-Entrepreneurship Coach</strong></p>
  <p>Empowering Indian women home-creators to turn handmade products into profitable micro-brands</p>
</div>

## About

Navyora is a full-stack web application that helps home-based artisans, bakers, crafters, and local makers build a complete business strategy. Just enter a product name and description (or upload a photo), and Navyora's AI generates:

- 💰 **Pricing recommendations** in Indian Rupees with profit margin calculator
- 📸 **Instagram/WhatsApp marketing copy** with a visual post builder
- 👥 **First-customer action plan** with ready-to-send messages
- ✨ **Product improvement suggestions** with progress tracking
- 📈 **3-tier selling & growth strategy**
- 🗣️ **AI Companion chat** for ongoing business mentoring
- 📊 **Business dashboard** to track orders, revenue, and profile

### Built For

- Women micro-entrepreneurs in India
- Home-based creators with no business background
- Non-English speakers (app supports English, Hindi, Kannada)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express 4 |
| AI | Google Gemini (`@google/genai` SDK) |
| Icons | Lucide React |

## Features

- **Text & Image plan generation** — describe your product or upload a photo for AI vision analysis
- **3-language support** — English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ)
- **Interactive pricing calculator** — adjustable profit margin slider (0–200%)
- **Visual post builder** — 4 templates, 6 color themes, 5 illustration styles, real-time preview
- **First-customer outreach** — editable WhatsApp message templates
- **Improvement tracker** — checklist with progress bar and dynamic price potential
- **Growth roadmap** — 3 levels: Start → Expand → Scale with delivery guidance
- **AI Companion chat** — context-aware business mentor with quick questions
- **Business dashboard** — order management, revenue tracking, creator profile, currency/settings
- **Dark/Light theme** — toggle across the entire dashboard
- **Save & journal** — persist plans locally with history sidebar

## Getting Started

### Prerequisites

- Node.js v18+
- A [Google Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/Sahadxd/Navyora.git
   cd Navyora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite + Express) |
| `npm run build` | Build frontend + bundle server for production |
| `npm start` | Run production server |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Project Structure

```
├── server.ts                     Express backend + Gemini API endpoints
├── vite.config.ts                Vite configuration
├── tsconfig.json                 TypeScript config
├── package.json                  Dependencies & scripts
├── .env                          Local environment variables (gitignored)
├── index.html                    Root HTML
├── src/
│   ├── main.tsx                  React entry point
│   ├── App.tsx                   Root component (auth, plan gen, routing)
│   ├── types.ts                  TypeScript interfaces
│   ├── index.css                 Tailwind + custom styles
│   ├── i18n/
│   │   ├── translations.ts       English / Hindi / Kannada strings
│   │   └── LanguageContext.tsx    Language provider
│   └── components/
│       ├── DashboardView.tsx     Main dashboard (8 tabs)
│       ├── CreatePlanForm.tsx    Product input form
│       ├── Header.tsx            Navigation bar
│       ├── LoginView.tsx         Login / Register / Guest
│       └── SampleProducts.ts     Product templates
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/generate-strategy` | Generate business plan from text |
| POST | `/api/generate-strategy-from-image` | Generate plan from product photo |
| POST | `/api/companion-chat` | AI mentoring chat with plan context |

## Deployment

The app runs as a single Express process. Deploy on any Node.js platform:

- **Railway** — connect GitHub repo, set `GEMINI_API_KEY`, build: `npm run build`, start: `npm start`
- **Render** — same as above
- **Koyeb** / **Cyclic** — also compatible

> **Note:** Not directly compatible with Vercel's free tier (requires serverless function conversion).

## License

MIT
