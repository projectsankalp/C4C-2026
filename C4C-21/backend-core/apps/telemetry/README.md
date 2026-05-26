# Telemetry Service

Handles raw data ingestion from ESP32 devices.
Data is validated using Pydantic schemas and stored in PostGIS.
Large-scale ingestion is offloaded to Celery workers.
