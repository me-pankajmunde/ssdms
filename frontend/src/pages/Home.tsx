import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Users, Home as HomeIcon, ArrowRight, Star } from 'lucide-react';
import PanchangDisplay from '../components/PanchangDisplay';
import EventCard from '../components/EventCard';
import { Event, Festival } from '../types';
import { eventsApi, panchangApi } from '../services/api';

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, festivalsResponse] = await Promise.all([
          eventsApi.getUpcoming(30),
          panchangApi.getFestivals(new Date().getFullYear()),
        ]);

        if (eventsResponse.success) {
          setUpcomingEvents(eventsResponse.data.slice(0, 3));
        }

        if (festivalsResponse.success) {
          // Get next 5 festivals from current date
          const today = new Date().toISOString().split('T')[0];
          const upcoming = festivalsResponse.data.festivals
            .filter(f => f.date >= today)
            .slice(0, 5);
          setFestivals(upcoming);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const services = [
    {
      icon: HomeIcon,
      title: 'भक्तनिवास',
      titleEn: 'Guest Accommodation',
      description: 'भक्तांसाठी आरामदायी निवासाची सोय',
    },
    {
      icon: Users,
      title: 'अन्नछत्रालय',
      titleEn: 'Food Service',
      description: 'दररोज भक्तांना महाप्रसादाची सेवा',
    },
    {
      icon: Star,
      title: 'सुलभ दर्शन',
      titleEn: 'Easy Darshan',
      description: 'वृद्ध व अपंग भक्तांसाठी विशेष सोय',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-saffron/5 to-cream py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <p className="text-primary font-medium mb-2">🙏 जय श्री समर्थ</p>
              <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4 marathi">
                श्री समर्थ धोंडुतात्या
                <br />
                <span className="text-gradient">महाराज मंदिर</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6 marathi">
                डोंगरशेळकी गावातील पवित्र धार्मिक स्थळ. भक्तांसाठी आध्यात्मिक शांती आणि सेवेचे केंद्र.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/donate" className="btn btn-primary">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className="marathi">देणगी द्या</span>
                </Link>
                <Link to="/events" className="btn btn-outline">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="marathi">कार्यक्रम पहा</span>
                </Link>
              </div>
            </div>
            <div className="animate-slide-up">
              <PanchangDisplay />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title marathi">मंदिर सेवा</h2>
            <p className="section-subtitle">Temple Services</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="card p-6 text-center hover:shadow-temple transition-shadow">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-saffron rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2 marathi">{service.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{service.titleEn}</p>
                  <p className="text-gray-600 marathi">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title marathi">आगामी कार्यक्रम</h2>
              <p className="text-gray-600">Upcoming Events</p>
            </div>
            <Link to="/events" className="btn btn-outline">
              <span className="marathi">सर्व पहा</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="marathi">सध्या कोणताही कार्यक्रम नाही</p>
              <p className="text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Festivals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title marathi">आगामी सण</h2>
            <p className="section-subtitle">Upcoming Festivals</p>
          </div>

          {festivals.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {festivals.map((festival, index) => (
                <div key={index} className="panchang-card text-center">
                  <p className="text-sm text-gray-500">
                    {new Date(festival.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <h3 className="font-bold text-dark marathi mt-1">{festival.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{festival.englishName}</p>
                  <p className="text-xs text-primary marathi mt-2">{festival.tithi}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading festivals...</p>
          )}
        </div>
      </section>

      {/* Donation CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-saffron">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 marathi">
            मंदिर सेवेत सहभागी व्हा
          </h2>
          <p className="text-lg opacity-90 mb-8 marathi">
            आपल्या देणगीतून मंदिराच्या विविध सेवा-कार्यांना हातभार लावा
          </p>
          <Link to="/donate" className="btn bg-white text-primary hover:bg-gray-100">
            <Heart className="w-5 h-5 mr-2" />
            <span className="marathi">आता देणगी द्या</span>
          </Link>
        </div>
      </section>

      {/* Village Info */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="section-title marathi">डोंगरशेळकी गाव</h2>
              <p className="text-gray-600 mb-4">About Dongarshelsoki Village</p>
              <p className="text-gray-700 marathi mb-4">
                डोंगरशेळकी हे महाराष्ट्रातील एक पवित्र गाव आहे. या गावात श्री समर्थ धोंडुतात्या महाराजांचे प्रसिद्ध मंदिर आहे जे भक्तांसाठी आध्यात्मिक शांतीचे केंद्र आहे.
              </p>
              <p className="text-gray-700 marathi">
                गावातील लोक शेती आणि पारंपारिक व्यवसायावर अवलंबून आहेत. मंदिरात दररोज हजारो भक्त दर्शनासाठी येतात.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg mb-4 marathi">गावाची माहिती</h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600 marathi">राज्य</span>
                  <span className="font-medium marathi">महाराष्ट्र</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 marathi">मुख्य व्यवसाय</span>
                  <span className="font-medium marathi">शेती</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 marathi">प्रसिद्धी</span>
                  <span className="font-medium marathi">धोंडुतात्या मंदिर</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600 marathi">मुख्य सण</span>
                  <span className="font-medium marathi">यात्रा, पुण्यतिथी</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
