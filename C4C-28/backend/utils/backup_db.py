import shutil
import os
from datetime import datetime

def backup_database():
    """
    Creates a timestamped backup of the SQLite database.
    Can be run as a standalone cron job on the Raspberry Pi.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(backend_dir, 'instance', 'swachh_vayu.sqlite')
    
    # If using absolute config or running from root, it might be in root
    if not os.path.exists(db_path):
        db_path = os.path.join(backend_dir, 'swachh_vayu.db')
        
    backup_dir = os.path.join(backend_dir, 'backups')
    
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return False
        
    timestamp = datetime.now().strftime('%Y_%m_%d_%H%M%S')
    backup_filename = f"backup_{timestamp}.db"
    backup_path = os.path.join(backup_dir, backup_filename)
    
    try:
        shutil.copy2(db_path, backup_path)
        print(f"Backup created successfully: {backup_path}")
        
        # Optional: Clean up old backups (keep last 7)
        backups = sorted([f for f in os.listdir(backup_dir) if f.startswith('backup_') and f.endswith('.db')])
        if len(backups) > 7:
            for old_backup in backups[:-7]:
                os.remove(os.path.join(backup_dir, old_backup))
                print(f"Removed old backup: {old_backup}")
                
        return True
    except Exception as e:
        print(f"Backup failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting database backup...")
    backup_database()
