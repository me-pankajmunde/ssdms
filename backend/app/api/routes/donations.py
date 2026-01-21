from fastapi import APIRouter, HTTPException, Query, Request
from typing import Optional
from datetime import datetime, date
from bson import ObjectId
import hashlib
import hmac

from app.core.database import get_database
from app.core.config import settings
from app.models.donation import (
    DonationCreate, DonationResponse, CreateOrderRequest,
    CreateOrderResponse, VerifyPaymentRequest, PaymentStatus,
    DonationCategory, DONATION_CATEGORY_LABELS
)

router = APIRouter()

def donation_helper(donation) -> dict:
    """Convert MongoDB donation to response format"""
    return {
        "id": str(donation["_id"]),
        "donor": donation["donor"],
        "category": donation["category"],
        "subcategory": donation.get("subcategory"),
        "amount": donation["amount"],
        "currency": donation.get("currency", "INR"),
        "inMemoryOf": donation.get("inMemoryOf"),
        "occasion": donation.get("occasion"),
        "paymentMethod": donation.get("paymentMethod"),
        "paymentStatus": donation["paymentStatus"],
        "transactionId": donation.get("transactionId"),
        "razorpayOrderId": donation.get("razorpayOrderId"),
        "receiptNumber": donation.get("receiptNumber"),
        "receipt80G": donation.get("receipt80G", False),
        "createdAt": donation["createdAt"],
        "updatedAt": donation["updatedAt"],
    }

@router.get("/categories", response_model=dict)
async def get_donation_categories():
    """Get all donation categories with labels"""
    categories = []
    for cat in DonationCategory:
        labels = DONATION_CATEGORY_LABELS.get(cat, {"marathi": cat.value, "english": cat.value})
        categories.append({
            "value": cat.value,
            "marathi": labels["marathi"],
            "english": labels["english"]
        })

    return {
        "success": True,
        "data": categories
    }

