# KariGhar (कारीघर) 🌾🏺

KariGhar is an elegant, highly accessible e-commerce marketplace and voice-supported digital ecosystem custom-designed for rural Indian women artisans (*KariGhars*). 

Built using a modern **React 19 & Vite** frontend coupled with a robust **Node.js, Express, and Supabase** backend, KariGhar bridges the digital divide by offering a low-literacy friendly workspace, multi-dialect Indian voice navigation, localized languages, and secure transactions.

---

## ✨ Key Features

### 🎙️ Voice-First Navigation & Low-Literacy Support
* **Gemini AI Route Parsing**: Speech-to-text input is translated into semantic actions and navigation prompts via the Gemini API, enabling artisans to navigate the app through spoken commands (e.g., *"d दुकान का स्टॉक दिखाओ"* or *"take me to my orders"*).
* **Audio Interaction Loops**: Customers can record custom requests when ordering, and artisans can play back voice requests (using browser Speech Synthesis or audio storage) directly inside their dashboard.
* **Simulated Voice Typing**: Integrated microphone buttons transcribe speech in Indian accents to populate product descriptions and seller details.

### 🌐 Native Multilingual Interface
* **Three Localized Languages**: Full translation maps support **English**, **Hindi (हिन्दी)**, and **Kannada (ಕನ್ನಡ)** to serve diverse regions.
* **Dynamic Language Toggling**: Swap dialects seamlessly on any page with global state synchronization.

### 🛍️ Unified & Secure Artisan Portal
* **Simplistic Seller Onboarding**: Step-by-step onboarding collects artisan names, locations, and contact info, then generates simple logins based on **Artisan Full Name & Secret Numeric Code**.
* **Personalized Dashboard**: Visual indicators track product listings, stock balances, pending orders, and total earnings.
* **Reactive Stock Controls**: Intuitive **+ / -** counter widgets let artisans update inventory counts with full server synchronization.
* **Simulated Bank Payouts**: Visual earnings balance display with a structured bank payout transfer flow.

### 🛒 High-Performance Catalog & Shopping Experience
* **Earthy Aesthetics**: Styled with a premium, curated Indian-earthy color palette, glassmorphism headers, subtle micro-animations, and smooth page transitions.
* **Sync-Enabled Guest Cart**: Operates seamlessly for guest users using local state and `localStorage`, then merges items into database-backed shopping carts automatically once the user authenticates.
* **Race Condition Stock Protections**: The server leverages database-level atomic operations and conditional checks (`.gte('stock', quantity)`) to ensure stock integrity during concurrent checkout races.

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Core**: [React 19](https://react.dev/) & [Vite 6](https://vite.dev/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/) for premium, tactile UI feedback.
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Feather, Globe, and Box icons).
* **Styling**: Curated Vanilla CSS stylesheet (`src/styles/karigar-seller.css`) implementing modern CSS variables, glassmorphism layers, and responsive fluid layouts.

### Backend Infrastructure
* **Core**: [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL client, Row-Level Security, Admin bypass APIs).
* **AI Orchestrator**: [Google Gemini Pro API](https://deepmind.google/technologies/gemini/) (semantic voice navigation parsing).
* **File Uploads**: [Multer](https://github.com/expressjs/multer) & memory buffers with auto-transfer wrappers into Supabase Storage Buckets.

---

## 📂 Project Directory Structure

```bash
KariGhar/
├── server.js                        # Express app initialization, routing engine, and health checks
├── backend_specification.md         # Database relational schema, RLS rules, and architecture specs
├── supabase_schema.md               # Complete database tables and schema specifications
├── seed_db.js                       # Script to populate initial database mock values
├── seed_products.js                 # Script to populate initial marketplace catalogs
├── server/                          # Core backend files
│   ├── config/                      # Supabase server integrations and environments
│   ├── controllers/                 # Express controllers (auth, cart, feedback, order, product, seller)
│   ├── middleware/                  # Protected routes, file upload limits, and Express error handlers
│   ├── routes/                      # API endpoint mounting points
│   ├── services/                    # Wrappers for remote cloud services (storageService, etc.)
│   └── utils/                       # Handlers (asyncHandler, custom loggers, validators)
└── ecommerce-project/               # Frontend React Application
    ├── public/                      # Static assets and public images
    ├── src/
    │   ├── components/              # Shared consumer UI components (Navbar, Footer, etc.)
    │   ├── context/                 # State management providers (AuthContext, CartContext, ProductContext)
    │   ├── pages/                   # Views (Consumer Pages, Artisans, Seller Portal, Dashboard)
    │   ├── services/                # Local services for API interactions (api.js, authService.js)
    │   ├── styles/                  # Styling files and theme properties
    │   └── utils/                   # General helper functions and static constants
    └── package.json                 # Frontend dependency definitions
```

---

## 🚀 Setup & Installation

### 1. Clone & Set Up Environment Variables
Create a `.env` file at the **root** folder based on `.env.example`:
```ini
PORT=5000
NODE_ENV=development

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anonymous-public-api-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-api-key

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Install Project Dependencies
Run in your command-line workspace at the **root** directory:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm install --prefix ecommerce-project
```

### 3. Run the Development Servers
Launch both active background processes simultaneously:
```bash
# Start Backend Server (runs on http://localhost:5000)
npm run dev

# Start Frontend Server (runs on http://localhost:5173)
npm run dev:frontend
```

---

## 📄 License & Ownership

Designed and maintained for **KariGhar** by Nikhil Shet & the development team. All assets and source code are protected under proprietary terms. 🌾🏺
