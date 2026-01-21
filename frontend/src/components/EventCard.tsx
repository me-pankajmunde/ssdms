import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event, EventCategoryLabels } from '../types';

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

const categoryColors: Record<string, string> = {
  PUJA: '#9B59B6',
  UTSAV: '#E74C3C',
  KIRTAN: '#3498DB',
  PRAVACHAN: '#2ECC71',
  SEVA: '#F39C12',
};

const EventCard = ({ event, compact = false }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const categoryLabel = EventCategoryLabels[event.category];
  const categoryColor = categoryColors[event.category] || '#EAA636';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const weekdays = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  const dayOfWeek = weekdays[startDate.getDay()];

  if (compact) {
    return (
      <div className="card p-4 cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span
              className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white mb-2"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryLabel.marathi}
            </span>
            <h3 className="font-semibold text-dark mb-1 marathi">{event.title.marathi}</h3>
            <p className="text-sm text-gray-500">{event.title.english}</p>
          </div>
          <div className="text-right ml-4">
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold text-primary">{startDate.getDate()}</p>
              <p className="text-xs text-gray-500">
                {startDate.toLocaleDateString('mr-IN', { month: 'short' })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {event.startTime}
          </span>
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {event.venue}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="event-card">
      {/* Header with date */}
      <div
        className="event-card-header"
        style={{ background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)` }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 marathi">{dayOfWeek}</p>
            <p className="text-2xl font-bold">{formatDate(startDate)}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 marathi">
            {categoryLabel.marathi}
          </span>
        </div>
      </div>

      <div className="card-body p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-dark mb-1 marathi">{event.title.marathi}</h3>
        <p className="text-gray-500 mb-4">{event.title.english}</p>

        {/* Description */}
        {event.description.marathi && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 marathi">
            {event.description.marathi}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 text-primary mr-2" />
            <span className="text-dark">
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 text-primary mr-2" />
            <span className="text-dark marathi">{event.venue}</span>
          </div>
          {event.requiresRegistration && (
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 text-primary mr-2" />
              <span className="text-dark marathi">
                नोंदणी आवश्यक
                {event.maxParticipants && ` (कमाल ${event.maxParticipants} जण)`}
              </span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {event.prasadAvailable && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full marathi">
              प्रसाद उपलब्ध
            </span>
          )}
          {event.sevaOptions && event.sevaOptions.length > 0 && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full marathi">
              {event.sevaOptions.length} सेवा उपलब्ध
            </span>
          )}
          {event.isFeatured && (
            <span className="px-2 py-1 bg-saffron/10 text-saffron text-xs rounded-full marathi">
              विशेष कार्यक्रम
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link to={`/events/${event.id}`} className="flex-1">
            <button className="btn btn-outline w-full">
              <span className="marathi">अधिक माहिती</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
          {event.requiresRegistration && (
            <button className="btn btn-primary flex-1 marathi">
              नोंदणी करा
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
