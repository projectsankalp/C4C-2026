from src.database import SessionLocal
from src.models import Validator, Base
from src.database import engine
from src.core.security import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if validator already exists
    if not db.query(Validator).filter(Validator.email == "validator@nss.org").first():
        validator = Validator(
            email="validator@nss.org",
            passwordHash=get_password_hash("password123"),
            name="NSS Official"
        )
        db.add(validator)
        db.commit()
        print("Seed: Validator created.")
    else:
        print("Seed: Validator already exists.")
    
    db.close()

if __name__ == "__main__":
    seed()
