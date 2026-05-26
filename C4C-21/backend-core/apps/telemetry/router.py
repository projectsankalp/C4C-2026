from fastapi import APIRouter
from apps.telemetry.services import TelemetryService

router = APIRouter()

# Generate fake telemetry
@router.get("/simulate")
async def simulate_telemetry():

    generated_data = TelemetryService.generate_dummy_data()

    return {
        "status": "success",
        "message": "Telemetry simulated successfully",
        "data": generated_data
    }

# Get latest telemetry
@router.get("/latest")
async def latest_telemetry():

    return {
        "status": "success",
        "data": TelemetryService.get_latest_data()
    }

# Get telemetry history
@router.get("/history")
async def telemetry_history():

    return {
        "status": "success",
        "count": len(TelemetryService.get_history()),
        "data": TelemetryService.get_history()
    }