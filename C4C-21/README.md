# JalRakshak: Groundwater Intelligence Ecosystem

A production-grade groundwater monitoring and intelligence ecosystem using IoT, AI, and modern web technologies.

## Monorepo Structure

- `hardware-firmware/`: ESP32 firmware for ultrasonic water level sensing and GSM transmission.
- `backend-core/`: FastAPI gateway for telemetry ingestion, communications (Twilio), and analytics.
- `ai-pipeline/`: MLOps pipeline for groundwater forecasting and anomaly detection.
- `frontend-ui/`: Antigravity-based web interface for rural and administrative users.

## Quick Start

1.  **Hardware**: Flash ESP32 using PlatformIO.
2.  **Infrastructure**: Run `docker-compose up -d`.
3.  **Backend**: `cd backend-core && pip install -r requirements.txt && python main.py`.
4.  **AI**: `cd ai-pipeline && pip install -r requirements.txt && python src/train.py`.
5.  **Frontend**: `cd frontend-ui && npm install && npm start`.

## CI/CD

Workflows are located in `.github/workflows/` for automated deployment.
