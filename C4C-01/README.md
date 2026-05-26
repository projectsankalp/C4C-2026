# PulsePoint — Diabetes Surveillance & Management Network

> Specialized rural diabetes intake, GIS epidemiological mapping, and high-risk follow-up tracking.

**Intake · Surveillance · Outbreak Mapping — solved in one clinical workflow.**
PulsePoint is a specialized AI health network optimized for diabetes screening, risk evaluation, and rural patient surveillance. It helps clinical teams screen for chronic diabetes symptoms, maps outbreak hot spots using native GIS layers, and tracks high-risk patients to ensure they are never lost to follow-up.

---

## Track alignment

| Pillar | What PulsePoint delivers |
| --- | --- |
| **Diabetes Health** | Custom symptoms catalog (triad symptoms, neurological indicators, and acute emergency signs), dynamic IDRS-style risk calculation (waist size, blood sugar levels) computing dynamic diagnostic confidence scores (45% to 98%). |
| **GIS Surveillance** | Interactive CartoDB Positron mapping component on the Foundation Worker Dashboard, plotting active patient coordinates, severity tiers, and outbreak hot spots. |
| **Community Wellbeing** | Caregiver-linking via 6-digit codes, routing all high-risk triages exclusively to the **Endocrinology Department** (`OPD-ENDOCRINE-XXX` tokens), and automated missed follow-up tracking. |

---

## The core mechanism: how PulsePoint manages diabetes screening

The app classifies every triage into one of five severity tiers, then routes the patient to the **Endocrinology Department** with optimized waiting slots:

| Severity | What PulsePoint does | OPD impact |
| --- | --- | --- |
| **`EMERGENCY`** | Auto-places a Twilio voice call + SMS to the on-call endocrinologist with the patient's name, severity, and top symptoms read aloud. | Doctor is **already prepared** when the patient arrives. |
| **`URGENT`** | Same auto-call + SMS; patient is given top-of-queue token at the Endocrinology Department (`OPD-ENDOCRINE-XXX`). | Critical cases never wait behind mild ones. |
| **`HIGH`** | Same-day priority 15-minute arrival window; effective queue position is halved. | High-acuity patients get a guaranteed slot without joining the morning crush. |
| **`MEDIUM`** | Standard 15-minute arrival slot, queue position pre-assigned. | OPD load is **smoothed across the day** instead of clumping at 9 AM. |
| **`LOW`** | Teleconsult or evidence-based self-care guidance. **No hospital visit needed.** | Mild cases are managed remotely. |

This is built, not aspirational. See:
- [lib/symptoms.ts](lib/symptoms.ts) — diabetes symptom catalog
- [lib/symptom-extract.ts](lib/symptom-extract.ts) — custom synonym-to-symptom mapping
- [lib/departments.ts](lib/departments.ts) — redirects all diabetes triages to Endocrinology
- [components/ThreeDAnomalyMap.tsx](components/ThreeDAnomalyMap.tsx) — CartoDB GIS native map tracking patient locations, risk levels, and anomalies
- [app/api/foundation/anomalies/route.ts](app/api/foundation/anomalies/route.ts) — computes real-time clusters, case spikes, and missed follow-ups with a 2-minute demo window

---

## End-to-end flow

1. **Patient or caregiver opens the app.** Caregivers redeem a 6-digit code the patient generates from `/account` (15-min single-use, see [app/api/links/code/route.ts](app/api/links/code/route.ts)).
2. **Symptoms + vitals captured** including new diabetes indicators: **Waist Size (inches)** and **Blood Sugar (mg/dL)**.
3. **AI assesses severity & confidence** via the PulsePoint Hugging Face Space. Confidence is scaled dynamically based on symptom density, blood sugar range, and abdominal waist size risk.
4. **Routing fires the moment severity is set:**
   - If `EMERGENCY` / `URGENT` / `HIGH` → Twilio alerts the doctor, generates the Endocrinology path, and lists the patient under surveillance.
   - If no subsequent triage or check-in is logged within **2 minutes (demo mode)**, the patient is flagged as a **Missed Follow-up** anomaly.
