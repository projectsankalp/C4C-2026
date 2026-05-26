from fastapi import APIRouter

from apps.telemetry.services import TelemetryService
from apps.alerts.services import AlertService

router = APIRouter()

@router.get("/")
async def get_alerts():

    latest_data = TelemetryService.get_latest_data()

    if not latest_data:
        return {
            "status": "error",
            "message": "No telemetry available"
        }

    telemetry = latest_data[0]

    alerts = AlertService.generate_alert(
        telemetry
    )

    return {
        "status": "success",
        "telemetry": telemetry,
        "alerts": alerts
    }