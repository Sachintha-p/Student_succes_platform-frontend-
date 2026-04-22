import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
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
    <div className="bg-slate-50 text-slate-600 font-sans min-h-screen">
      <DashboardAccessButton />
      
      <div className="flex">
        <Sidebar />

      <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-slate-200/50 px-10 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            My Events
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Events you've registered to attend
          </p>
        </div>

        <div className="p-10">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading your events...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-indigo-600" size={24} />
                <h3 className="text-2xl font-black text-slate-900">Upcoming Events</h3>
                <span className="bg-indigo-600/15 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full border border-[#00d09c]/30">
                  {upcomingEvents.length}
                </span>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500/50 transition-all overflow-hidden shadow-lg group hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                    >
                      <div className="p-6 pb-0">
                        <span className="bg-indigo-600/15 text-indigo-600 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30 inline-block mb-3">
                          {event.category || 'General'}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </h3>
                      </div>

                      <div className="px-6 py-3 space-y-2.5">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <Calendar size={16} className="text-indigo-600 flex-shrink-0" />
                          <span className="font-medium">{formatDate(event.eventDate)}</span>
                        </div>

                        {!event.isOnline && (
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <MapPin size={16} className="text-indigo-600 flex-shrink-0" />
                            <span className="font-medium">{event.venue}</span>
                          </div>
                        )}

                        {event.isOnline && (
                          <div className="flex items-center gap-3 text-sm text-indigo-600 font-medium">
                            <Users size={16} className="flex-shrink-0" />
                            <span>Online Event</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6 pt-4 mt-auto">
                        <button className="w-full bg-indigo-600 hover:bg-[#00e6ae] text-gray-900 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(0,208,156,0.2)]">
                          Ã¢Å“â€œ Going
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center bg-white/40 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">No upcoming events registered</p>
                </div>
              )}
            </section>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="text-gray-600" size={24} />
                  <h3 className="text-2xl font-black text-slate-900">Past Events</h3>
                  <span className="bg-gray-800/50 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-full border border-slate-300/30">
                    {pastEvents.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-white/50 rounded-2xl border border-slate-200/30 p-6 hover:border-slate-200/50 transition-all group flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-slate-900 font-bold group-hover:text-slate-600 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">
                          {formatDate(event.eventDate)} Ã¢â‚¬Â¢ {event.category}
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