5. **Doctor-ready referral** generated, detailing blood sugar, waist size, symptoms, and the dynamic diagnostic confidence; shareable as PDF or WhatsApp.
6. **Foundation Worker dashboard** displays real-time tracking, live spatial anomalies (clusters, spikes, missed check-ins), and the native GIS map.
7. **Audit trail** — every AI call logged with request id, model versions, latency, and hallucination check status (`/admin/audit`, CSV export).

---

## Features by role

| Role | What they get |
| --- | --- |
| **Patient** | Self-intake (`/me/intake`), generate caregiver link codes, view their own reports |
| **Caregiver** | Linked-patient feed, guided remote triage (`/caregiver/triage`), interview cards, vitals form (waist size & blood sugar), referral card, nearest-facility map |
| **Foundation Worker** | Surveillance dashboard (`/foundation`) with dynamic KPI stats, native CartoDB GIS map, real-time outbreak clusters, rapid spikes, sanitation warnings, and proactive missed follow-ups tracking |
| **Admin** | Bias audit log (`/admin/audit`) — every AI call with request id, model versions, latency, hallucination status; CSV export |
| **Anyone** | Condition cards (`/conditions`), lab analyzer (`/labs`), handover summary (`/handover`), disease prediction (`/predict`) |

Routes under `/caregiver`, `/foundation`, `/admin`, `/me`, `/account`, `/handover` are role-gated by [middleware.ts](middleware.ts); unauthorized roles redirect to `/forbidden`.

---

## Tech stack

- **Framework**: Next.js 15.5 (App Router) + React 19
- **Auth**: NextAuth 4 (Credentials provider, JWT sessions)
- **Database**: PostgreSQL via Prisma 5 (designed for Neon serverless)
- **Styling**: Tailwind CSS 3
- **Voice intake**: AssemblyAI
- **Critical-case calls + SMS**: Twilio Programmable Voice + Messaging
- **PDF intake**: `unpdf`
- **Clinical AI**: external Hugging Face Space (`pulsepoint-ai`)

---

## Quick start

```powershell
# 1. install dependencies (also runs `prisma generate`)
npm install

# 2. create your env file
copy .env.local.example .env.local
# then edit .env.local — see "Environment variables" below

# 3. push the Prisma schema to your database
npm run db:push

# 4. seed an admin user
npx tsx prisma/seed.ts
# creates admin@pulsepoint.local / PulseAdmin!2026

# 5. start the dev server
npm run dev
```

Open http://localhost:3000.

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string. Neon-style URL with `?sslmode=require` works out of the box. |
| `NEXTAUTH_URL` | yes | Public URL of the app, e.g. `http://localhost:3000` in dev. |
| `NEXTAUTH_SECRET` | yes | Random 32+ byte secret. Generate with `openssl rand -base64 48` or `npx auth secret`. |
| `NEXT_PUBLIC_PULSEPOINT_API` | yes | Base URL of the clinical AI service. Default: `https://aviraltrip-pulsepoint-ai.hf.space`. |
| `ASSEMBLYAI_API_KEY` | optional | Enables `/api/transcribe`. Without it, voice intake returns 503. |
| `TWILIO_ACCOUNT_SID` | optional* | Twilio SID for the critical-case call + SMS. |
| `TWILIO_AUTH_TOKEN` | optional* | Twilio auth token. |
| `TWILIO_PHONE_NUMBER` | optional* | E.164 sender number, e.g. `+15551234567`. |
| `EMERGENCY_ALERT_TO_NUMBER` | optional | Override on-call doctor / hotline number (E.164). Default in code: `+916363640564`. |

*Without Twilio creds the triage still saves and the queue still updates —
only the auto-call to the doctor is skipped. Setting them is what unlocks the
core OPD-decongestion guarantee for `URGENT` / `EMERGENCY` cases.

---

## Database

