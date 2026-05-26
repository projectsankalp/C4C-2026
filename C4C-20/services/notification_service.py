"""
Notification service — stub for SMS/push alerts.
In production this would integrate with an SMS gateway (e.g. Twilio, MSG91).
"""
import time

_log: list = []  # In-memory log for demo

def notify_doctor(doctor_id: int, message: str) -> bool:
    """Notify a doctor about a high-risk patient."""
    _log.append({
        'type': 'doctor',
        'to': doctor_id,
        'message': message,
        'timestamp': time.time(),
    })
    print(f"[NOTIFY → Doctor {doctor_id}]: {message}")
    return True

def notify_patient(patient_id: int, message: str) -> bool:
    """Notify a patient (e.g. prescription ready)."""
    _log.append({
        'type': 'patient',
        'to': patient_id,
        'message': message,
        'timestamp': time.time(),
    })
    print(f"[NOTIFY → Patient {patient_id}]: {message}")
    return True

def sos_alert(patient_id: int, location: dict) -> dict:
    """
    SOS emergency alert.
    In production: calls emergency contact, nearest PHC, and ASHA supervisor.
    """
    alert = {
        'type': 'SOS',
        'patient_id': patient_id,
        'location': location,
        'timestamp': time.time(),
        'status': 'dispatched',
    }
    _log.append(alert)
    print(f"[SOS ALERT] Patient {patient_id} at {location}")
    return alert

def get_log() -> list:
    return _log
