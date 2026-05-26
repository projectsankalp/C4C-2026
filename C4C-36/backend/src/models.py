import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    trade = Column(String, nullable=True)
    otp = Column(String, nullable=True)
    otpExpiry = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    submissions = relationship("Submission", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    trade = Column(String, nullable=False)
    mediaUrl = Column(String, nullable=False)
    transcript = Column(String, nullable=True)
    aiScore = Column(Float, default=0.0)
    status = Column(String, default="pending") # pending → pending_admin (AI passed) → approved/rejected (admin)
    
    # Proxy submission fields
    candidateName = Column(String, nullable=True)
    candidatePhone = Column(String, nullable=True)
    candidateLocation = Column(String, nullable=True)
    
    createdAt = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    certificate = relationship("Certificate", back_populates="submission", uselist=False)

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    employerName = Column(String, nullable=False)
    employerPhone = Column(String, nullable=False)
    location = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    userId = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    submissionId = Column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    certCode = Column(String, unique=True, index=True, nullable=False)
    hash = Column(String, nullable=False)
    issuedAt = Column(DateTime, default=datetime.utcnow)
    skillScore = Column(Float, nullable=False)
    professionalismScore = Column(Float, nullable=False)

    user = relationship("User", back_populates="certificates")
    submission = relationship("Submission", back_populates="certificate")

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    passwordHash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    collegeProofUrl = Column(String, nullable=True)
    livePhotoUrl = Column(String, nullable=True)
    isApproved = Column(Boolean, default=False)
    volunteerCode = Column(String, unique=True, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    certifications = relationship("VolunteerCertification", back_populates="volunteer")

class VolunteerCertification(Base):
    __tablename__ = "volunteer_certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteerId = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    title = Column(String, nullable=False)
    hoursValue = Column(Integer, default=0)
    proofUrl = Column(String, nullable=True)
    certCode = Column(String, unique=True, nullable=False)
    issuedAt = Column(DateTime, default=datetime.utcnow)

    volunteer = relationship("Volunteer", back_populates="certifications")

class Validator(Base):
    __tablename__ = "validators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    passwordHash = Column(String, nullable=False)
    name = Column(String, nullable=False)
