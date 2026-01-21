from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def connect_db():
    """Connect to MongoDB"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db.db = db.client[settings.DATABASE_NAME]

    # Create indexes
    await create_indexes()
    print(f"✅ Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_db():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("❌ Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    # Events indexes
    await db.db.events.create_index([("startDate", 1), ("endDate", 1)])
    await db.db.events.create_index([("eventType", 1), ("status", 1)])
    await db.db.events.create_index([("category", 1)])

    # Donations indexes
    await db.db.donations.create_index([("createdAt", -1)])
    await db.db.donations.create_index([("donor.email", 1)])
    await db.db.donations.create_index([("category", 1), ("createdAt", -1)])
    await db.db.donations.create_index([("paymentStatus", 1)])
    await db.db.donations.create_index([("receiptNumber", 1)], unique=True, sparse=True)

    # Users indexes
    await db.db.users.create_index([("email", 1)], unique=True)
    await db.db.users.create_index([("username", 1)], unique=True)

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.db
