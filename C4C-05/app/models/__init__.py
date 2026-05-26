from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table, Integer, Float, JSON
# SQLite does not have native UUID or ARRAY types. Use String for UUIDs and JSON for array-like data.
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from ..db import Base

# Association tables for many-to-many relationships
asha_languages = Table(
    "asha_languages",
    Base.metadata,
    Column("asha_id", String, ForeignKey("asha_workers.id"), primary_key=True),
    Column("language", String, primary_key=True),
)

asha_expertise = Table(
    "asha_expertise",
    Base.metadata,
    Column("asha_id", String, ForeignKey("asha_workers.id"), primary_key=True),
    Column("expertise", String, primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # USER, ASHA, ADMIN
    village = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    asha = relationship("AshaWorker", back_populates="user", uselist=False)
    patient = relationship("Patient", back_populates="user", uselist=False)

class AshaWorker(Base):
    __tablename__ = "asha_workers"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    availability = Column(Boolean, default=True)
    # languages and expertise are stored in association tables
    languages = relationship("AshaLanguage", back_populates="asha", cascade="all, delete-orphan")
    expertise = relationship("AshaExpertise", back_populates="asha", cascade="all, delete-orphan")
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    user = relationship("User", back_populates="asha")

class AshaLanguage(Base):
    __tablename__ = "asha_language_items"
    asha_id = Column(String, ForeignKey("asha_workers.id"), primary_key=True)
    language = Column(String, primary_key=True)
    asha = relationship("AshaWorker", back_populates="languages")

class AshaExpertise(Base):
    __tablename__ = "asha_expertise_items"
    asha_id = Column(String, ForeignKey("asha_workers.id"), primary_key=True)
    expertise = Column(String, primary_key=True)
    asha = relationship("AshaWorker", back_populates="expertise")

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    qualification = Column(String, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    availability = Column(Boolean, default=True)
    rating = Column(Float, nullable=True)
    experience = Column(Integer, nullable=True)  # years
    languages = Column(JSON, nullable=True)  # Store list of languages as JSON

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    risk_level = Column(String, nullable=True)
    diabetes_score = Column(Float, nullable=True)
    hypertension_score = Column(Float, nullable=True)
    user = relationship("User", back_populates="patient")
    visits = relationship("Visit", back_populates="patient")
    call_logs = relationship("CallLog", back_populates="patient")
    predictions = relationship("DiabetesPrediction", back_populates="patient")

class CallLog(Base):
    __tablename__ = "call_logs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    asha_id = Column(String, ForeignKey("asha_workers.id"), nullable=False)
    recording_url = Column(String, nullable=True)
    transcript = Column(String, nullable=True)
    summary = Column(String, nullable=True)
    duration = Column(Integer, nullable=True)  # seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="call_logs")
    asha = relationship("AshaWorker")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    response = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User")

class DiabetesPrediction(Base):
    __tablename__ = "diabetes_predictions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    input_data = Column(JSON, nullable=False)
    risk_percentage = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    recommendations = Column(JSON, nullable=True)  # Store list of recommendations as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="predictions")

class Visit(Base):
    __tablename__ = "visits"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    asha_id = Column(String, ForeignKey("asha_workers.id"), nullable=False)
    visit_date = Column(DateTime, nullable=False)
    notes = Column(String, nullable=True)
    follow_up_required = Column(Boolean, default=False)
    patient = relationship("Patient", back_populates="visits")
    asha = relationship("AshaWorker")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read_status = Column(Boolean, default=False)
    user = relationship("User")

# Export Base for migrations
from ..db import Base
