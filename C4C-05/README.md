# Health Seva — AI-Powered Rural Healthcare Platform

Health Seva is an intelligent rural healthcare platform designed to assist ASHA workers in early diabetes and hypertension detection, patient monitoring, and healthcare accessibility in underserved villages.

The platform combines AI-based risk prediction, symptom analysis, digital patient records, doctor coordination, and chatbot assistance to improve preventive healthcare in rural communities.

---

# Problem Statement

Millions of people in rural India remain undiagnosed for diabetes and hypertension due to:

- Lack of regular health screening
- Limited healthcare infrastructure
- Low awareness about chronic diseases
- Delayed medical intervention
- Poor medical record management

ASHA workers often manage patient data manually, making patient monitoring and follow-up difficult.

---

# Our Solution

Health Seva provides a digital healthcare ecosystem that enables ASHA workers and rural users to efficiently manage healthcare activities.

## The platform includes:

- AI-based diabetes risk prediction
- Symptom-based health analysis
- Digital patient records
- ASHA activity monitoring
- Doctor lookup and appointment coordination
- AI chatbot support
- Secure authentication using JWT
- File upload support for medical reports and prescriptions

The system helps identify high-risk patients early and improves healthcare delivery in rural communities.

---

# Features

- User and ASHA registration/login
- JWT-based authentication
- AI chatbot support
- Diabetes risk prediction
- Doctor discovery
- Appointment coordination
- Upload and manage medical files
- User dashboard
- ASHA dashboard
- FastAPI backend
- SQLite database support

---

# Tech Stack

| Technology | Purpose |
|------------|---------|
| Python | Backend & AI Logic |
| FastAPI | Backend Framework |
| SQLite | Database |
| HTML/CSS/JavaScript | Frontend |
| JWT | Authentication |
| Uvicorn | ASGI Server |

---

# Project Structure

```text
stitch_health_seva_rural_platform/
├─ app/
│  ├─ main.py
│  ├─ routers/
│  ├─ models/
│  ├─ schemas.py
│  ├─ db.py
│  ├─ deps.py
│  ├─ config.py
│  └─ seed_data.py
│
├─ web/
│  ├─ index.html
│  ├─ login.html
│  ├─ signup-user.html
│  ├─ signup-asha.html
│  ├─ dashboard/
│  ├─ js/
│  └─ css/
│
├─ static/
│  └─ uploads/
│
├─ requirements.txt
├─ .venv/
└─ health_seva.db
```

---

# Quick Setup

## 1. Open PowerShell

Move to the project folder:

```powershell
cd "C:\Users\Rikisha Shetty\Downloads\Seva kendr\stitch_health_seva_rural_platform"
```

## 2. Create Virtual Environment

```powershell
python -m venv .venv
```

Activate the environment:

```powershell
.venv\Scripts\Activate.ps1
```

---

## 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

---

## 4. Run the Application

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 5. Open in Browser

```text
http://localhost:8000
```

---

# Main Pages

| Page | Description |
|------|-------------|
| `/` | Landing Page |
| `/signup-user.html` | User Registration |
| `/signup-asha.html` | ASHA Registration |
| `/login.html` | Login Page |
| `/dashboard/user.html` | User Dashboard |
| `/dashboard/asha.html` | ASHA Dashboard |

---

# API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/register` | Register USER or ASHA |
| POST | `/api/v1/auth/login` | Login and receive JWT |
| GET | `/api/v1/dashboard/user/me` | User dashboard data |
| GET | `/api/v1/dashboard/asha/me` | ASHA dashboard data |
| GET | `/api/v1/doctors` | List doctors |
| POST | `/api/v1/prediction` | Diabetes prediction |
| POST | `/api/v1/chat` | AI chatbot endpoint |

---

# AI Features

- Diabetes risk prediction
- Symptom-based health analysis
- AI chatbot assistance
- Preventive healthcare support
- Future-ready voice assistant integration

---

# Future Enhancements

- Multi-language voice assistant
- Offline mode for rural areas
- SMS health alerts
- Wearable health device integration
- Government health scheme integration
- Predictive analytics dashboard

---

# Screenshots

Add screenshots here for better presentation.

```text
screenshots/
├─ home.png
├─ dashboard.png
├─ prediction.png
└─ chatbot.png
```

Example:

```md
![Landing Page](screenshots/home.png)
```

---

# Documentation

FastAPI Swagger documentation:

```text
http://localhost:8000/docs
```

---

# Troubleshooting

## Virtual Environment Issues

If the server fails to start, ensure the virtual environment is activated.

---

## Uvicorn Path Issue

Use:

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

instead of directly using `uvicorn.exe`.

---

## Project Folder Moved

If the project folder location changes, recreate the virtual environment:

```powershell
python -m venv .venv
```

---

# Team

Developed by students of St. Joseph Engineering College.

- Rikisha Shetty
- Team Member 2
- Team Member 3

---

# Impact

Health Seva aims to improve preventive healthcare accessibility in rural India by empowering ASHA workers with AI-assisted healthcare tools for early disease detection and efficient patient monitoring.
