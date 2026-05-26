"""
JanAushadi prescription service.
JanAushadi = India's generic medicine initiative — prescriptions route to generic pharmacies.
"""
import json
import psycopg2.extras
from database.postgres import get_db_connection
from services.notification_service import notify_patient

JANAUSHADI_DRUGS = [
    'Amlodipine', 'Atenolol', 'Enalapril', 'Losartan', 'Metoprolol',
    'Ramipril', 'Hydrochlorothiazide', 'Nifedipine', 'Aspirin',
    'Metformin', 'Glibenclamide', 'Insulin', 'Paracetamol',
]

def create_prescription(visit_id: int, patient_id: int, doctor_id: int,
                        medicines: list, dosage: str, followup_date=None,
                        notes: str = '') -> dict:
    """
    Save a new prescription to the DB and notify the patient.

    medicines: list of {name, dose, frequency, duration}
    """
    # Flag if all medicines are JanAushadi generics
    is_jan = all(
        any(m['name'].lower() in j.lower() for j in JANAUSHADI_DRUGS)
        for m in medicines
    )

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO prescriptions
            (visit_id, patient_id, doctor_id, medicines, dosage_instructions,
             followup_date, notes, is_janaushadi)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """, (visit_id, patient_id, doctor_id, json.dumps(medicines),
          dosage, followup_date, notes, is_jan))
    prescription_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    notify_patient(patient_id, f"Your prescription #{prescription_id} is ready. Please collect from the nearest JanAushadi outlet.")

    # Auto-generate a signed redemption token for this prescription
    token_record = None
    try:
        from services.token_service import generate_prescription_token
        # Fetch the patient's village for outlet assignment
        conn2 = get_db_connection()
        cur2 = conn2.cursor()
        cur2.execute("SELECT village FROM patients WHERE id=%s", (patient_id,))
        village_row = cur2.fetchone()
        cur2.close()
        conn2.close()
        village = village_row[0] if village_row else ""
        token_record = generate_prescription_token(prescription_id, patient_id, village)
    except Exception as exc:
        print(f"[TokenService] Token generation warning: {exc}")

    return {
        'id': prescription_id,
        'is_janaushadi': is_jan,
        'token_id': token_record['token_id'] if token_record else None,
        'outlet_name': token_record['outlet_name'] if token_record else None,
    }

def get_patient_prescriptions(patient_id: int) -> list:
    """Fetch all prescriptions for a patient, newest first."""
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT pr.*, u.full_name as doctor_name
        FROM prescriptions pr
        JOIN users u ON u.id = pr.doctor_id
        WHERE pr.patient_id = %s
        ORDER BY pr.prescribed_at DESC
    """, (patient_id,))
    rows = [dict(r) for r in cur.fetchall()]
    cur.close()
    conn.close()
    return rows
