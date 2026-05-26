from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.config import settings

engine = create_engine(settings.sqlalchemy_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
