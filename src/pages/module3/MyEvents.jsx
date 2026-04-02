import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Module3Header from '../../components/Module3Header';
import DashboardAccessButton from '../../components/DashboardAccessButton';
import { Calendar, MapPin, Users, Clock, Loader2, ChevronRight } from 'lucide-react';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/events/joined', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const resData = await response.json();
        const eventData = Array.isArray(resData.data) ? resData.data : [];
        setEvents(eventData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const upcomingEvents = events.filter(e => isUpcoming(e.eventDate));
  const pastEvents = events.filter(e => !isUpcoming(e.eventDate));

  return (
    <div className="bg-[#090e17] text-gray-300 font-sans min-h-screen">
      <Module3Header />
      <DashboardAccessButton />
      
      <div className="flex pt-24">
        <Sidebar />

      <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            My Events
          </h1>
          <p className="text-gray-400 text-lg font-medium">
            Events you've registered to attend
          </p>
        </div>

        <div className="p-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#00d09c]" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading your events...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-[#00d09c]" size={24} />
                <h3 className="text-2xl font-black text-white">Upcoming Events</h3>
                <span className="bg-[#00d09c]/15 text-[#00d09c] text-[10px] font-black px-3 py-1.5 rounded-full border border-[#00d09c]/30">
                  {upcomingEvents.length}
                </span>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 transition-all overflow-hidden shadow-lg group hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                    >
                      <div className="p-6 pb-0">
                        <span className="bg-[#00d09c]/15 text-[#00d09c] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30 inline-block mb-3">
                          {event.category || 'General'}
                        </span>
                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#00d09c] transition-colors">
                          {event.title}
                        </h3>
                      </div>

                      <div className="px-6 py-3 space-y-2.5">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <Calendar size={16} className="text-[#00d09c] flex-shrink-0" />
                          <span className="font-medium">{formatDate(event.eventDate)}</span>
                        </div>

                        {!event.isOnline && (
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <MapPin size={16} className="text-[#00d09c] flex-shrink-0" />
                            <span className="font-medium">{event.venue}</span>
                          </div>
                        )}

                        {event.isOnline && (
                          <div className="flex items-center gap-3 text-sm text-[#00d09c] font-medium">
                            <Users size={16} className="flex-shrink-0" />
                            <span>Online Event</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 pt-4 mt-auto">
                        <button className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(0,208,156,0.2)]">
                          ✓ Going
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800">
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">No upcoming events registered</p>
                </div>
              )}
            </section>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="text-gray-600" size={24} />
                  <h3 className="text-2xl font-black text-white">Past Events</h3>
                  <span className="bg-gray-800/50 text-gray-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-gray-700/30">
                    {pastEvents.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-[#121826]/50 rounded-2xl border border-gray-800/30 p-6 hover:border-gray-800/50 transition-all group flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-white font-bold group-hover:text-gray-300 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">
                          {formatDate(event.eventDate)} • {event.category}
                        </p>
                      </div>
                      <span className="text-gray-600 text-sm font-bold">Attended</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
    </div>
  );
};

export default MyEvents;
