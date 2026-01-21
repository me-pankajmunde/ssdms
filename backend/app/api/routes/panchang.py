from fastapi import APIRouter, Query
from datetime import date, datetime
from typing import Optional

from app.services.panchang_service import panchang_service
from app.models.panchang import MARATHI_MONTHS

router = APIRouter()

@router.get("/today", response_model=dict)
async def get_today_panchang():
    """Get today's Panchang data"""
    today = date.today()
    panchang = panchang_service.get_panchang_for_date(today)

    return {
        "success": True,
        "data": panchang.model_dump()
    }

@router.get("/date/{date_str}", response_model=dict)
async def get_panchang_for_date(date_str: str):
    """Get Panchang for a specific date (YYYY-MM-DD)"""
    try:
        query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {
            "success": False,
            "error": "Invalid date format. Use YYYY-MM-DD"
        }

    panchang = panchang_service.get_panchang_for_date(query_date)

    return {
        "success": True,
        "data": panchang.model_dump()
    }

@router.get("/month/{year}/{month}", response_model=dict)
async def get_monthly_panchang(year: int, month: int):
    """Get Panchang for entire month"""
    if month < 1 or month > 12:
        return {
            "success": False,
            "error": "Month must be between 1 and 12"
        }

    if year < 2020 or year > 2030:
        return {
            "success": False,
            "error": "Year must be between 2020 and 2030"
        }

    days = panchang_service.get_monthly_panchang(year, month)

    # Get Marathi month name
    marathi_month = MARATHI_MONTHS[(month + 8) % 12]  # Approximate mapping

    return {
        "success": True,
        "data": {
            "year": year,
            "month": month,
            "marathiMonth": marathi_month,
            "days": [d.model_dump() for d in days]
        }
    }

@router.get("/festivals/{year}", response_model=dict)
async def get_annual_festivals(year: int):
    """Get all festivals for a year"""
    if year < 2024 or year > 2025:
        return {
            "success": False,
            "error": "Festival data available only for 2024-2025"
        }

    festivals = panchang_service.get_annual_festivals(year)

    return {
        "success": True,
        "data": {
            "year": year,
            "festivals": [f.model_dump() for f in festivals]
        }
    }

@router.get("/upcoming-ekadashis", response_model=dict)
async def get_upcoming_ekadashis(count: int = Query(5, ge=1, le=12)):
    """Get upcoming Ekadashi dates"""
    today = date.today()
    ekadashis = panchang_service.get_upcoming_ekadashis(today, count)

    return {
        "success": True,
        "data": [e.model_dump() for e in ekadashis]
    }

@router.get("/tithi-names", response_model=dict)
async def get_tithi_names():
    """Get all Tithi names"""
    from app.models.panchang import TITHI_NAMES

    return {
        "success": True,
        "data": {
            "shukla": [{"number": i+1, "name": TITHI_NAMES[i]} for i in range(14)] + [{"number": 15, "name": "पौर्णिमा"}],
            "krishna": [{"number": i+1, "name": TITHI_NAMES[i]} for i in range(14)] + [{"number": 15, "name": "अमावस्या"}]
        }
    }

@router.get("/nakshatra-names", response_model=dict)
async def get_nakshatra_names():
    """Get all Nakshatra names"""
    from app.models.panchang import NAKSHATRA_NAMES

    return {
        "success": True,
        "data": [{"number": i+1, "name": name} for i, name in enumerate(NAKSHATRA_NAMES)]
    }

@router.get("/marathi-months", response_model=dict)
async def get_marathi_months():
    """Get all Marathi month names"""
    return {
        "success": True,
        "data": [{"number": i+1, "name": name} for i, name in enumerate(MARATHI_MONTHS)]
    }