Schema lives in [prisma/schema.prisma](prisma/schema.prisma). Models:

- `User` — id, email, role (`PATIENT`/`CAREGIVER`/`DOCTOR`/`ADMIN`), profile fields
- `LinkCode` — 6-digit, single-use, 15-minute caregiver invitation codes
- `CaregiverLink` — patient ↔ caregiver relationship with permission level
- `Triage` — severity, symptoms, vitals JSON, doctor briefing
- `Report` — PDF/voice intake artifacts with extracted symptoms

Commands:

```powershell
npm run db:push      # sync schema (no migration history)
npm run db:studio    # open Prisma Studio
npx prisma migrate dev --name <name>   # if you prefer migrations
```

---

## Default credentials (after seed)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pulsepoint.local` | `PulseAdmin!2026` |

Patient/caregiver/doctor accounts are created via `/signup`. Caregivers link
to a patient by entering a 6-digit code generated from `/account`.

---

## Internal API

| Route | Method | Auth |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | — | NextAuth handler |
| `/api/auth/signup` | POST | public |
| `/api/links/code` | POST | patient — generate link code |
| `/api/links/redeem` | POST | caregiver — redeem code, create link |
| `/api/patients` | GET/POST | varies by role |
| `/api/patients/[id]` | GET/PATCH/DELETE | own data or linked caregiver |
| `/api/triages` | POST | patient or authorized caregiver — fires the doctor call on URGENT/EMERGENCY |
| `/api/caregiver/feed` | GET | caregiver |
| `/api/me/reports` | GET | patient |
| `/api/transcribe` | POST | requires AssemblyAI key |
| `/api/extract-pdf` | POST | parses uploaded medical PDFs |
| `/api/extract-symptoms` | POST | NLP symptom extraction |

---

## Project structure

```
app/             Next.js App Router pages and API routes
  api/           Route handlers (server)
  account/       Account settings + caregiver linking
  caregiver/     Caregiver dashboard + triage flow
  doctor/        Doctor queue (severity-sorted)
  admin/         Audit log
  me/            Patient self-intake
  conditions/    ICD-10 condition cards
  labs/          Lab value analyzer
  predict/       Disease prediction
components/      Reusable UI (Card, Header, SymptomPicker, ...)
lib/             Server + shared logic (auth, prisma, twilio, scheduling, ...)
prisma/          schema.prisma + seed.ts
types/           Type augmentation (next-auth.d.ts)
middleware.ts    Role-based route guards
```

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint via `next lint` |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio |

`postinstall` runs `prisma generate` automatically.

---

## Scalability & roadmap

The architecture is built so OPD-decongestion can scale from one PHC to a
state-wide network without rewrites.

**What scales today**

- **Stateless Next.js on serverless** — every route handler is independent;
  Vercel / Cloud Run autoscale on triage volume.
- **Neon serverless Postgres** — branches per environment, pgbouncer pooling
  in the connection string, autoscales on demand.
- **Decoupled clinical AI** — `NEXT_PUBLIC_PULSEPOINT_API` points at a
  Hugging Face Space today; tomorrow it's a sovereign GPU cluster behind the
  same contract.
- **Twilio-native paging** — adding a new on-call number per facility is one
  env var. Per-shift rotation slots in via a `Doctor` model.
- **Cold-start safety** — [lib/db-errors.ts](lib/db-errors.ts) detects
  Neon/Space cold-starts (P1001/P1017) and returns a friendly 503 with retry
  hint instead of a 500.
- **Role plug-ins** — adding pharmacist / ASHA / insurer is one entry in
  [middleware.ts](middleware.ts) plus a new role in the Prisma enum.

**Near-term roadmap**

- **Multi-tenant Hospital model** — per-facility OPD departments, slot
  lengths, queue caps, on-call rota.
- **Doctor-pager rotation** — replace the single `EMERGENCY_ALERT_TO_NUMBER`
  with an on-call schedule per department, with escalation if unanswered.
