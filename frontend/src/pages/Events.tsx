import { useEffect, useState } from 'react';
import { Calendar, Filter, Search } from 'lucide-react';
import EventCard from '../components/EventCard';
import { Event, EventCategory, EventCategoryLabels } from '../types';
import { eventsApi } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsApi.list({
          page,
          limit: 9,
          category: selectedCategory || undefined,
        });

        if (response.success) {
          setEvents(response.data);
          setTotalPages(response.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, selectedCategory]);

  const filteredEvents = events.filter((event) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      event.title.marathi.toLowerCase().includes(search) ||
      event.title.english.toLowerCase().includes(search) ||
      event.description.marathi.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-dark mb-4 marathi">कार्यक्रम</h1>
          <p className="text-lg text-gray-600 marathi">
            मंदिरातील सर्व धार्मिक कार्यक्रम आणि उत्सवांची माहिती
          </p>
          <p className="text-gray-500">All temple events and festivals</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="कार्यक्रम शोधा... (Search events)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="input pl-10 pr-8 min-w-[200px]"
              >
                <option value="">सर्व प्रकार (All Types)</option>
                {Object.values(EventCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {EventCategoryLabels[cat].marathi}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  मागील
                </button>
                <span className="text-gray-600">
                  पृष्ठ {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  पुढील
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-600 mb-2 marathi">
              कोणताही कार्यक्रम सापडला नाही
            </h3>
            <p className="text-gray-500">No events found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
