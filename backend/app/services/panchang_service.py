"""
Panchang calculation service for Hindu calendar
Based on Maharashtra region (Shalivahana Shaka calendar)
"""

from datetime import date, datetime, timedelta
from typing import List, Optional
import math

from app.models.panchang import (
    PanchangData, TithiInfo, NakshatraInfo, YogaInfo, KaranaInfo,
    TimePeriod, FestivalInfo, MARATHI_WEEKDAYS, ENGLISH_WEEKDAYS,
    MARATHI_MONTHS, TITHI_NAMES, NAKSHATRA_NAMES
)

# Constants for calculations
SYNODIC_MONTH = 29.530588853  # Days in a lunar month
SIDEREAL_MONTH = 27.321661    # Days for moon to return to same nakshatra

# Maharashtra festivals for 2024-2025
MAHARASHTRA_FESTIVALS_2024_2025 = [
    {"date": "2024-04-09", "name": "गुढीपाडवा", "english": "Gudi Padwa", "month": "चैत्र", "tithi": "शु. प्रतिपदा"},
    {"date": "2024-04-17", "name": "राम नवमी", "english": "Ram Navami", "month": "चैत्र", "tithi": "शु. नवमी"},
    {"date": "2024-04-23", "name": "हनुमान जयंती", "english": "Hanuman Jayanti", "month": "चैत्र", "tithi": "शु. पौर्णिमा"},
    {"date": "2024-05-10", "name": "अक्षय्य तृतीया", "english": "Akshaya Tritiya", "month": "वैशाख", "tithi": "शु. तृतीया"},
    {"date": "2024-06-21", "name": "वट पौर्णिमा", "english": "Vat Purnima", "month": "ज्येष्ठ", "tithi": "शु. पौर्णिमा"},
    {"date": "2024-07-17", "name": "आषाढी एकादशी", "english": "Ashadhi Ekadashi", "month": "आषाढ", "tithi": "शु. एकादशी"},
    {"date": "2024-07-21", "name": "गुरु पौर्णिमा", "english": "Guru Purnima", "month": "आषाढ", "tithi": "शु. पौर्णिमा"},
    {"date": "2024-08-09", "name": "नाग पंचमी", "english": "Nag Panchami", "month": "श्रावण", "tithi": "शु. पंचमी"},
    {"date": "2024-08-19", "name": "रक्षाबंधन", "english": "Raksha Bandhan", "month": "श्रावण", "tithi": "शु. पौर्णिमा"},
    {"date": "2024-08-26", "name": "गोकुळाष्टमी", "english": "Gokulashtami", "month": "श्रावण", "tithi": "कृ. अष्टमी"},
    {"date": "2024-09-07", "name": "गणेश चतुर्थी", "english": "Ganesh Chaturthi", "month": "भाद्रपद", "tithi": "शु. चतुर्थी"},
    {"date": "2024-09-17", "name": "अनंत चतुर्दशी", "english": "Anant Chaturdashi", "month": "भाद्रपद", "tithi": "शु. चतुर्दशी"},
    {"date": "2024-10-03", "name": "नवरात्री प्रारंभ", "english": "Navratri Begins", "month": "आश्विन", "tithi": "शु. प्रतिपदा"},
    {"date": "2024-10-12", "name": "दसरा", "english": "Dussehra", "month": "आश्विन", "tithi": "शु. दशमी"},
    {"date": "2024-10-17", "name": "कोजागिरी पौर्णिमा", "english": "Kojagiri Purnima", "month": "आश्विन", "tithi": "शु. पौर्णिमा"},
    {"date": "2024-10-29", "name": "धनत्रयोदशी", "english": "Dhanteras", "month": "कार्तिक", "tithi": "कृ. त्रयोदशी"},
    {"date": "2024-11-01", "name": "लक्ष्मीपूजन", "english": "Lakshmi Pujan", "month": "कार्तिक", "tithi": "अमावस्या"},
    {"date": "2024-11-02", "name": "बलिप्रतिपदा", "english": "Bali Pratipada", "month": "कार्तिक", "tithi": "शु. प्रतिपदा"},
    {"date": "2024-11-03", "name": "भाऊबीज", "english": "Bhau Beej", "month": "कार्तिक", "tithi": "शु. द्वितीया"},
    {"date": "2024-11-12", "name": "तुलसी विवाह", "english": "Tulsi Vivah", "month": "कार्तिक", "tithi": "शु. एकादशी"},
    {"date": "2024-12-14", "name": "दत्त जयंती", "english": "Datta Jayanti", "month": "मार्गशीर्ष", "tithi": "शु. पौर्णिमा"},
    {"date": "2025-01-14", "name": "मकर संक्रांति", "english": "Makar Sankranti", "month": "पौष", "tithi": "-"},
    {"date": "2025-02-26", "name": "महाशिवरात्री", "english": "Mahashivratri", "month": "माघ", "tithi": "कृ. चतुर्दशी"},
    {"date": "2025-03-14", "name": "होळी", "english": "Holi", "month": "फाल्गुन", "tithi": "शु. पौर्णिमा"},
    {"date": "2025-03-18", "name": "रंगपंचमी", "english": "Rang Panchami", "month": "फाल्गुन", "tithi": "कृ. पंचमी"},
]

