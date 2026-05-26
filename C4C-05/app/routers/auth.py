from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import timedelta

from ..db import get_db
from ..models import User, AshaWorker, Patient
from ..schemas import UserCreate, UserLogin, Token, UserOut
from ..utils.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    result = await db.execute(select(User).where(User.phone == user_data.phone))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Phone already registered")

    # Create user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password=hashed_password,
        role=user_data.role.upper()
    )
    db.add(new_user)
    await db.flush()  # Flush to get the new_user.id

    # Create corresponding role record
    if new_user.role == "ASHA":
        asha_record = AshaWorker(user_id=new_user.id)
        db.add(asha_record)
    else:
        patient_record = Patient(user_id=new_user.id)
        db.add(patient_record)
        
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalars().first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "name": user.name,
    }
