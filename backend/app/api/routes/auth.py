from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId

from app.core.database import get_database
from app.core.config import settings
from app.models.user import (
    UserCreate, UserLogin, UserResponse, Token, TokenData,
    ROLE_PERMISSIONS
)

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = get_database()
    user = await db.users.find_one({"username": username})

    if user is None:
        raise credentials_exception

    return user

def user_helper(user) -> dict:
    """Convert MongoDB user to response format"""
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "profile": user["profile"],
        "permissions": ROLE_PERMISSIONS.get(user["role"], {}).model_dump() if hasattr(ROLE_PERMISSIONS.get(user["role"], {}), 'model_dump') else {},
        "isActive": user.get("isActive", True),
        "lastLogin": user.get("lastLogin"),
        "createdAt": user["createdAt"]
    }

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    """Register a new admin user"""
    db = get_database()

    # Check if username exists
    existing = await db.users.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Check if email exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Create user
    user_dict = user.model_dump()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["isActive"] = True
    user_dict["createdAt"] = datetime.now()
    user_dict["updatedAt"] = datetime.now()

    result = await db.users.insert_one(user_dict)
    created = await db.users.find_one({"_id": result.inserted_id})

    return {
        "success": True,
        "data": user_helper(created),
        "message": "User registered successfully"
    }

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    db = get_database()

    # Find user
    user = await db.users.find_one({"username": form_data.username})

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    if not user.get("isActive", True):
        raise HTTPException(status_code=403, detail="User account is disabled")

    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLogin": datetime.now()}}
    )

    # Create token
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_helper(user)
        }
    }

@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "success": True,
        "data": user_helper(current_user)
    }

@router.post("/change-password", response_model=dict)
async def change_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    db = get_database()

    if not verify_password(current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "password": get_password_hash(new_password),
                "updatedAt": datetime.now()
            }
        }
    )

    return {
        "success": True,
        "message": "Password changed successfully"
    }

# Create default admin user on startup
async def create_default_admin():
    """Create default admin user if none exists"""
    db = get_database()

    admin_exists = await db.users.find_one({"role": "SUPER_ADMIN"})

    if not admin_exists:
        admin = {
            "username": "admin",
            "email": "admin@ssdms.temple",
            "password": get_password_hash("admin123"),  # Change in production!
            "role": "SUPER_ADMIN",
            "profile": {
                "name": "Temple Administrator",
                "designation": "मंदिर व्यवस्थापक"
            },
            "isActive": True,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        await db.users.insert_one(admin)
        print("✅ Default admin user created (username: admin, password: admin123)")
