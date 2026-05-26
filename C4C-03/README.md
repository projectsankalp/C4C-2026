# NirAmaya — Rural Diabetes & Hypertension Screening System

> *"Free from disease"* — Rule-based health screening for rural India

## Quick Start

### 1. Setup Server
```bash
cd server
cp .env.example .env    # fill in your values
npm install
npm run seed            # run ONCE for demo data
npm run dev             # http://localhost:3001
```

### 2. Setup Client
```bash
cd client
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

## Demo Credentials
| Role     | Login            | Password    |
|----------|------------------|-------------|
| ASHA     | ASHA001 (ID)     | 1234 (PIN)  |
| Doctor   | doctor@phc.com   | doctor123   |
| Hospital | hospital@chc.com | hospital123 |

## Gmail App Password (for email alerts)
1. myaccount.google.com/security
2. Turn ON 2-Step Verification
3. App Passwords → Other → "niramaya" → Generate
4. Paste 16-char password into server/.env as EMAIL_PASS