- **EMR / ABDM write-back** — push triage + verdict into hospital HIS via
  FHIR R4 so the OPD nurse never has to retype anything.
- **WhatsApp Cloud API** — templated two-way messages (arrival
  confirmations, slot reminders, post-visit follow-up).
- **Vernacular voice** — Hindi, Tamil, Bengali, Marathi, Telugu intake +
  TwiML `<Say>` in the on-call doctor's preferred language.
- **Offline-first PWA** — service-worker queue + IndexedDB for 2G rural
  caregivers; syncs on reconnect.
- **Edge inference** — distil the severity classifier to ONNX so triage
  works in-browser when the network is unreliable.

**Long-term**

- **Population-health dashboard** for district health officers (anonymized
  symptom heat-maps, outbreak detection from triage volume spikes).
- **Insurer integration** — pre-authorize teleconsult claims at triage time.
- **Continuous learning loop** — doctor verdicts at `/doctor/queue` flow
  back as labels for severity-model fine-tuning, gated by the bias audit
  log.

---

## Business perspective: who pays for less OPD crowding

OPD overcrowding is expensive for everyone — hospitals, insurers, governments,
and patients. PulsePoint sells the **measurable reduction**.

| Stakeholder | What they pay | What they save |
| --- | --- | --- |
| **Govt hospitals / PHCs** | Per-bed-per-month SaaS | 30–40% OPD volume diverted to teleconsult or off-peak slots; emergency door-to-doctor time cut by the auto-call to the on-call doctor |
| **Private hospital chains** | Tiered SaaS by OPD volume | Higher revenue per OPD slot (right-department routing kills no-shows + re-referrals); auditable triage protects against malpractice claims |
| **Insurers** | Per-triage API fee | Lower outpatient claim cost — each avoided ER visit ≈ ₹3,500 saved; pre-triaged claims process faster |
| **Patients & families** | Free at point of care | No lost wages from a wasted hospital trip; the auto-call means an actual emergency reaches a doctor before the patient does |
| **State health departments** | Per-district subscription | Real-time outbreak signal from triage volume + utilization analytics |

**Unit economics (pilot)**

- One PHC with 200 OPD walk-ins/day. PulsePoint diverts 10% (20 patients) to
  teleconsult and smooths another 30% across the day.
- Patient travel + lost-wages saved: ~₹70/visit × 20 visits = **₹1,400/day**
  back in the local economy.
- Average door-to-doctor time on emergencies: ~25 min → near-zero, because
  the auto-call gives the doctor the heads-up.
- SaaS payback for the facility: **under 30 days**.

**Go-to-market wedge**

1. **Free tier for ASHA / community health workers** — viral patient
   acquisition, no procurement friction.
2. **Paid tier for the receiving hospitals** — they already see the
   PulsePoint referrals arriving by WhatsApp and the heads-up calls landing
   on their on-call line; subscribing turns it into a pre-filled intake on
   `/doctor/queue`.
3. **Enterprise tier for hospital chains and insurers** — SLA, on-prem AI,
   FHIR integration, custom escalation rotas.

**Why now**

- ABDM (India's national digital health stack) makes patient-portable health
  IDs real for the first time.
- 5G rollout + ₹10K Android phones put multimodal AI in caregiver hands.
- Post-COVID OPDs are still 20–30% over capacity in tier-2 cities.

---

## Deployment notes

- **Vercel**: works out of the box. Set every required env var in project
  settings, point `DATABASE_URL` at a serverless Postgres (Neon recommended),
  set `NEXTAUTH_URL` to your deployed domain.
- **Cold starts**: the Hugging Face Space hibernates; the first AI call after
  idle may take 15–30 s. UI shows a loading state.
- **Neon free tier**: the database also cold-starts. `lib/db-errors.ts`
  detects P1001 / P1017 and returns a friendly 503 with retry hint.
- **Print-to-PDF**: the doctor-ready referral card uses the browser print
  dialog; dedicated print styles live in `globals.css`.

---

## License

Internal hackathon project. Not for clinical use — decision-support only.
