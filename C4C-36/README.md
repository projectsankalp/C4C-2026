# Code4Change Women

An AI-powered Recognition of Prior Learning (RPL) platform designed to validate the skills of rural artisans and connect them directly with local employers.

## The Problem & Solution
Millions of skilled rural women (tailors, artisans) lack formal certifications, making it difficult for them to find fair employment. This platform allows artisans—or advocates acting on their behalf—to upload a simple video demonstrating their craft. 

Our **AI Engine** automatically analyzes the video's audio using multilingual transcription (English, Hindi, Kannada) to verify the skill. Once approved, the artisan is issued a verified credential and instantly gains access to a localized, filtered job board where they can directly call employers.

---

## Architecture

The platform is split into three main micro-components, all connected to a single source of truth database.

1. **Frontend (Next.js & React)**
   - A highly accessible, mobile-first UI with large typography and dynamic language switching.
   - Built with Vite, React, and TailwindCSS.
2. **Core Backend API (FastAPI / Python)**
   - Handles OTP phone verification, user sessions, database interactions, and secure file uploads to Supabase Storage.
3. **AI Video Processing Engine (FastAPI / Python)**
   - A dedicated microservice running on port `8001`.
   - Uses `ffmpeg` to extract audio from video submissions.
   - Uses `openai-whisper` (whisper-tiny model) to perform multilingual transcription and keyword-based validation.
4. **Database & Storage (Supabase / PostgreSQL)**
   - Single unified PostgreSQL database handling Users, Proxy Submissions, Certificates, and Local Jobs.

---

## Key Features

- **Proxy Submissions:** Digital literacy shouldn't be a barrier. Advocates (NGO workers, family members) can submit skill verification videos *on behalf* of an artisan using the "Applying for someone else" toggle.
- **Multilingual AI Verification:** The AI engine understands English, Hindi, and Kannada natively, bridging the language gap for rural workers.
- **Direct "Call to Apply":** Traditional complex job applications are replaced with a frictionless `<a href="tel:...">` Call Employer button, opening the phone dialer instantly.
- **Location-Based Job Matching:** The backend automatically filters the local job board to only show opportunities available in the candidate's verified city.
- **Mock OTP Flow:** Fully functional phone authentication workflow using a static `123456` dummy code to keep demo deployments completely free of SMS charges.

---

## How It Works (The User Journey)

1. **Login & OTP:** The user enters their phone number and authenticates using a 6-digit OTP.
2. **Video Upload (The Hub):** The user records or uploads a short video demonstrating their skill (e.g., stitching a garment). They fill out their Name, Phone, and City (or the Candidate's details if submitting via Proxy).
3. **AI Analysis:** The backend uploads the video to Supabase Storage and hands the URL to the AI Engine. The AI extracts the audio, transcribes it, and verifies tailoring-specific keywords.
4. **Certification:** If the AI detects relevant skills, the video is approved, and a verified credential (with a unique hash) is issued to the artisan.
5. **Job Unlocking:** The artisan's profile is updated. They unlock the localized job board, matching them with employers in their exact city.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- `ffmpeg` installed on your system (e.g., `sudo apt install ffmpeg` or `sudo pacman -S ffmpeg`)
- A Supabase project (for PostgreSQL and Storage)

### 1. Database Setup
Ensure your Supabase PostgreSQL database has the following tables created based on the SQLAlchemy schema:
- `users`, `submissions`, `jobs`, `certificates`, `volunteers`, `validators`.
*(You can run the python database script locally to autogenerate these tables via SQLAlchemy).*

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
# Database
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET_NAME=videos

# Twilio (Optional - mock OTP defaults to 123456)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# JWT
JWT_SECRET=your_super_secret_key
JWT_ALGORITHM=HS256
```

### 3. Start the Core Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the core API on port 8000
python run.py
```

### 4. Start the AI Engine
Open a new terminal window:
```bash
cd backend/ai-engine
source ../.venv/bin/activate

# Run the AI engine on port 8001
python run_ai.py
```

### 5. Start the Frontend
Open a new terminal window:
```bash
cd frontend
npm install

# Start the Next.js/Vite development server
npm run dev
```

The app will now be running at `http://localhost:5173`.

---

## Tech Stack Details
- **Frontend:** React, React Router, TailwindCSS, Framer Motion, Lucide Icons, Sonner (Toasts)
- **Backend:** Python, FastAPI, SQLAlchemy, Uvicorn, Pydantic
- **AI/ML:** OpenAI Whisper (`whisper-tiny`), FFmpeg
- **Infrastructure:** Supabase (PostgreSQL & Object Storage)