@router.get("/", response_model=dict)
async def list_donations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    category: Optional[str] = None,
    startDate: Optional[date] = None,
    endDate: Optional[date] = None
):
    """List donations with filters (Admin)"""
    db = get_database()

    query = {}

    if status:
        query["paymentStatus"] = status
    if category:
        query["category"] = category

    if startDate:
        query["createdAt"] = {"$gte": datetime.combine(startDate, datetime.min.time())}
    if endDate:
        if "createdAt" in query:
            query["createdAt"]["$lte"] = datetime.combine(endDate, datetime.max.time())
        else:
            query["createdAt"] = {"$lte": datetime.combine(endDate, datetime.max.time())}

    total = await db.donations.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.donations.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    donations = await cursor.to_list(length=limit)

    # Calculate total for successful donations
    pipeline = [
        {"$match": {**query, "paymentStatus": PaymentStatus.SUCCESS}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_result = await db.donations.aggregate(pipeline).to_list(length=1)
    total_amount = total_result[0]["total"] if total_result else 0

    return {
        "success": True,
        "data": [donation_helper(d) for d in donations],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        },
        "summary": {
            "totalAmount": total_amount
        }
    }

@router.post("/", response_model=dict)
async def create_donation(donation: DonationCreate, request: Request):
    """Create a new donation (initiate payment)"""
    db = get_database()

    # Validate 80G requirement
    if donation.receipt80G and not donation.donor.panNumber:
        raise HTTPException(
            status_code=400,
            detail="80G पावतीसाठी PAN नंबर आवश्यक आहे (PAN number required for 80G receipt)"
        )

    donation_dict = donation.model_dump()
    donation_dict["paymentStatus"] = PaymentStatus.PENDING
    donation_dict["currency"] = "INR"
    donation_dict["createdAt"] = datetime.now()
    donation_dict["updatedAt"] = datetime.now()
    donation_dict["ipAddress"] = request.client.host if request.client else "unknown"
    donation_dict["userAgent"] = request.headers.get("user-agent", "unknown")

    result = await db.donations.insert_one(donation_dict)
    created = await db.donations.find_one({"_id": result.inserted_id})

    return {
        "success": True,
        "data": donation_helper(created),
        "message": "देणगी नोंदणी केली (Donation initiated)"
    }

@router.post("/create-order", response_model=dict)
async def create_razorpay_order(order_request: CreateOrderRequest):
    """Create Razorpay order for payment"""
    db = get_database()

    if not ObjectId.is_valid(order_request.donationId):
        raise HTTPException(status_code=400, detail="Invalid donation ID")

    donation = await db.donations.find_one({"_id": ObjectId(order_request.donationId)})

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation["paymentStatus"] == PaymentStatus.SUCCESS:
        raise HTTPException(status_code=400, detail="Payment already completed")

    # Create Razorpay order (mock for now - replace with actual Razorpay integration)
    try:
        # In production, use actual Razorpay SDK:
        # import razorpay
        # client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        # order = client.order.create({
        #     "amount": int(donation["amount"] * 100),
        #     "currency": "INR",
        #     "receipt": f"donation_{order_request.donationId}",
        # })

        # Mock order for development
        order_id = f"order_{ObjectId()}"

        # Update donation with order ID
        await db.donations.update_one(
            {"_id": ObjectId(order_request.donationId)},
            {
                "$set": {
                    "razorpayOrderId": order_id,
                    "updatedAt": datetime.now()
                }
            }
        )

        return {
            "success": True,
            "data": {
                "orderId": order_id,
                "amount": int(donation["amount"] * 100),  # in paise
                "currency": "INR",
                "donationId": order_request.donationId,
                "keyId": settings.RAZORPAY_KEY_ID
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.post("/verify", response_model=dict)
async def verify_payment(payment: VerifyPaymentRequest):
    """Verify Razorpay payment signature"""
    db = get_database()

    if not ObjectId.is_valid(payment.donationId):
        raise HTTPException(status_code=400, detail="Invalid donation ID")

    donation = await db.donations.find_one({"_id": ObjectId(payment.donationId)})

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    # Verify signature
    # In production, verify with actual Razorpay signature:
    # message = f"{payment.razorpay_order_id}|{payment.razorpay_payment_id}"
    # generated_signature = hmac.new(
    #     settings.RAZORPAY_KEY_SECRET.encode(),
    #     message.encode(),
    #     hashlib.sha256
    # ).hexdigest()
    # is_valid = hmac.compare_digest(generated_signature, payment.razorpay_signature)

    # For development, accept all payments
    is_valid = True

    if not is_valid:
        await db.donations.update_one(
            {"_id": ObjectId(payment.donationId)},
            {
                "$set": {
                    "paymentStatus": PaymentStatus.FAILED,
                    "updatedAt": datetime.now()
                }
            }
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

    # Generate receipt number
    year = datetime.now().year
    count = await db.donations.count_documents({
        "paymentStatus": PaymentStatus.SUCCESS,
        "createdAt": {"$gte": datetime(year, 1, 1)}
    })
    receipt_number = f"SSDM-{year}-{str(count + 1).zfill(5)}"

    # Update donation
    await db.donations.update_one(
        {"_id": ObjectId(payment.donationId)},
        {
            "$set": {
                "paymentStatus": PaymentStatus.SUCCESS,
                "razorpayPaymentId": payment.razorpay_payment_id,
                "transactionId": payment.razorpay_payment_id,
                "receiptNumber": receipt_number,
                "receiptGenerated": True,
                "updatedAt": datetime.now()
            }
        }
    )

    updated = await db.donations.find_one({"_id": ObjectId(payment.donationId)})

    return {
        "success": True,
        "data": donation_helper(updated),
        "message": "🙏 देणगी यशस्वीरित्या प्राप्त झाली! (Donation received successfully!)"
    }

@router.get("/{donation_id}", response_model=dict)
async def get_donation(donation_id: str):
    """Get donation details"""
    db = get_database()

    if not ObjectId.is_valid(donation_id):
        raise HTTPException(status_code=400, detail="Invalid donation ID")

    donation = await db.donations.find_one({"_id": ObjectId(donation_id)})

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    return {
        "success": True,
        "data": donation_helper(donation)
    }

@router.get("/{donation_id}/receipt", response_model=dict)
async def get_donation_receipt(donation_id: str):
    """Get donation receipt (for successful payments)"""
    db = get_database()

    if not ObjectId.is_valid(donation_id):
        raise HTTPException(status_code=400, detail="Invalid donation ID")

    donation = await db.donations.find_one({"_id": ObjectId(donation_id)})

    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if donation["paymentStatus"] != PaymentStatus.SUCCESS:
        raise HTTPException(status_code=400, detail="Receipt available only for successful payments")

    # Generate receipt data
    receipt = {
        "receiptNumber": donation.get("receiptNumber"),
        "date": donation["createdAt"].strftime("%d-%m-%Y"),
        "donor": donation["donor"],
        "amount": donation["amount"],
        "amountInWords": number_to_words(donation["amount"]),
        "category": DONATION_CATEGORY_LABELS.get(
            DonationCategory(donation["category"]),
            {"marathi": donation["category"], "english": donation["category"]}
        ),
        "paymentMethod": donation.get("paymentMethod", "Online"),
        "transactionId": donation.get("transactionId"),
        "temple": {
            "name": settings.TEMPLE_NAME,
            "location": settings.TEMPLE_LOCATION
        },
        "is80G": donation.get("receipt80G", False)
    }

    return {
        "success": True,
        "data": receipt
    }

def number_to_words(num: float) -> str:
    """Convert number to words (simplified)"""
    # Simplified implementation
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
    teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
             "Sixteen", "Seventeen", "Eighteen", "Nineteen"]

    num = int(num)
    if num == 0:
        return "Zero Rupees"

    result = ""

    if num >= 10000000:  # Crore
        result += ones[num // 10000000] + " Crore "
        num %= 10000000

    if num >= 100000:  # Lakh
        result += ones[num // 100000] + " Lakh "
        num %= 100000

    if num >= 1000:  # Thousand
        result += ones[num // 1000] + " Thousand "
        num %= 1000

    if num >= 100:
        result += ones[num // 100] + " Hundred "
        num %= 100

    if num >= 20:
        result += tens[num // 10] + " "
        num %= 10

    if num >= 10:
        result += teens[num - 10] + " "
        num = 0

    if num > 0:
        result += ones[num] + " "

    return result.strip() + " Rupees Only"
