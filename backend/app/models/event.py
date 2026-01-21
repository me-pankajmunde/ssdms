from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

class EventType(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    ANNUAL = "ANNUAL"
    SPECIAL = "SPECIAL"

class EventCategory(str, Enum):
    PUJA = "PUJA"
    UTSAV = "UTSAV"
    KIRTAN = "KIRTAN"
    PRAVACHAN = "PRAVACHAN"
    SEVA = "SEVA"

class EventStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class RecurrenceType(str, Enum):
    NONE = "NONE"
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"

class BilingualText(BaseModel):
    marathi: str
    english: str = ""

class TithiBasedDate(BaseModel):
    tithi: str  # "एकादशी", "पौर्णिमा", etc.
    paksha: str  # "शुक्ल", "कृष्ण"
    month: Optional[str] = None  # Marathi month for annual events

class Recurrence(BaseModel):
    type: RecurrenceType = RecurrenceType.NONE
    daysOfWeek: List[int] = []  # 0-6 for Sunday-Saturday
    dayOfMonth: Optional[int] = None
    tithiBasedDate: Optional[TithiBasedDate] = None

class SevaOption(BaseModel):
    name: str
    amount: float
    description: str = ""

class EventBase(BaseModel):
    title: BilingualText
    description: BilingualText = BilingualText(marathi="", english="")
    eventType: EventType
    category: EventCategory
    startDate: datetime
    endDate: datetime
    startTime: str  # "06:00"
    endTime: str  # "08:00"
    isAllDay: bool = False
    recurrence: Recurrence = Recurrence()
    venue: str = "मुख्य मंदिर"
    images: List[str] = []
    requiresRegistration: bool = False
    maxParticipants: Optional[int] = None
    registrationDeadline: Optional[datetime] = None
    registrationFee: float = 0
    prasadAvailable: bool = False
    sevaOptions: List[SevaOption] = []
    status: EventStatus = EventStatus.PUBLISHED
    isFeatured: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[BilingualText] = None
    description: Optional[BilingualText] = None
    eventType: Optional[EventType] = None
    category: Optional[EventCategory] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    isAllDay: Optional[bool] = None
    recurrence: Optional[Recurrence] = None
    venue: Optional[str] = None
    images: Optional[List[str]] = None
    requiresRegistration: Optional[bool] = None
    maxParticipants: Optional[int] = None
    registrationDeadline: Optional[datetime] = None
    registrationFee: Optional[float] = None
    prasadAvailable: Optional[bool] = None
    sevaOptions: Optional[List[SevaOption]] = None
    status: Optional[EventStatus] = None
    isFeatured: Optional[bool] = None

class EventInDB(EventBase):
    id: str = Field(alias="_id")
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class EventResponse(EventBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
