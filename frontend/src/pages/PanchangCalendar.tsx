import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Star, Sun, Moon } from 'lucide-react';
import PanchangDisplay from '../components/PanchangDisplay';
import { PanchangData, Festival } from '../types';
import { panchangApi } from '../services/api';

const PanchangCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<PanchangData[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [monthResponse, festivalsResponse] = await Promise.all([
          panchangApi.getMonthly(year, month),
          panchangApi.getFestivals(year),
        ]);

        if (monthResponse.success) {
          setMonthData(monthResponse.data.days);
        }

        if (festivalsResponse.success) {
          setFestivals(festivalsResponse.data.festivals);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthNamesMarathi = [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ];

  const weekdays = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Build calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getPanchangForDay = (day: number): PanchangData | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthData.find(p => p.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
  };

  const isFestivalDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return festivals.some(f => f.date === dateStr);
  };

  const getFestivalForDay = (day: number): Festival | undefined => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return festivals.find(f => f.date === dateStr);
  };

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-2 marathi">पंचांग दिनदर्शिका</h1>
          <p className="text-gray-600">Hindu Panchang Calendar</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Month Navigation */}
              <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {monthNamesMarathi[month - 1]} {year}
                    </h2>
                    <p className="text-sm opacity-80">{monthNames[month - 1]}</p>
                  </div>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="mt-2 px-4 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors mx-auto block"
                >
                  आज
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {weekdays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-2 text-center text-sm font-medium ${
                      index === 0 ? 'text-error' : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading calendar...</p>
                </div>
              ) : (
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={index} className="p-2 h-24 bg-gray-50"></div>;
                    }

                    const panchang = getPanchangForDay(day);
                    const festival = getFestivalForDay(day);
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-2 h-24 border-b border-r cursor-pointer hover:bg-primary/5 transition-colors ${
                          isToday(day) ? 'bg-primary/10' : ''
                        } ${selectedDate === dateStr ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`font-bold ${
                              index % 7 === 0 ? 'text-error' : 'text-dark'
                            } ${isToday(day) ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}
                          >
                            {day}
                          </span>
                          {festival && (
                            <Star className="w-4 h-4 text-saffron fill-saffron" />
                          )}
                        </div>
                        {panchang && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500 truncate marathi">
                              {panchang.tithi.name}
                            </p>
                            {festival && (
                              <p className="text-xs text-saffron truncate marathi font-medium">
                                {festival.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary/10 rounded mr-2"></div>
                <span className="marathi">आज</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-saffron fill-saffron mr-2" />
                <span className="marathi">सण / उत्सव</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-error rounded-full mr-2"></div>
                <span className="marathi">रविवार</span>
              </div>
            </div>
          </div>

          {/* Sidebar - Selected Date Panchang */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg marathi">
              {selectedDate ? 'निवडलेली तारीख' : 'आजचे पंचांग'}
            </h3>
            <PanchangDisplay date={selectedDate || undefined} />

            {/* Upcoming Festivals */}
            <div className="card p-4">
              <h3 className="font-bold text-lg mb-4 marathi">आगामी सण</h3>
              <div className="space-y-3">
                {festivals
                  .filter(f => f.date >= new Date().toISOString().split('T')[0])
                  .slice(0, 5)
                  .map((festival, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedDate(festival.date)}
                    >
                      <div className="w-10 h-10 bg-saffron/10 rounded-lg flex items-center justify-center mr-3">
                        <Star className="w-5 h-5 text-saffron" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium marathi">{festival.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(festival.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanchangCalendar;
