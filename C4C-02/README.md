# Andar AI

> ## Real-Time AI-Assisted Gait Analysis for Rural Healthcare  
> ### AI-Powered Mobility Risk Screening for Diabetic and Hypertensive Complications

---

## Problem Statement

### 3.5 Crore Undiagnosed Diabetic and Hypertensive Adults in Rural India

A significant portion of India’s rural population remains undiagnosed for diabetes and hypertension due to:

- Inadequate screening infrastructure
- Low awareness
- Delayed medical intervention
- Limited access to healthcare professionals

Chronic diabetic and hypertensive complications can contribute to:

- Neurological decline
- Reduced lower-limb coordination
- Balance instability
- Altered gait rhythm
- Long-term mobility impairment

Early mobility changes are often overlooked in underserved communities where advanced gait-analysis infrastructure and neurological testing are not easily accessible.

---

# Our Objective

Andar AI was developed to:

- Enable early mobility-risk screening
- Support preventive healthcare outreach
- Assist community health workers during rural screening programs
- Improve follow-up and mobility tracking
- Function effectively in low-resource environments
- Provide scalable, non-invasive movement analysis using only a camera

---

# Our Solution

## Low-Cost AI-Assisted Gait Monitoring

Andar AI is a real-time, camera-based gait analysis framework that uses:

- Computer Vision
- Biomechanics
- AI-Assisted Interpretation

to identify abnormal walking patterns associated with diabetic and hypertensive complications.

The framework tracks lower-limb movement patterns such as:

- Cadence
- Gait rhythm
- Movement variability
- Knee motion
- Walking stability

The system then generates an AI-assisted biomechanical interpretation report that may help identify mobility abnormalities requiring further medical evaluation.

> **Important:**  
> Andar AI is designed as an assistive screening and monitoring framework, not as a standalone medical diagnostic system.

---

# Why This Matters

Traditional gait-analysis systems often require:

- Motion-capture laboratories
- Wearable sensors
- Force plates
- Specialized neurological infrastructure

These systems are expensive and difficult to scale in rural healthcare environments.

Andar AI democratizes preliminary mobility analysis using:

- Only a camera
- AI-assisted gait analysis
- Lightweight software infrastructure

This enables scalable deployment in:

- Rural outreach programs
- Village health camps
- Community clinics
- Physiotherapy environments
- Preventive healthcare initiatives

---

# Rural Healthcare Workflow

A community health worker can use Andar AI during outreach programs or village health camps by simply positioning a camera in front of the patient during a short walking session.

## Workflow

1. Capture gait movement in real time
2. Extract lower-limb skeletal landmarks
3. Compute gait-related movement metrics
4. Generate mobility-risk summaries
5. Support preventive follow-up and referral recommendations

This creates a simple and scalable workflow for early mobility-risk observation in underserved communities.

---

# Key Features

- Real-time pose estimation using MediaPipe
- AI-assisted gait and mobility analysis
- Lower-limb landmark tracking
- Cadence and gait rhythm analysis
- Gait variability estimation
- Knee movement analysis
- Session logging and CSV export
- Automated biomechanical interpretation reports
- Lightweight deployment architecture
- Low-resource environment compatibility

---

# Technologies Used

## Backend
- Python
- OpenCV
- MediaPipe
- NumPy
- Pandas
- SciPy

## Frontend
- React
- Vite
- JavaScript
- HTML/CSS

## AI & Reporting
- Gemini LLM integration for biomechanical interpretation and reporting

---

# System Architecture

```text
Camera Feed
    ↓
MediaPipe Pose Estimation
    ↓
Landmark Extraction
    ↓
Biomechanical Analysis
    ↓
Gait Metric Computation
    ↓
AI-Assisted Interpretation
    ↓
Report Generation & Dashboard
```

---

# Current Capabilities

The current prototype supports:

- Real-time skeletal tracking
- Gait metric extraction
- Session logging
- AI-assisted biomechanical reporting

## Metrics Currently Analyzed

- Cadence
- Gait interval variability
- Knee range of motion
- Movement rhythm
- Walking consistency

---

# Current Development Stage

## IRTL 3–4  
### Functional Proof-of-Concept & Validation Stage

Current focus areas:

- Pipeline stability
- Metric validation
- Real-time movement analysis reliability

Future development aims to expand into:

- Advanced gait-event detection
- Larger validation studies
- Rehabilitation support
- Preventive diabetic mobility monitoring
- Broader mobility-risk analysis

---

# Demo Workflow

1. Start webcam or live camera feed
2. Patient walks naturally within camera view
3. System tracks lower-body movement in real time
4. Metrics are computed automatically
5. AI-assisted report is generated
6. Session data can be exported for monitoring and follow-up

---

# Project Structure

```text
backend/
│
├── acquisition/      # Camera and pose extraction
├── calibration/      # Spatial calibration logic
├── gait/             # Gait analytics and cadence logic
├── biomechanics/     # Movement computation and analysis
├── analysis/         # Session interpretation and reporting
├── intelligence/     # AI-assisted reasoning/report generation
├── storage/          # CSV and session management
│
frontend/
│
├── src/              # Dashboard and visualization
```

---

# How to Run

## Backend

```bash
pip install -r requirements.txt
python backend/main.py
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Team CARBON

> Developed as part of PROJECT SANKALP: CODE4CHANGE HACKATHON

## Team Members

### Jihad Haneefa Kasim (Team Leader)
- Vision alignment
- Architecture direction
- Project leadership

### Alan Vincent
- Prototype development
- Coding and implementation

### Deepak P S
- Research and literature review
- Theoretical support

### Aadarsh Harish
- Biomechanical analysis
- Research support

### Anirudh K
- Analytical evaluation
- Research contributions

---

# Vision

Our long-term vision is to build accessible computational mobility-analysis systems that support:

- Preventive healthcare
- Early mobility-risk screening
- AI-assisted movement analysis
- Rural healthcare outreach
- Low-resource healthcare accessibility

---

# Disclaimer

This project is a research and hackathon prototype intended for educational and experimental purposes only.

It is **not** a certified medical diagnostic device and should not be used as a replacement for professional clinical evaluation.

---

# Contact

For collaboration, deployment discussions, or feedback:

- Open an Issue
- Contact Team CARBON