class PanchangService:
    """Service for calculating Panchang (Hindu calendar) data"""

    def __init__(self, latitude: float = 19.0760, longitude: float = 72.8777):
        """Initialize with location (default: Maharashtra)"""
        self.latitude = latitude
        self.longitude = longitude

    def get_panchang_for_date(self, query_date: date) -> PanchangData:
        """Get Panchang data for a specific date"""

        # Calculate basic info
        weekday = query_date.weekday()
        # Adjust weekday (Python: Monday=0, Hindu: Sunday=0)
        hindu_weekday = (weekday + 1) % 7

        # Calculate lunar day (simplified calculation)
        tithi = self._calculate_tithi(query_date)
        nakshatra = self._calculate_nakshatra(query_date)
        yoga = self._calculate_yoga(query_date)
        karana = self._calculate_karana(query_date)

        # Get Marathi month (simplified - based on Gregorian mapping)
        marathi_month_index = self._get_marathi_month_index(query_date)
        marathi_month = MARATHI_MONTHS[marathi_month_index]

        # Calculate Shaka year
        shaka_year = self._get_shaka_year(query_date)

        # Calculate sun/moon times (simplified)
        sunrise, sunset = self._calculate_sun_times(query_date)
        rahu_kaal = self._calculate_rahu_kaal(query_date, sunrise, sunset)

        # Check for special days
        is_ekadashi = tithi.number == 11
        is_purnima = tithi.number == 15 and tithi.paksha == "शुक्ल पक्ष"
        is_amavasya = tithi.number == 15 and tithi.paksha == "कृष्ण पक्ष"

        # Check for festivals
        festival, festival_english = self._get_festival(query_date)

        return PanchangData(
            date=query_date,
            weekday=MARATHI_WEEKDAYS[hindu_weekday],
            weekdayEnglish=ENGLISH_WEEKDAYS[hindu_weekday],
            marathiMonth=marathi_month,
            marathiYear=shaka_year,
            tithi=tithi,
            nakshatra=nakshatra,
            yoga=yoga,
            karana=karana,
            sunrise=sunrise,
            sunset=sunset,
            rahuKaal=rahu_kaal,
            isEkadashi=is_ekadashi,
            isPurnima=is_purnima,
            isAmavasya=is_amavasya,
            festival=festival,
            festivalEnglish=festival_english
        )

    def _calculate_tithi(self, query_date: date) -> TithiInfo:
        """Calculate tithi (lunar day) - simplified calculation"""
        # Reference new moon date
        reference_new_moon = date(2024, 1, 11)
        days_since = (query_date - reference_new_moon).days

        # Calculate position in lunar cycle
        lunar_day = (days_since % SYNODIC_MONTH) / SYNODIC_MONTH * 30

        # Determine tithi number (1-15) and paksha
        tithi_num = int(lunar_day % 15) + 1
        if tithi_num == 0:
            tithi_num = 15

        paksha = "शुक्ल पक्ष" if lunar_day < 15 else "कृष्ण पक्ष"

        # Get tithi name
        tithi_index = tithi_num - 1
        if tithi_num == 15:
            tithi_name = "पौर्णिमा" if paksha == "शुक्ल पक्ष" else "अमावस्या"
        else:
            tithi_name = TITHI_NAMES[tithi_index]

        return TithiInfo(
            name=tithi_name,
            paksha=paksha,
            number=tithi_num
        )

    def _calculate_nakshatra(self, query_date: date) -> NakshatraInfo:
        """Calculate nakshatra - simplified calculation"""
        reference_date = date(2024, 1, 1)
        days_since = (query_date - reference_date).days

        nakshatra_position = (days_since % SIDEREAL_MONTH) / SIDEREAL_MONTH * 27
        nakshatra_num = int(nakshatra_position) + 1
        if nakshatra_num > 27:
            nakshatra_num = 1

        return NakshatraInfo(
            name=NAKSHATRA_NAMES[nakshatra_num - 1],
            number=nakshatra_num
        )

    def _calculate_yoga(self, query_date: date) -> YogaInfo:
        """Calculate yoga - simplified"""
        yogas = ["विष्कुम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन",
                 "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड",
                 "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र",
                 "सिद्धि", "व्यतिपात", "वरीयान", "परिघ", "शिव",
                 "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म",
                 "ऐन्द्र", "वैधृति"]

        reference_date = date(2024, 1, 1)
        days_since = (query_date - reference_date).days
        yoga_index = days_since % 27

        return YogaInfo(name=yogas[yoga_index])

    def _calculate_karana(self, query_date: date) -> KaranaInfo:
        """Calculate karana - simplified"""
        karanas = ["बव", "बालव", "कौलव", "तैतिल", "गर",
                   "वणिज", "विष्टि", "शकुनि", "चतुष्पाद", "नाग", "किंस्तुघ्न"]

        reference_date = date(2024, 1, 1)
        days_since = (query_date - reference_date).days
        karana_index = (days_since * 2) % 11

        return KaranaInfo(name=karanas[karana_index])

    def _calculate_sun_times(self, query_date: date) -> tuple:
        """Calculate sunrise and sunset times (simplified)"""
        # Simplified calculation for Maharashtra region
        # Actual times vary by ±30 mins throughout the year

        day_of_year = query_date.timetuple().tm_yday

        # Approximate sunrise/sunset variation
        sunrise_hour = 6 + 0.5 * math.sin(2 * math.pi * (day_of_year - 80) / 365)
        sunset_hour = 18.5 - 0.5 * math.sin(2 * math.pi * (day_of_year - 80) / 365)

        sunrise_min = int((sunrise_hour % 1) * 60)
        sunset_min = int((sunset_hour % 1) * 60)

        sunrise = f"{int(sunrise_hour):02d}:{sunrise_min:02d}"
        sunset = f"{int(sunset_hour):02d}:{sunset_min:02d}"

        return sunrise, sunset

    def _calculate_rahu_kaal(self, query_date: date, sunrise: str, sunset: str) -> TimePeriod:
        """Calculate Rahu Kaal period"""
        # Rahu Kaal varies by weekday
        # Mon: 7:30-9:00, Tue: 15:00-16:30, Wed: 12:00-13:30
        # Thu: 13:30-15:00, Fri: 10:30-12:00, Sat: 9:00-10:30, Sun: 16:30-18:00

        weekday = query_date.weekday()
        rahu_times = {
            0: ("07:30", "09:00"),  # Monday
            1: ("15:00", "16:30"),  # Tuesday
            2: ("12:00", "13:30"),  # Wednesday
            3: ("13:30", "15:00"),  # Thursday
            4: ("10:30", "12:00"),  # Friday
            5: ("09:00", "10:30"),  # Saturday
            6: ("16:30", "18:00"),  # Sunday
        }

        start, end = rahu_times[weekday]
        return TimePeriod(start=start, end=end)

    def _get_marathi_month_index(self, query_date: date) -> int:
        """Get approximate Marathi month index"""
        # Simplified mapping (actual depends on lunar calendar)
        month_mapping = {
            1: 10, 2: 11, 3: 11, 4: 0, 5: 1, 6: 2,
            7: 3, 8: 4, 9: 5, 10: 6, 11: 7, 12: 9
        }
        return month_mapping.get(query_date.month, 0)

    def _get_shaka_year(self, query_date: date) -> int:
        """Get Shalivahana Shaka year"""
        # Shaka era starts 78 years after CE
        # New year starts around March-April
        shaka_year = query_date.year - 78
        if query_date.month < 4:
            shaka_year -= 1
        return shaka_year

    def _get_festival(self, query_date: date) -> tuple:
        """Get festival for the date if any"""
        date_str = query_date.strftime("%Y-%m-%d")

        for festival in MAHARASHTRA_FESTIVALS_2024_2025:
            if festival["date"] == date_str:
                return festival["name"], festival["english"]

        return None, None

    def get_monthly_panchang(self, year: int, month: int) -> List[PanchangData]:
        """Get Panchang for entire month"""
        days = []
        first_day = date(year, month, 1)

        # Get number of days in month
        if month == 12:
            last_day = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day = date(year, month + 1, 1) - timedelta(days=1)

        current = first_day
        while current <= last_day:
            days.append(self.get_panchang_for_date(current))
            current += timedelta(days=1)

        return days

    def get_annual_festivals(self, year: int) -> List[FestivalInfo]:
        """Get all festivals for a year"""
        festivals = []

        for festival in MAHARASHTRA_FESTIVALS_2024_2025:
            festival_date = datetime.strptime(festival["date"], "%Y-%m-%d").date()

            if festival_date.year == year:
                festivals.append(FestivalInfo(
                    date=festival_date,
                    name=festival["name"],
                    englishName=festival["english"],
                    marathiMonth=festival["month"],
                    tithi=festival["tithi"]
                ))

        return sorted(festivals, key=lambda x: x.date)

    def get_upcoming_ekadashis(self, from_date: date, count: int = 5) -> List[PanchangData]:
        """Get upcoming Ekadashi dates"""
        ekadashis = []
        current = from_date

        while len(ekadashis) < count:
            panchang = self.get_panchang_for_date(current)
            if panchang.isEkadashi:
                ekadashis.append(panchang)
            current += timedelta(days=1)

            # Safety limit
            if (current - from_date).days > 365:
                break

        return ekadashis


# Singleton instance
panchang_service = PanchangService()
