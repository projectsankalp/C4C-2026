from hardware.gsm_sender import send_sms_via_gsm
from database import get_db

def attempt_delivery(alert_id, mobile_number, translated_message):
    """
    Attempts delivery of the translated message via GSM.
    Updates the delivery_status in the DB.
    """
    # GSM call
    success = send_sms_via_gsm(mobile_number, translated_message)
    
    status = 'delivered' if success else 'failed'
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE alerts SET delivery_status = ? WHERE id = ?', (status, alert_id))
    db.commit()
    
    return success
