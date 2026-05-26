# 🌿 Swachh Vayu — स्वच्छ वायु

### Rural Air Quality Intelligence & Agricultural Decision Platform

> Empowering rural India with real-time, multilingual, AI-driven air quality monitoring — from farm to panchayat.

![Python](https://img.shields.io/badge/Python-Flask-blue?style=flat-square&logo=flask)
![React](https://img.shields.io/badge/React-Vite-purple?style=flat-square&logo=react)
![IoT](https://img.shields.io/badge/IoT-ESP8266-green?style=flat-square&logo=espressif)
![AI](https://img.shields.io/badge/AI-Scikit--Learn-orange?style=flat-square&logo=scikit-learn)
![Languages](https://img.shields.io/badge/Multilingual-6_Languages-red?style=flat-square)

---

## 🚀 The Problem

India has thousands of urban air monitoring stations — but **over 65% of the population lives in rural agricultural belts** where stubble burning, pesticide sprays, and biomass cooking fires silently destroy health.

These villages have **zero localized air data**, **no actionable advisories** in local languages, **no system linking air quality to farming decisions**, and **no incentive mechanism** for cleaner agricultural practices.

A scientific "AQI number" means nothing to a farmer. They need **intelligence they can act on, in a language they speak.**

---

## 💡 Our Solution

**Swachh Vayu** is an end-to-end, offline-first platform that bridges IoT hardware, agricultural intelligence, and community-driven clean air governance.

### How It Works

**IoT Sensor Nodes** (ESP8266 + MQ135) continuously monitor air quality at the village level → Data streams via WiFi to a **Raspberry Pi gateway** running a Flask backend → An **AI prediction engine** forecasts air quality 4 hours ahead → A **React dashboard** displays everything in 6 Indian languages → **Sarvam AI** delivers voice and SMS alerts to villagers who can't read screens.

---

## 🌾 Agricultural Decision Intelligence — Our USP

This is **not** just a monitoring tool. We convert raw sensor data into **farm-level actionable intelligence**:

### Smart Spraying Window
Scores spray suitability (0–100) based on humidity, temperature, AQI, and atmospheric stability. Tells farmers: "Spray now" or "Wait 4 hours."

### Crop Drying Optimization
Detects moisture interference, dust contamination, and smoke risk. Advises whether open-air crop drying is safe today.

### Outdoor Work Timing
Comfort scoring for farm laborers — recommends safe working hours and flags dangerous heat + pollution combinations.

### Smoke & Dust Interference Detection
Real-time spike detection using MQ135 rolling averages. Alerts when burning events or dust storms disrupt farming activities.

### 4-Hour Predictive Forecasting
ML model predicts air quality 4 hours ahead so farmers can **plan their day before conditions worsen**.

### Clean Air Measures Checklist
Interactive, gamified checklist for villages — bio-decomposers over stubble burning, organic pest control, efficient cookstoves, and more.

---

## 🗣️ Multilingual & Inclusive

- Full UI in **6 languages**: English, Hindi, Marathi, Tamil, Kannada, Telugu
- **Sarvam AI** integration — real-time translation, text-to-speech voice alerts, and a voice assistant
- Designed for low-literacy users — color-coded LEDs, simple icons, audio alerts alongside text

---

## 🗺️ Live Interactive Map

- **Leaflet.js** real-time map with color-coded node markers
- Green = Good, Yellow = Moderate, Red = Poor, Gray = Offline
- Heatmap overlay and danger zone detection
- Currently deployed: **Khedgaon** and **Pimpalgaon**, Nashik Rural District

---

## 🏆 Village Leaderboard & Gamification

Villages compete on quarterly air quality improvement scores:

| Rank | Village | Air Quality Score |
|------|---------|-------------------|
| 🥇 1 | Pimpalgaon | 90 |
| 🥈 2 | Khedgaon | 60 |

Scoring factors: Average air quality, improvement rate, uptime, participation, and hazard penalties. Villages scoring 70+ with avg AQI under 100 are **reward-eligible**.

---

## 🤖 AI/ML Prediction Engine

| Parameter | Details |
|-----------|---------|
| **Model** | Random Forest Regressor (scikit-learn) |
| **Estimators** | 100 trees, max depth 12 |
| **Dataset** | CPCB Rural Air Quality data with agricultural burning patterns |
| **Input Features** | Current AQI, Previous AQI, Temperature, Humidity, Hour of Day, Day of Week, 3hr Rolling Avg, AQI Change Rate |
| **Output** | 4-hour ahead air quality forecast |
| **Why It Matters** | Early warning lets farmers reschedule outdoor work before air degrades |

---

## 📡 IoT Hardware

| Component | Details |
|-----------|---------|
| **MCU** | ESP8266 NodeMCU (WiFi) / ESP32 (LoRa-ready) |
| **Sensor** | MQ135 — detects NH3, NOx, benzene, smoke, CO2 |
| **Display** | 16x2 I2C LCD — real-time AQI + status |
| **Visual Alerts** | 3 LEDs (Green / Yellow / Red) |
| **Audio Alert** | Active buzzer — triggers at dangerous levels |
| **Data Rate** | HTTP POST JSON every 5 seconds |
| **Power** | USB / Solar-ready with 3.7V battery backup |

### Pin Mapping (ESP8266)

| Component | Pin | GPIO |
|-----------|-----|------|
| MQ135 Sensor | A0 | ADC0 |
| Buzzer | D4 | GPIO 2 |
| Green LED | D5 | GPIO 14 |
| Yellow LED | D6 | GPIO 12 |
| Red LED | D7 | GPIO 13 |
| LCD (I2C) | D1/D2 | GPIO 5 (SCL) / GPIO 4 (SDA) |

---

## 🔌 Offline-First Design

- Sensor nodes work **without internet** — LCD + LED + Buzzer alerts are always active
- Raspberry Pi creates a local WiFi hotspot for village access
- GSM module (SIM800L) sends SMS/voice alerts when cellular is available
- Dashboard works on any phone browser over the local network

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Leaflet.js, Recharts, Lucide Icons |
| Backend | Python Flask, SQLite, RESTful API (50+ endpoints) |
| AI/ML | Scikit-learn, Joblib, Pandas, NumPy |
| Multilingual | Custom i18n (6 langs) + Sarvam AI (Mayura, Bulbul, Saarika) |
| IoT | ESP8266/ESP32, MQ135, I2C LCD, LEDs, Buzzer |
| Communication | WiFi HTTP POST (active), LoRa SX1278 (planned) |
| Gateway | Raspberry Pi 4 |
| Auth | JWT tokens (24h), bcrypt passwords, role-based access |
| Alerts | Local (LCD + LED + Buzzer) + Remote (SMS + Voice via Sarvam AI) |
| Deployment | Gunicorn + systemd on Raspberry Pi |

---

## 📂 Project Structure

```
SwachhVayu/
│
├── backend/
│   ├── app.py                     # Flask application factory
│   ├── config.py                  # Environment configuration
│   ├── database.py                # SQLite connection manager
│   ├── schema.sql                 # Database schema (6 tables)
│   ├── swachh_vayu.db             # Pre-seeded database
│   ├── routes/                    # 11 API blueprint modules
│   │   ├── aqi_routes.py          # Sensor data ingestion & retrieval
│   │   ├── node_routes.py         # Node CRUD operations
│   │   ├── alert_routes.py        # Alert management & broadcasting
│   │   ├── map_routes.py          # Geospatial data & heatmaps
│   │   ├── ranking_routes.py      # Village leaderboard
│   │   ├── prediction_routes.py   # ML prediction endpoints
│   │   ├── agri_routes.py         # Agricultural advisory API
│   │   ├── sarvam_routes.py       # Translation & voice API
│   │   ├── auth_routes.py         # Registration & JWT login
│   │   ├── language_routes.py     # Language management
│   │   └── health_routes.py       # System health checks
│   ├── services/                  # Business logic layer
│   │   ├── agri_intelligence_service.py  # Farm advisory engine (USP)
│   │   ├── prediction_service.py  # ML prediction engine
│   │   ├── sarvam_service.py      # Sarvam AI client
│   │   ├── aqi_service.py         # AQI data processing
│   │   ├── alert_service.py       # Alert engine with cooldown
│   │   ├── node_service.py        # Node management
│   │   ├── ranking_service.py     # Village scoring algorithm
│   │   └── auth_service.py        # JWT authentication
│   ├── ml/
│   │   ├── train_model.py         # Model training pipeline
│   │   └── rf_model.pkl           # Trained Random Forest model
│   └── utils/                     # Security, logging, error handling
│
├── frontend/
│   └── src/
│       ├── App.jsx                # React Router (13 routes)
│       ├── pages/
│       │   ├── LandingPage.jsx         # Public landing with live stats
│       │   ├── UserDashboard.jsx       # Citizen dashboard (6 live polls)
│       │   ├── AdminDashboard.jsx      # Admin control center
│       │   ├── AgriAdvisory.jsx        # Farm advisory with gauges
│       │   ├── MeasuresPage.jsx        # Clean air checklist
│       │   ├── VillageRankings.jsx     # Podium leaderboard
│       │   ├── MapPage.jsx             # Interactive AQI map
│       │   ├── AlertsPage.jsx          # Alert center
│       │   └── LanguagePage.jsx        # Language + voice demo
│       ├── components/                 # Reusable UI components
│       ├── services/
│       │   ├── api.js                  # Axios API client
│       │   ├── auth.js                 # JWT auth service
│       │   └── i18n.js                 # 6-language translations
│       └── hooks/
│           └── usePolling.js           # Real-time data polling hook
│
├── hardware/
│   ├── esp8266_node/
│   │   └── esp8266_node.ino       # WiFi sensor node firmware
│   └── esp32_node/
│       └── esp32_node.ino         # LoRa-ready node firmware
│
└── Documentation/                 # 19 detailed project documents
```

---

## ⚡ Quick Start

### Backend

```bash
git clone https://github.com/H8rsh100/FloatingCoders.git
cd FloatingCoders
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r backend/requirements.txt
python backend/app.py             # Starts at http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                        # Starts at http://localhost:5173
```

### Hardware

1. Open `hardware/esp8266_node/esp8266_node.ino` in Arduino IDE
2. Install libraries: `ESP8266WiFi`, `LiquidCrystal_I2C`, `ESP8266HTTPClient`
3. Update WiFi credentials and Raspberry Pi IP address
4. Flash to ESP8266 NodeMCU
5. Wire: MQ135→A0, LEDs→D5/D6/D7, Buzzer→D4, LCD→I2C (D1/D2)

### Train ML Model

```bash
cd backend/ml
python train_model.py              # Generates rf_model.pkl
```

---

## 📊 Database

6 tables in SQLite — pre-seeded and ready to demo:

- **languages** — 10 Indian languages with native script names
- **users** — Villagers with language preference and alert mode
- **nodes** — IoT sensors with GPS coordinates and battery status
- **aqi_readings** — Time-series air quality data from each node
- **alerts** — SMS/voice alert delivery tracking
- **rankings** — Quarterly village leaderboard scores

---

## 🌍 Current Deployment

| Node | Village | District | Coordinates | Status |
|------|---------|----------|-------------|--------|
| NODE_01 | Khedgaon | Nashik Rural | 20.2115°N, 73.9632°E | 🟢 Active |
| NODE_02 | Pimpalgaon | Nashik Rural | 20.1585°N, 73.9850°E | 🟢 Active |

---

## 🔮 Future Roadmap

- LoRa Mesh Network — long-range communication for remote villages without WiFi
- PMS5003 PM2.5 Sensor — calibrated particulate matter sensing
- GSM Alert System — SIM800L for SMS/voice in regional languages
- Solar Power — zero-maintenance node deployment
- Mobile App — React Native with push notifications
- Government API Integration — CPCB/SAFAR data correlation

---

## 👥 Team FloatingCoders

Built with ❤️ for **Code2Change Hackathon** — solving real problems for rural India.

---

*🌱 Because every village deserves to breathe clean air and make informed farming decisions.*
