from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum
import re

class DonationCategory(str, Enum):
    GENERAL = "GENERAL"  # सामान्य देणगी
    ANNA_DAAN = "ANNA_DAAN"  # अन्नदान
    GO_SEVA = "GO_SEVA"  # गोसेवा
    VIDYA_DAAN = "VIDYA_DAAN"  # विद्यादान
    AUSHADH_SEVA = "AUSHADH_SEVA"  # औषधसेवा
    TEMPLE_RENOVATION = "TEMPLE_RENOVATION"  # मंदिर जीर्णोद्धार
    FESTIVAL_SPONSOR = "FESTIVAL_SPONSOR"  # उत्सव प्रायोजकत्व
    DAILY_PUJA = "DAILY_PUJA"  # नित्य पूजा

class PaymentMethod(str, Enum):
    UPI = "UPI"
    CARD = "CARD"
    NETBANKING = "NETBANKING"
    CASH = "CASH"
    CHEQUE = "CHEQUE"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

# Marathi labels for categories
DONATION_CATEGORY_LABELS = {
    DonationCategory.GENERAL: {"marathi": "सामान्य देणगी", "english": "General Donation"},
    DonationCategory.ANNA_DAAN: {"marathi": "अन्नदान", "english": "Food Donation"},
    DonationCategory.GO_SEVA: {"marathi": "गोसेवा", "english": "Cow Service"},
    DonationCategory.VIDYA_DAAN: {"marathi": "विद्यादान", "english": "Education"},
    DonationCategory.AUSHADH_SEVA: {"marathi": "औषधसेवा", "english": "Medical Aid"},
    DonationCategory.TEMPLE_RENOVATION: {"marathi": "मंदिर जीर्णोद्धार", "english": "Temple Renovation"},
    DonationCategory.FESTIVAL_SPONSOR: {"marathi": "उत्सव प्रायोजकत्व", "english": "Festival Sponsorship"},
    DonationCategory.DAILY_PUJA: {"marathi": "नित्य पूजा", "english": "Daily Puja"},
}

class DonorInfo(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    address: Optional[str] = None
    panNumber: Optional[str] = None
    isAnonymous: bool = False

    @field_validator('panNumber')
    @classmethod
    def validate_pan(cls, v):
        if v:
            pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
            if not re.match(pattern, v.upper()):
                raise ValueError('Invalid PAN number format')
            return v.upper()
        return v

class DonationCreate(BaseModel):
    donor: DonorInfo
    category: DonationCategory
    subcategory: Optional[str] = None
    amount: float = Field(..., gt=0)
    inMemoryOf: Optional[str] = None
    occasion: Optional[str] = None
    receipt80G: bool = False

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v < 1:
            raise ValueError('Amount must be at least ₹1')
        return v

class DonationResponse(BaseModel):
    id: str
    donor: DonorInfo
    category: DonationCategory
    subcategory: Optional[str] = None
    amount: float
    currency: str = "INR"
    inMemoryOf: Optional[str] = None
    occasion: Optional[str] = None
    paymentMethod: Optional[PaymentMethod] = None
    paymentStatus: PaymentStatus
    transactionId: Optional[str] = None
    razorpayOrderId: Optional[str] = None
    receiptNumber: Optional[str] = None
    receipt80G: bool = False
    createdAt: datetime
    updatedAt: datetime

class CreateOrderRequest(BaseModel):
    donationId: str

class CreateOrderResponse(BaseModel):
    orderId: str
    amount: int  # in paise
    currency: str
    donationId: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    donationId: str
