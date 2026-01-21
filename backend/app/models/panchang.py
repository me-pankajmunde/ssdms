from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class TithiInfo(BaseModel):
    name: str  # "एकादशी"
    paksha: str  # "शुक्ल पक्ष" or "कृष्ण पक्ष"
    number: int  # 1-15
    endTime: Optional[datetime] = None

class NakshatraInfo(BaseModel):
    name: str  # "रोहिणी"
    number: int  # 1-27
    endTime: Optional[datetime] = None

class YogaInfo(BaseModel):
    name: str
    endTime: Optional[datetime] = None

class KaranaInfo(BaseModel):
    name: str
    endTime: Optional[datetime] = None

class TimePeriod(BaseModel):
    start: str  # "HH:MM"
    end: str  # "HH:MM"

class PanchangData(BaseModel):
    date: date
    weekday: str  # "सोमवार"
    weekdayEnglish: str  # "Monday"

    # Marathi month info
    marathiMonth: str  # "माघ"
    marathiYear: int  # Shaka year

    # Tithi
    tithi: TithiInfo

    # Nakshatra
    nakshatra: NakshatraInfo

    # Yoga and Karana
    yoga: YogaInfo
    karana: KaranaInfo

    # Sun/Moon times
    sunrise: str  # "06:45"
    sunset: str  # "18:30"
    moonrise: Optional[str] = None
    moonset: Optional[str] = None

    # Inauspicious times
    rahuKaal: TimePeriod
    yamaghanta: Optional[TimePeriod] = None
    gulikaKaal: Optional[TimePeriod] = None

    # Auspicious times
    abhijitMuhurat: Optional[TimePeriod] = None

    # Special day indicators
    isEkadashi: bool = False
    isPurnima: bool = False
    isAmavasya: bool = False
    isSankashtiChaturthi: bool = False
    isVinayakaChaturthi: bool = False

    # Festival if any
    festival: Optional[str] = None
    festivalEnglish: Optional[str] = None

class FestivalInfo(BaseModel):
    date: date
    name: str  # Marathi name
    englishName: str
    marathiMonth: str
    tithi: str
    description: Optional[str] = None
    isNationalHoliday: bool = False
    isMaharashtraHoliday: bool = False

class MonthlyPanchang(BaseModel):
    year: int
    month: int
    marathiMonth: str
    days: List[PanchangData]

class AnnualFestivals(BaseModel):
    year: int
    festivals: List[FestivalInfo]

# Marathi weekday names
MARATHI_WEEKDAYS = {
    0: "रविवार",
    1: "सोमवार",
    2: "मंगळवार",
    3: "बुधवार",
    4: "गुरुवार",
    5: "शुक्रवार",
    6: "शनिवार"
}

ENGLISH_WEEKDAYS = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
}

# Marathi months
MARATHI_MONTHS = [
    "चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ",
    "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक",
    "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"
]

# Tithi names
TITHI_NAMES = [
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी",
    "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
    "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पौर्णिमा/अमावस्या"
]

# Nakshatra names
NAKSHATRA_NAMES = [
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा",
    "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा",
    "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाती",
    "विशाखा", "अनुराधा", "ज्येष्ठा", "मूळ", "पूर्वाषाढा",
    "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शततारका", "पूर्वाभाद्रपदा",
    "उत्तराभाद्रपदा", "रेवती"
]
