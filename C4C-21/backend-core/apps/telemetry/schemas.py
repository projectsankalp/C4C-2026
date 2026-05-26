from pydantic import BaseModel

class TelemetryCreate(BaseModel):
    device_id: str
    water_level: float
    timestamp: str
