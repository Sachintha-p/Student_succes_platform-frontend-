import { useState, useEffect } from 'react';
import Sidebar from '../../../../components/Sidebar';
import DashboardAccessButton from '../../../../components/DashboardAccessButton';
import { Search, Calendar, MapPin, Users, X, Loader2, Plus, Clock, Tag } from 'lucide-react';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, upcomingOnly]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (upcomingOnly) params.append('upcoming', 'true');

      const response = await fetch(`http://localhost:8080/api/v1/events?${params}`, {
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

  const handleRSVP = async (eventId, status) => {
    try {
      setRsvpLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setRsvpStatus(prev => ({
          ...prev,
          [eventId]: status
        }));
        alert('RSVP successful!');
      }
    } catch (err) {
      console.error("RSVP error:", err);
    } finally {
      setRsvpLoading(false);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(events.map(e => e.category).filter(Boolean))];

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

  return (
    <div className="bg-[#090e17] text-gray-300 font-sans min-h-screen">
      <DashboardAccessButton />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                  Campus Events
                </h1>
                <p className="text-gray-400 text-lg font-medium">
                  Discover and join exciting events happening around campus
                </p>
              </div>
              <button 
                onClick={() => window.location.href = '/module3/create-event'}
                className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(0,208,156,0.3)] active:scale-95 whitespace-nowrap"
              >
                <Plus size={20} /> Create Event
              </button>
            </div>
          </div>
        </div>

        <div className="p-10">
        

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search events by title or venue..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121826] border border-gray-800 hover:border-gray-700 focus:border-[#00d09c] rounded-xl py-3.5 pl-12 pr-6 text-white focus:outline-none transition-all shadow-lg placeholder:text-gray-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-10 flex-wrap">
          <div className="flex items-center gap-2 bg-[#121826] border border-gray-800 hover:border-gray-700 transition-all rounded-lg px-4 py-2.5">
            <Tag size={16} className="text-[#00d09c]" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-sm font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setUpcomingOnly(!upcomingOnly)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all border ${
              upcomingOnly 
                ? 'bg-[#00d09c] text-gray-900 border-[#00d09c] shadow-[0_4px_12px_rgba(0,208,156,0.2)]' 
                : 'bg-[#121826] text-gray-300 border-gray-800 hover:border-[#00d09c] hover:text-[#00d09c]'
            }`}
          >
            <Clock size={16} className="inline mr-2" />
            Upcoming Only
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#00d09c]" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 transition-all group shadow-lg flex flex-col justify-between overflow-hidden hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                >
                  <div>
                    <div className="p-6 pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <span className="bg-[#00d09c]/15 text-[#00d09c] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30 inline-block mb-3">
                            {event.category || 'General'}
                          </span>
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d09c] transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 space-y-3 mb-4">
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

                      {event.maxAttendees && (
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <Users size={16} className="text-[#00d09c] flex-shrink-0" />
                          <span className="font-medium">Max: {event.maxAttendees} attendees</span>
                        </div>
                      )}
                    </div>

                    <div className="px-6 mb-4">
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {event.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-3">
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="w-full bg-gray-800/60 hover:bg-gray-700/70 text-gray-300 py-2.5 rounded-lg font-bold transition-all text-sm active:scale-95"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRSVP(event.id, 'ATTENDING')}
                      disabled={rsvpLoading || rsvpStatus[event.id] === 'ATTENDING'}
                      className={`w-full py-2.5 rounded-lg font-black transition-all flex items-center justify-center text-sm active:scale-95 ${
                        rsvpStatus[event.id] === 'ATTENDING'
                          ? 'bg-[#00d09c]/20 text-[#00d09c] border border-[#00d09c]/40'
                          : 'bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 shadow-[0_6px_20px_rgba(0,208,156,0.3)]'
                      }`}
                    >
                      {rsvpStatus[event.id] === 'ATTENDING' ? '✓ RSVPed' : 'RSVP Now'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">No events found</p>
              </div>
            )}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#121826] w-full max-w-3xl rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#1a2130]/50">
                <div>
                  <p className="text-[#00d09c] font-black uppercase tracking-[0.3em] text-[9px] mb-1">Event Details</p>
                  <h3 className="text-xl font-black text-white">Event Information</h3>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)} 
                  className="p-2 bg-gray-800/50 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh] text-left">
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#090e17] rounded-2xl flex items-center justify-center border border-gray-800 text-[#00d09c]">
                      <Calendar size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedEvent.title}</h2>
                      <p className="text-gray-500 font-bold text-sm mt-1">{selectedEvent.category}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Description</h4>
                    <div className="bg-[#090e17] p-6 rounded-2xl border border-gray-800/50 shadow-inner">
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedEvent.description || 'No description provided'}
                      </p>
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    <section>
                      <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Date & Time</h4>
                      <div className="bg-[#090e17] p-4 rounded-2xl border border-gray-800/50">
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                          <Calendar size={16} className="text-[#00d09c]" />
                          {formatDate(selectedEvent.eventDate)}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Location</h4>
                      <div className="bg-[#090e17] p-4 rounded-2xl border border-gray-800/50">
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                          <MapPin size={16} className="text-[#00d09c]" />
                          {selectedEvent.isOnline ? 'Online' : selectedEvent.venue}
                        </p>
                      </div>
                    </section>
                  </div>

                  {selectedEvent.maxAttendees && (
                    <section>
                      <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Capacity</h4>
                      <div className="bg-[#090e17] p-4 rounded-2xl border border-gray-800/50">
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                          <Users size={16} className="text-[#00d09c]" />
                          Maximum {selectedEvent.maxAttendees} attendees
                        </p>
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <div className="p-8 border-t border-gray-800 bg-[#1a2130]/50 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Event Status</p>
                  <p className="text-white font-bold text-sm">{selectedEvent.isPublished ? '✓ Published' : 'Draft'}</p>
                </div>
                <button 
                  onClick={() => {
                    handleRSVP(selectedEvent.id, 'ATTENDING');
                    setSelectedEvent(null);
                  }}
                  disabled={rsvpLoading || rsvpStatus[selectedEvent.id] === 'ATTENDING'}
                  className={`px-10 py-3.5 rounded-xl font-black shadow-lg text-sm transition-all ${
                    rsvpStatus[selectedEvent.id] === 'ATTENDING'
                      ? 'bg-[#00d09c]/20 text-[#00d09c] border border-[#00d09c]/50'
                      : 'bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900'
                  }`}
                >
                  {rsvpStatus[selectedEvent.id] === 'ATTENDING' ? '✓ RSVPed' : 'Confirm RSVP'}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
    </div>
  );
};

export default EventList;
