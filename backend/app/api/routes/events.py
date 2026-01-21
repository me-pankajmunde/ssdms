from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId

from app.core.database import get_database
from app.models.event import EventCreate, EventUpdate, EventResponse, EventStatus

router = APIRouter()

def event_helper(event) -> dict:
    """Convert MongoDB event to response format"""
    return {
        "id": str(event["_id"]),
        "title": event["title"],
        "description": event["description"],
        "eventType": event["eventType"],
        "category": event["category"],
        "startDate": event["startDate"],
        "endDate": event["endDate"],
        "startTime": event["startTime"],
        "endTime": event["endTime"],
        "isAllDay": event.get("isAllDay", False),
        "recurrence": event.get("recurrence", {}),
        "venue": event.get("venue", "मुख्य मंदिर"),
        "images": event.get("images", []),
        "requiresRegistration": event.get("requiresRegistration", False),
        "maxParticipants": event.get("maxParticipants"),
        "registrationDeadline": event.get("registrationDeadline"),
        "registrationFee": event.get("registrationFee", 0),
        "prasadAvailable": event.get("prasadAvailable", False),
        "sevaOptions": event.get("sevaOptions", []),
        "status": event.get("status", EventStatus.PUBLISHED),
        "isFeatured": event.get("isFeatured", False),
        "createdAt": event["createdAt"],
        "updatedAt": event["updatedAt"],
    }

@router.get("/", response_model=dict)
async def list_events(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    eventType: Optional[str] = None,
    status: Optional[str] = None,
    startDate: Optional[date] = None,
    endDate: Optional[date] = None,
    featured: Optional[bool] = None
):
    """List events with filters and pagination"""
    db = get_database()

    query = {}

    if category:
        query["category"] = category
    if eventType:
        query["eventType"] = eventType
    if status:
        query["status"] = status
    else:
        query["status"] = EventStatus.PUBLISHED

    if featured is not None:
        query["isFeatured"] = featured

    if startDate:
        query["startDate"] = {"$gte": datetime.combine(startDate, datetime.min.time())}
    if endDate:
        if "startDate" in query:
            query["startDate"]["$lte"] = datetime.combine(endDate, datetime.max.time())
        else:
            query["startDate"] = {"$lte": datetime.combine(endDate, datetime.max.time())}

    total = await db.events.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.events.find(query).sort("startDate", 1).skip(skip).limit(limit)
    events = await cursor.to_list(length=limit)

    return {
        "success": True,
        "data": [event_helper(event) for event in events],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }

@router.get("/upcoming", response_model=dict)
async def get_upcoming_events(days: int = Query(30, ge=1, le=365)):
    """Get upcoming events for next N days"""
    db = get_database()

    now = datetime.now()
    end_date = datetime.now().replace(hour=23, minute=59, second=59)
    end_date = end_date.replace(day=min(now.day + days, 28))  # Simplified

    query = {
        "status": EventStatus.PUBLISHED,
        "startDate": {"$gte": now, "$lte": end_date}
    }

    cursor = db.events.find(query).sort("startDate", 1).limit(20)
    events = await cursor.to_list(length=20)

    return {
        "success": True,
        "data": [event_helper(event) for event in events]
    }

@router.get("/featured", response_model=dict)
async def get_featured_events():
    """Get featured events"""
    db = get_database()

    query = {
        "status": EventStatus.PUBLISHED,
        "isFeatured": True,
        "startDate": {"$gte": datetime.now()}
    }

    cursor = db.events.find(query).sort("startDate", 1).limit(5)
    events = await cursor.to_list(length=5)

    return {
        "success": True,
        "data": [event_helper(event) for event in events]
    }

@router.get("/calendar/{year}/{month}", response_model=dict)
async def get_calendar_events(year: int, month: int):
    """Get events for a specific month (calendar view)"""
    db = get_database()

    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    query = {
        "status": EventStatus.PUBLISHED,
        "$or": [
            {"startDate": {"$gte": start_date, "$lt": end_date}},
            {"endDate": {"$gte": start_date, "$lt": end_date}},
            {"startDate": {"$lt": start_date}, "endDate": {"$gte": end_date}}
        ]
    }

    cursor = db.events.find(query).sort("startDate", 1)
    events = await cursor.to_list(length=100)

    return {
        "success": True,
        "data": [event_helper(event) for event in events],
        "month": month,
        "year": year
    }

@router.get("/{event_id}", response_model=dict)
async def get_event(event_id: str):
    """Get a specific event by ID"""
    db = get_database()

    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID")

    event = await db.events.find_one({"_id": ObjectId(event_id)})

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "success": True,
        "data": event_helper(event)
    }

@router.post("/", response_model=dict)
async def create_event(event: EventCreate):
    """Create a new event"""
    db = get_database()

    event_dict = event.model_dump()
    event_dict["createdAt"] = datetime.now()
    event_dict["updatedAt"] = datetime.now()

    result = await db.events.insert_one(event_dict)

    created_event = await db.events.find_one({"_id": result.inserted_id})

    return {
        "success": True,
        "data": event_helper(created_event),
        "message": "कार्यक्रम यशस्वीरित्या तयार केला (Event created successfully)"
    }

@router.put("/{event_id}", response_model=dict)
async def update_event(event_id: str, event: EventUpdate):
    """Update an event"""
    db = get_database()

    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID")

    update_data = {k: v for k, v in event.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.now()

    result = await db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    updated_event = await db.events.find_one({"_id": ObjectId(event_id)})

    return {
        "success": True,
        "data": event_helper(updated_event),
        "message": "कार्यक्रम अपडेट केला (Event updated)"
    }

@router.delete("/{event_id}", response_model=dict)
async def delete_event(event_id: str):
    """Delete an event"""
    db = get_database()

    if not ObjectId.is_valid(event_id):
        raise HTTPException(status_code=400, detail="Invalid event ID")

    result = await db.events.delete_one({"_id": ObjectId(event_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "success": True,
        "message": "कार्यक्रम हटवला (Event deleted)"
    }
