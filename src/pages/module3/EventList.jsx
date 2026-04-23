import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import DashboardAccessButton from '../../components/DashboardAccessButton';
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
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventImage = (category, title) => {
    const cat = (category || title || '').toLowerCase();
    if (cat.includes('workshop')) return 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('hackathon') || cat.includes('tech')) return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('music') || cat.includes('concert')) return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('sport')) return 'https://images.unsplash.com/photo-1461896704190-321aa77a5c2e?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('seminar') || cat.includes('talk')) return 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800';
    if (cat.includes('exam')) return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800';
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="bg-slate-50 text-slate-600 font-sans min-h-screen">
      <DashboardAccessButton />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-72 p-10 text-left">
        <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Campus <span className="text-indigo-600">Events</span></h1>
            <p className="text-slate-400 font-medium italic text-lg">Curated experiences for the academic community.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-end gap-6">
            <button
               onClick={() => window.location.href = '/module3/create-event'}
               className="group flex items-center gap-4 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-5 rounded-[1.5rem] font-black transition-all active:scale-95 shadow-2xl"
            >
              <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> PUBLISH NEW EVENT
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative group flex-grow max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input type="text" placeholder="Search event titles, venues or descriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-5 pl-16 pr-8 text-sm text-slate-900 focus:border-indigo-500/40 outline-none transition-all shadow-xl shadow-slate-200/40 font-medium" />
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-xl shadow-slate-200/40 transition-all hover:border-indigo-100">
                <Tag size={16} className="text-indigo-600" />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent text-slate-900 focus:outline-none text-xs font-black uppercase tracking-widest outline-none border-none">
                  <option value="">ALL THEMES</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
             </div>

             <button onClick={() => setUpcomingOnly(!upcomingOnly)} className={`px-8 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all duration-300 shadow-xl shadow-slate-200/40 border ${upcomingOnly ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600'}`}>
                <Clock size={16} className="inline mr-2" /> UPCOMING FIRST
             </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500/50 transition-all group shadow-lg flex flex-col justify-between overflow-hidden hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                >
                  <div>
                    <div className="p-6 pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <span className="bg-indigo-600/15 text-indigo-600 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30 inline-block mb-3">
                            {event.category || 'General'}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 space-y-3 mb-4">
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

                      {event.maxAttendees && (
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <Users size={16} className="text-indigo-600 flex-shrink-0" />
                          <span className="font-medium">Max: {event.maxAttendees} attendees</span>
                        </div>
                      )}
                    </div>

                    <div className="px-6 mb-4">
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {event.description || 'No description provided'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-3">
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-lg font-bold transition-all text-sm active:scale-95"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRSVP(event.id, 'ATTENDING')}
                      disabled={rsvpLoading || rsvpStatus[event.id] === 'ATTENDING'}
                      className={`w-full py-2.5 rounded-lg font-black transition-all flex items-center justify-center text-sm active:scale-95 ${
                        rsvpStatus[event.id] === 'ATTENDING'
                          ? 'bg-indigo-600/20 text-indigo-600 border border-[#00d09c]/40'
                          : 'bg-indigo-600 hover:bg-[#00e6ae] text-gray-900 shadow-[0_6px_20px_rgba(0,208,156,0.3)]'
                      }`}
                    >
                      {rsvpStatus[event.id] === 'ATTENDING' ? 'Ã¢Å“â€œ RSVPed' : 'RSVP Now'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white/40 rounded-2xl border border-dashed border-slate-200">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">No events found</p>
              </div>
            )}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 text-left">
            <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto custom-scrollbar rounded-[3.5rem] border border-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-300">
               <div className="relative h-72 overflow-hidden">
                  <img src={getEventImage(selectedEvent.category, selectedEvent.title)} alt={selectedEvent.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                  <button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 p-3 bg-white/80 backdrop-blur-md text-slate-900 rounded-2xl shadow-xl hover:bg-white transition-all active:scale-90"><X size={24}/></button>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-12 pb-0">
                     <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-2 rounded-xl border border-indigo-100 uppercase tracking-[0.3em] shadow-sm mb-4 inline-block shadow-indigo-100">
                        {selectedEvent.category || 'THEME NOT DEFINED'}
                     </span>
                     <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{selectedEvent.title}</h2>
                  </div>
               </div>

               <div className="p-12 pt-10 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                     <div className="lg:col-span-2 space-y-10">
                        <section>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                              <Plus size={16} className="text-indigo-600" /> Operational Directives
                           </h4>
                           <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                              <p className="text-slate-500 text-lg leading-relaxed whitespace-pre-wrap font-medium italic">
                                 {selectedEvent.description || 'No official mission profile provided for this campus operation.'}
                              </p>
                           </div>
                        </section>
                     </div>

                     <div className="space-y-8">
                        <section>
                           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Synchronization</h4>
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                              <div className="flex items-start gap-4">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm"><Calendar size={20} className="text-indigo-600" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Date</p>
                                    <p className="text-slate-900 font-black text-sm italic">{formatDate(selectedEvent.eventDate)}</p>
                                 </div>
                              </div>
                              <div className="flex items-start gap-4">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm"><MapPin size={20} className="text-indigo-600" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vanguard Venue</p>
                                    <p className="text-slate-900 font-black text-sm italic line-clamp-1">{selectedEvent.isOnline ? 'Network Hub (Online)' : selectedEvent.venue}</p>
                                 </div>
                              </div>
                              <div className="flex items-start gap-4 pt-4 border-t border-slate-50">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm"><Users size={20} className="text-indigo-600" /></div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Asset Capacity</p>
                                    <p className="text-slate-900 font-black text-sm italic">{selectedEvent.maxAttendees ? `Max ${selectedEvent.maxAttendees} Agents` : 'Unlimited Personnel'}</p>
                                 </div>
                              </div>
                           </div>
                        </section>
                        
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</span>
                           <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[9px] font-black border border-emerald-100">
                             {selectedEvent.isPublished ? '✓ LIVE' : 'DRAFT'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => {
                        handleRSVP(selectedEvent.id, 'ATTENDING');
                        setSelectedEvent(null);
                      }}
                      disabled={rsvpLoading || rsvpStatus[selectedEvent.id] === 'ATTENDING'}
                      className={`w-full max-w-sm py-6 rounded-[2.5rem] font-black shadow-2xl transition-all active:scale-95 text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 ${
                        rsvpStatus[selectedEvent.id] === 'ATTENDING'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-900 hover:bg-indigo-600 text-white'
                      }`}
                    >
                      {rsvpStatus[selectedEvent.id] === 'ATTENDING' ? '✓ RSVP CONFIRMED' : 'RESERVE MY POSITION'}
                    </button>
                  </div>
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