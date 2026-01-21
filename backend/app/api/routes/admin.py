from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional

from app.core.database import get_database
from app.api.routes.auth import get_current_user
from app.models.donation import PaymentStatus
from app.models.event import EventStatus

router = APIRouter()

async def require_admin(current_user: dict = Depends(get_current_user)):
    """Require admin role"""
    if current_user["role"] not in ["SUPER_ADMIN", "TEMPLE_MANAGER"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/dashboard", response_model=dict)
async def get_dashboard_stats(current_user: dict = Depends(require_admin)):
    """Get dashboard statistics"""
    db = get_database()

    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start.replace(day=1)

    # Today's donations
    today_donations = await db.donations.aggregate([
        {"$match": {
            "paymentStatus": PaymentStatus.SUCCESS,
            "createdAt": {"$gte": today_start}
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(length=1)

    # This week's donations
    week_donations = await db.donations.aggregate([
        {"$match": {
            "paymentStatus": PaymentStatus.SUCCESS,
            "createdAt": {"$gte": week_start}
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(length=1)

    # This month's donations
    month_donations = await db.donations.aggregate([
        {"$match": {
            "paymentStatus": PaymentStatus.SUCCESS,
            "createdAt": {"$gte": month_start}
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(length=1)

    # Upcoming events count
    upcoming_events = await db.events.count_documents({
        "status": EventStatus.PUBLISHED,
        "startDate": {"$gte": now}
    })

    # Today's events
    today_end = today_start + timedelta(days=1)
    today_events = await db.events.find({
        "status": EventStatus.PUBLISHED,
        "startDate": {"$gte": today_start, "$lt": today_end}
    }).to_list(length=10)

    # Recent donations (last 5)
    recent_donations = await db.donations.find({
        "paymentStatus": PaymentStatus.SUCCESS
    }).sort("createdAt", -1).limit(5).to_list(length=5)

    # Category-wise donations this month
    category_donations = await db.donations.aggregate([
        {"$match": {
            "paymentStatus": PaymentStatus.SUCCESS,
            "createdAt": {"$gte": month_start}
        }},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"total": -1}}
    ]).to_list(length=20)

    return {
        "success": True,
        "data": {
            "donations": {
                "today": {
                    "amount": today_donations[0]["total"] if today_donations else 0,
                    "count": today_donations[0]["count"] if today_donations else 0
                },
                "thisWeek": {
                    "amount": week_donations[0]["total"] if week_donations else 0,
                    "count": week_donations[0]["count"] if week_donations else 0
                },
                "thisMonth": {
                    "amount": month_donations[0]["total"] if month_donations else 0,
                    "count": month_donations[0]["count"] if month_donations else 0
                },
                "byCategory": [
                    {"category": d["_id"], "amount": d["total"], "count": d["count"]}
                    for d in category_donations
                ]
            },
            "events": {
                "upcoming": upcoming_events,
                "today": [
                    {
                        "id": str(e["_id"]),
                        "title": e["title"],
                        "startTime": e["startTime"],
                        "venue": e.get("venue", "मुख्य मंदिर")
                    }
                    for e in today_events
                ]
            },
            "recentDonations": [
                {
                    "id": str(d["_id"]),
                    "donor": d["donor"]["name"] if not d["donor"].get("isAnonymous") else "Anonymous",
                    "amount": d["amount"],
                    "category": d["category"],
                    "date": d["createdAt"].strftime("%d %b %Y")
                }
                for d in recent_donations
            ]
        }
    }

@router.get("/reports/donations", response_model=dict)
async def get_donation_report(
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    groupBy: str = Query("day", regex="^(day|week|month|category)$"),
    current_user: dict = Depends(require_admin)
):
    """Get donation reports"""
    db = get_database()

    # Parse dates
    if startDate:
        start = datetime.strptime(startDate, "%Y-%m-%d")
    else:
        start = datetime.now() - timedelta(days=30)

    if endDate:
        end = datetime.strptime(endDate, "%Y-%m-%d")
    else:
        end = datetime.now()

    match_stage = {
        "paymentStatus": PaymentStatus.SUCCESS,
        "createdAt": {"$gte": start, "$lte": end}
    }

    if groupBy == "day":
        group_id = {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}}
    elif groupBy == "week":
        group_id = {"$dateToString": {"format": "%Y-W%V", "date": "$createdAt"}}
    elif groupBy == "month":
        group_id = {"$dateToString": {"format": "%Y-%m", "date": "$createdAt"}}
    else:  # category
        group_id = "$category"

    pipeline = [
        {"$match": match_stage},
        {"$group": {
            "_id": group_id,
            "totalAmount": {"$sum": "$amount"},
            "count": {"$sum": 1},
            "avgAmount": {"$avg": "$amount"}
        }},
        {"$sort": {"_id": 1}}
    ]

    report_data = await db.donations.aggregate(pipeline).to_list(length=100)

    # Total summary
    total = await db.donations.aggregate([
        {"$match": match_stage},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]).to_list(length=1)

    return {
        "success": True,
        "data": {
            "report": [
                {
                    "period" if groupBy != "category" else "category": d["_id"],
                    "totalAmount": d["totalAmount"],
                    "count": d["count"],
                    "avgAmount": round(d["avgAmount"], 2)
                }
                for d in report_data
            ],
            "summary": {
                "totalAmount": total[0]["total"] if total else 0,
                "totalCount": total[0]["count"] if total else 0,
                "startDate": start.strftime("%Y-%m-%d"),
                "endDate": end.strftime("%Y-%m-%d")
            }
        }
    }

@router.get("/reports/events", response_model=dict)
async def get_events_report(
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    current_user: dict = Depends(require_admin)
):
    """Get events report"""
    db = get_database()

    # Parse dates
    if startDate:
        start = datetime.strptime(startDate, "%Y-%m-%d")
    else:
        start = datetime.now() - timedelta(days=30)

    if endDate:
        end = datetime.strptime(endDate, "%Y-%m-%d")
    else:
        end = datetime.now() + timedelta(days=30)

    # Events by category
    by_category = await db.events.aggregate([
        {"$match": {"startDate": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(length=20)

    # Events by status
    by_status = await db.events.aggregate([
        {"$match": {"startDate": {"$gte": start, "$lte": end}}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]).to_list(length=10)

    # Total events
    total = await db.events.count_documents({"startDate": {"$gte": start, "$lte": end}})

    return {
        "success": True,
        "data": {
            "byCategory": [{"category": d["_id"], "count": d["count"]} for d in by_category],
            "byStatus": [{"status": d["_id"], "count": d["count"]} for d in by_status],
            "total": total,
            "period": {
                "startDate": start.strftime("%Y-%m-%d"),
                "endDate": end.strftime("%Y-%m-%d")
            }
        }
    }

@router.get("/users", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(require_admin)
):
    """List all admin users"""
    if current_user["role"] != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Super admin access required")

    db = get_database()

    total = await db.users.count_documents({})
    skip = (page - 1) * limit

    users = await db.users.find({}).skip(skip).limit(limit).to_list(length=limit)

    return {
        "success": True,
        "data": [
            {
                "id": str(u["_id"]),
                "username": u["username"],
                "email": u["email"],
                "role": u["role"],
                "profile": u["profile"],
                "isActive": u.get("isActive", True),
                "lastLogin": u.get("lastLogin"),
                "createdAt": u["createdAt"]
            }
            for u in users
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }

@router.put("/users/{user_id}/toggle-status", response_model=dict)
async def toggle_user_status(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """Enable/disable a user"""
    if current_user["role"] != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Super admin access required")

    db = get_database()

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow disabling self
    if str(user["_id"]) == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot disable your own account")

    new_status = not user.get("isActive", True)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"isActive": new_status, "updatedAt": datetime.now()}}
    )

    return {
        "success": True,
        "message": f"User {'enabled' if new_status else 'disabled'} successfully"
    }
