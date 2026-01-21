import { useEffect, useState } from 'react';
import { Sun, Moon, Clock, Star, Calendar } from 'lucide-react';
import { PanchangData } from '../types';
import { panchangApi } from '../services/api';

interface PanchangDisplayProps {
  compact?: boolean;
  date?: string;
}

const PanchangDisplay = ({ compact = false, date }: PanchangDisplayProps) => {
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPanchang = async () => {
      try {
        setLoading(true);
        const response = date
          ? await panchangApi.getByDate(date)
          : await panchangApi.getToday();

        if (response.success) {
          setPanchang(response.data);
        } else {
          setError('Failed to load Panchang data');
        }
      } catch (err) {
        setError('Failed to load Panchang data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPanchang();
  }, [date]);

  if (loading) {
    return (
      <div className="panchang-card animate-pulse">
        <div className="h-32 bg-primary/20 rounded"></div>
      </div>
    );
  }

  if (error || !panchang) {
    return (
      <div className="panchang-card text-center py-8 text-gray-500">
        <p>{error || 'No Panchang data available'}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="panchang-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">{panchang.weekdayEnglish}</p>
            <p className="font-bold text-lg marathi">{panchang.weekday}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{panchang.marathiMonth}</p>
            <p className="font-bold text-primary">शके {panchang.marathiYear}</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <span className="tithi-badge marathi">
            {panchang.tithi.paksha} {panchang.tithi.name}
          </span>
          <span className="nakshatra-badge marathi">
            {panchang.nakshatra.name}
          </span>
        </div>

        {panchang.festival && (
          <div className="mt-3 p-2 bg-saffron/20 rounded-lg">
            <p className="text-sm font-medium text-saffron marathi">
              🎉 {panchang.festival}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panchang-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/20">
        <div>
          <p className="text-sm text-gray-500">{panchang.weekdayEnglish}</p>
          <p className="text-2xl font-bold marathi">{panchang.weekday}</p>
          <p className="text-sm text-gray-600">{new Date(panchang.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 marathi">{panchang.marathiMonth} महिना</p>
          <p className="text-xl font-bold text-primary marathi">शके {panchang.marathiYear}</p>
        </div>
      </div>

      {/* Festival Banner */}
      {panchang.festival && (
        <div className="mb-4 p-3 bg-gradient-to-r from-saffron/20 to-primary/20 rounded-lg border border-saffron/30">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🎉</span>
            <div>
              <p className="font-bold text-saffron marathi">{panchang.festival}</p>
              <p className="text-sm text-gray-600">{panchang.festivalEnglish}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tithi & Nakshatra */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center text-gray-500 mb-1">
            <Moon className="w-4 h-4 mr-1" />
            <span className="text-xs">तिथी</span>
          </div>
          <p className="font-bold marathi">{panchang.tithi.name}</p>
          <p className="text-sm text-gray-600 marathi">{panchang.tithi.paksha}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center text-gray-500 mb-1">
            <Star className="w-4 h-4 mr-1" />
            <span className="text-xs">नक्षत्र</span>
          </div>
          <p className="font-bold marathi">{panchang.nakshatra.name}</p>
        </div>
      </div>

      {/* Yoga & Karana */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">योग</p>
          <p className="font-medium marathi">{panchang.yoga.name}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">करण</p>
          <p className="font-medium marathi">{panchang.karana.name}</p>
        </div>
      </div>

      {/* Sun & Moon Times */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center bg-white/50 rounded-lg p-3">
          <Sun className="w-5 h-5 text-primary mr-2" />
          <div>
            <p className="text-xs text-gray-500">सूर्योदय</p>
            <p className="font-bold">{panchang.sunrise}</p>
          </div>
        </div>
        <div className="flex items-center bg-white/50 rounded-lg p-3">
          <Sun className="w-5 h-5 text-saffron mr-2" />
          <div>
            <p className="text-xs text-gray-500">सूर्यास्त</p>
            <p className="font-bold">{panchang.sunset}</p>
          </div>
        </div>
      </div>

      {/* Rahu Kaal */}
      <div className="bg-error/10 rounded-lg p-3 border border-error/20">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-error mr-2" />
          <span className="text-sm text-error font-medium marathi">राहुकाळ</span>
        </div>
        <p className="font-bold text-error mt-1">
          {panchang.rahuKaal.start} - {panchang.rahuKaal.end}
        </p>
      </div>

      {/* Special Day Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {panchang.isEkadashi && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium marathi">
            एकादशी
          </span>
        )}
        {panchang.isPurnima && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium marathi">
            पौर्णिमा
          </span>
        )}
        {panchang.isAmavasya && (
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium marathi">
            अमावस्या
          </span>
        )}
      </div>
    </div>
  );
};

export default PanchangDisplay;
