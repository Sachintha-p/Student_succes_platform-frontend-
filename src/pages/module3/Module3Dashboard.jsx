import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Module3Header from '../../components/Module3Header';
import { Calendar, Video, Briefcase, Loader2, Lock, AlertCircle, Users, MapPin, Clock, Tag, LogOut, Trash2, Edit, X, Save } from 'lucide-react';

const Module3Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [dashboardAdmin, setDashboardAdmin] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Meeting Edit Modal State
  const [isMeetingEditModalOpen, setIsMeetingEditModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState(false);

  // --- DASHBOARD LOGIN CHECK ---
  useEffect(() => {
    const checkDashboardAuth = async () => {
      try {
        setIsAuthLoading(true);
        setAuthError('');

        const dashboardSession = localStorage.getItem('dashboardAdmin');
        
        if (!dashboardSession) {
          navigate('/module3-dashboard-login');
          return;
        }

        const session = JSON.parse(dashboardSession);
        
        if (!session.authenticated || !session.adminEmail) {
          localStorage.removeItem('dashboardAdmin');
          navigate('/module3-dashboard-login');
          return;
        }

        setDashboardAdmin(session);
      } catch (err) {
        console.error('Auth check error:', err);
        setAuthError('Session error. Please log in again.');
        localStorage.removeItem('dashboardAdmin');
        navigate('/module3-dashboard-login');
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkDashboardAuth();
  }, [navigate]);

  // --- FETCH DATA (ONLY IF AUTHENTICATED) ---
  useEffect(() => {
    if (dashboardAdmin) {
      fetchAllData();
    }
  }, [dashboardAdmin]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      const [eventsRes, meetingsRes, projectsRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/events/all', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch('http://localhost:8080/api/v1/meetings/all', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch('http://localhost:8080/api/v1/projects/all', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);

      if (eventsRes.ok) {
        const eventData = await eventsRes.json();
        setEvents(Array.isArray(eventData.data) ? eventData.data : []);
      }

      if (meetingsRes.ok) {
        const meetingData = await meetingsRes.json();
        setMeetings(Array.isArray(meetingData.data) ? meetingData.data : []);
      }

      if (projectsRes.ok) {
        const projectData = await projectsRes.json();
        setProjects(Array.isArray(projectData.data) ? projectData.data : []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboardAdmin');
    navigate('/module3-dashboard-login');
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/v1/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting event');
    }
  };

  const openEditModal = (event) => {
    setEditingEvent({ ...event });
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingEvent.title,
          description: editingEvent.description,
          eventDate: editingEvent.eventDate,
          venue: editingEvent.venue,
          category: editingEvent.category,
          maxAttendees: editingEvent.maxAttendees,
          isOnline: editingEvent.isOnline,
          isPublished: editingEvent.isPublished,
          organizerId: editingEvent.organizerId
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents(events.map(ev => ev.id === editingEvent.id ? updated.data : ev));
        setIsEditModalOpen(false);
      } else {
        const errData = await res.json();
        alert(`Update failed: ${errData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Error updating event');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMeeting = async (id, creatorId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;
    try {
      // Admin dashboard uses a fallback or session userId
      const dashboardSession = JSON.parse(localStorage.getItem('dashboardAdmin'));
      const adminId = dashboardSession?.adminId || creatorId; // Try to use admin's own ID if available

      const res = await fetch(`http://localhost:8080/api/v1/meetings/${id}?userId=${adminId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMeetings(meetings.filter(m => m.id !== id));
      } else {
        alert('Failed to delete meeting');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting meeting');
    }
  };

  const openMeetingEditModal = (meeting) => {
    setEditingMeeting({ ...meeting });
    setIsMeetingEditModalOpen(true);
  };

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    setIsUpdatingMeeting(true);
    try {
      const dashboardSession = JSON.parse(localStorage.getItem('dashboardAdmin'));
      const adminId = dashboardSession?.adminId || editingMeeting.createdById;

      const res = await fetch(`http://localhost:8080/api/v1/meetings/${editingMeeting.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: adminId,
          groupId: editingMeeting.groupId,
          title: editingMeeting.title,
          proposedDates: editingMeeting.proposedDates,
          location: editingMeeting.location,
          meetingLink: editingMeeting.meetingLink
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setMeetings(meetings.map(m => m.id === editingMeeting.id ? updated.data : m));
        setIsMeetingEditModalOpen(false);
      } else {
        const errData = await res.json();
        alert(`Update failed: ${errData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Error updating meeting');
    } finally {
      setIsUpdatingMeeting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#090e17]">
      <Module3Header />

      <div className="pt-32">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#121826] to-[#1a2332] border-b border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white mb-3">
                My Dashboard
              </h1>
              <p className="text-gray-400 text-lg font-medium mb-4">
                Manage and view your created events, meetings, and projects
              </p>
              <div className="flex items-center gap-3 bg-[#00d09c]/10 border border-[#00d09c]/30 rounded-lg px-4 py-2 w-fit">
                <div className="w-2.5 h-2.5 bg-[#00d09c] rounded-full"></div>
                <span className="text-[#00d09c] font-bold text-sm">Logged in as: {dashboardAdmin?.adminEmail}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 px-6 py-3 rounded-xl transition-all border border-gray-800 hover:border-red-400/30 font-bold"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 mb-8 flex gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={20} />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-[#00d09c]" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading dashboard...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121826] rounded-2xl border border-gray-800 p-8 hover:border-[#00d09c]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Events</p>
                      <p className="text-4xl font-black text-[#00d09c] mt-2">{events.length}</p>
                    </div>
                    <Calendar className="text-[#00d09c]/30 size-12" />
                  </div>
                </div>

                <div className="bg-[#121826] rounded-2xl border border-gray-800 p-8 hover:border-[#00d09c]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Meetings</p>
                      <p className="text-4xl font-black text-[#00d09c] mt-2">{meetings.length}</p>
                    </div>
                    <Video className="text-[#00d09c]/30 size-12" />
                  </div>
                </div>

                <div className="bg-[#121826] rounded-2xl border border-gray-800 p-8 hover:border-[#00d09c]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Projects</p>
                      <p className="text-4xl font-black text-[#00d09c] mt-2">{projects.length}</p>
                    </div>
                    <Briefcase className="text-[#00d09c]/30 size-12" />
                  </div>
                </div>
              </div>

              {/* Events Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="text-[#00d09c]" size={28} />
                  <h2 className="text-3xl font-black text-white">Events ({events.length})</h2>
                </div>
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 transition-all p-6 hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-[#00d09c]/15 text-[#00d09c] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30">
                            {event.category || 'General'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(event)}
                              className="p-1.5 text-gray-400 hover:text-[#00d09c] transition-colors"
                              title="Edit Event"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={14} className="text-[#00d09c]" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          {!event.isOnline && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <MapPin size={14} className="text-[#00d09c]" />
                              <span>{event.venue || 'N/A'}</span>
                            </div>
                          )}
                          {event.isOnline && (
                            <div className="flex items-center gap-2 text-sm text-[#00d09c]">
                              <Users size={14} />
                              <span>Online Event</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {event.description || 'No description'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>Max Attendees: {event.maxAttendees || 'Unlimited'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800 py-16 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">No events created yet</p>
                  </div>
                )}
              </section>

              {/* Meetings Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Video className="text-[#00d09c]" size={28} />
                  <h2 className="text-3xl font-black text-white">Meetings ({meetings.length})</h2>
                </div>
                {meetings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 transition-all p-6 hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-[#00d09c]/15 text-[#00d09c] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30">
                            Meeting
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openMeetingEditModal(meeting)}
                              className="p-1.5 text-gray-400 hover:text-[#00d09c] transition-colors"
                              title="Edit Meeting"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMeeting(meeting.id, meeting.createdById)}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Meeting"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                          {meeting.title || 'Meeting'}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={14} className="text-[#00d09c]" />
                            <span>{formatDate(meeting.finalDate || (meeting.proposedDates && meeting.proposedDates[0]))}</span>
                          </div>
                          {meeting.meetingLink && (
                            <div className="flex items-center gap-2 text-sm text-[#00d09c]">
                              <Video size={14} />
                              <span>Online Meeting</span>
                            </div>
                          )}
                          {meeting.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <MapPin size={14} className="text-[#00d09c]" />
                              <span>{meeting.location}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {meeting.description || 'No description'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>Group ID: {meeting.groupId || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800 py-16 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">No meetings created yet</p>
                  </div>
                )}
              </section>

              {/* Projects Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="text-[#00d09c]" size={28} />
                  <h2 className="text-3xl font-black text-white">Projects ({projects.length})</h2>
                </div>
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 transition-all p-6 hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)] cursor-pointer"
                        onClick={() => navigate(`/module3-projects/${project.id}`)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2 flex-wrap">
                            <span className="bg-[#00d09c]/15 text-[#00d09c] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#00d09c]/30">
                              {project.status || 'Active'}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                          {project.name || project.title || 'Project'}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users size={14} className="text-[#00d09c]" />
                            <span>{project.teamMembers?.length || 0} team members</span>
                          </div>
                          {project.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock size={14} className="text-[#00d09c]" />
                              <span>Due: {formatDate(project.dueDate)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                          {project.description || 'No description'}
                        </p>
                        <button
                          onClick={() => navigate(`/module3-projects/${project.id}`)}
                          className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-2 rounded-lg font-bold transition-all text-sm active:scale-95"
                        >
                          View Kanban Board
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800 py-16 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-wider">No projects created yet</p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      {isEditModalOpen && editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121826] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a2332]">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Edit className="text-[#00d09c]" size={24} />
                Edit Event
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Event Title</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    rows="3"
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Event Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={editingEvent.eventDate ? editingEvent.eventDate.substring(0, 16) : ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, eventDate: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Venue / Link</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={editingEvent.maxAttendees || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, maxAttendees: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isOnlineEdit"
                    checked={editingEvent.isOnline}
                    onChange={(e) => setEditingEvent({ ...editingEvent, isOnline: e.target.checked })}
                    className="w-5 h-5 accent-[#00d09c]"
                  />
                  <label htmlFor="isOnlineEdit" className="text-gray-300 font-bold text-sm cursor-pointer">Online Event</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublishedEdit"
                    checked={editingEvent.isPublished}
                    onChange={(e) => setEditingEvent({ ...editingEvent, isPublished: e.target.checked })}
                    className="w-5 h-5 accent-[#00d09c]"
                  />
                  <label htmlFor="isPublishedEdit" className="text-gray-300 font-bold text-sm cursor-pointer">Published</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-800 text-gray-400 font-bold hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 font-black px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Meeting Modal */}
      {isMeetingEditModalOpen && editingMeeting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121826] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1a2332]">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Video className="text-[#00d09c]" size={24} />
                Edit Meeting
              </h2>
              <button
                onClick={() => setIsMeetingEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateMeeting} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Meeting Title</label>
                  <input
                    type="text"
                    required
                    value={editingMeeting.title}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Group ID</label>
                  <input
                    type="number"
                    required
                    value={editingMeeting.groupId}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, groupId: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Location</label>
                  <input
                    type="text"
                    value={editingMeeting.location || ''}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, location: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Meeting Link</label>
                  <input
                    type="text"
                    value={editingMeeting.meetingLink || ''}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, meetingLink: e.target.value })}
                    className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Proposed Dates</label>
                  <div className="space-y-3">
                    {editingMeeting.proposedDates.map((date, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="datetime-local"
                          required
                          value={date ? date.substring(0, 16) : ''}
                          onChange={(e) => {
                            const newDates = [...editingMeeting.proposedDates];
                            newDates[idx] = e.target.value;
                            setEditingMeeting({ ...editingMeeting, proposedDates: newDates });
                          }}
                          className="flex-1 bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDates = editingMeeting.proposedDates.filter((_, i) => i !== idx);
                            setEditingMeeting({ ...editingMeeting, proposedDates: newDates });
                          }}
                          className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditingMeeting({ 
                        ...editingMeeting, 
                        proposedDates: [...editingMeeting.proposedDates, new Date().toISOString().substring(0, 16)] 
                      })}
                      className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-gray-500 font-bold hover:border-[#00d09c] hover:text-[#00d09c] transition-all"
                    >
                      + Add Another Proposed Date
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMeetingEditModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-gray-800 text-gray-400 font-bold hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMeeting}
                  className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 font-black px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingMeeting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Module3Dashboard;
