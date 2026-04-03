import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import DashboardAccessButton from '../../components/DashboardAccessButton';
import { Calendar, MapPin, Link as LinkIcon, Users, Loader2, Plus, ChevronRight, Clock, AlertCircle } from 'lucide-react';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupIdInput, setGroupIdInput] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('accessToken');

  // Auto-fetch all meetings on component mount
  useEffect(() => {
    fetchMyMeetings();
  }, []);

  const fetchMyMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:8080/api/module3/meetings/my`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const resData = await response.json();
        const meetingData = Array.isArray(resData.data) ? resData.data : [];
        setMeetings(meetingData);
      } else {
        setError('Failed to load meetings.');
        setMeetings([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Error loading meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:8080/api/module3/meetings/all`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const resData = await response.json();
        const meetingData = Array.isArray(resData.data) ? resData.data : [];
        setMeetings(meetingData);
      } else {
        setError('Failed to load all meetings.');
        setMeetings([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Error loading meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingsByGroup = async (groupId) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:8080/api/module3/meetings/group/${groupId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const resData = await response.json();
        const meetingData = Array.isArray(resData.data) ? resData.data : [];
        setMeetings(meetingData);
      } else {
        setError('Failed to load meetings. Check if group ID is correct.');
        setMeetings([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Error loading meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = () => {
    if (groupIdInput) {
      fetchMeetingsByGroup(groupIdInput);
    } else {
      fetchMyMeetings();
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFinalized = (meeting) => meeting.finalDate !== null;

  return (
    <div className="bg-[#090e17] min-h-screen">
      <DashboardAccessButton />
      
      <div className="flex">
        <Sidebar />

      <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Meeting Scheduler
              </h1>
              <p className="text-gray-400 text-lg font-medium">
                Coordinate group meetings and find the best time for everyone
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/module3-meetings/create'}
              className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(0,208,156,0.3)] active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> New Meeting
            </button>
          </div>
        </div>

        <div className="p-10 text-gray-300 font-sans">

        {/* Group ID Input */}
        <div className="mb-10 flex gap-3 max-w-sm">
          <input
            type="number"
            value={groupIdInput}
            onChange={(e) => setGroupIdInput(e.target.value)}
            placeholder="Enter Group ID"
            className="flex-1 bg-[#121826] border border-gray-800 hover:border-gray-700 focus:border-[#00d09c] rounded-lg py-3 px-4 text-white focus:outline-none transition-all shadow-lg"
          />
          <button
            onClick={handleSelectGroup}
            className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-6 rounded-lg font-bold transition-all active:scale-95 shadow-[0_6px_20px_rgba(0,208,156,0.3)]"
          >
            {groupIdInput ? 'Load Group' : 'Load All'}
          </button>
        </div>

        {error && (
          <div className="mb-10 bg-red-500/15 border border-red-500/40 text-red-400 p-5 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Meetings Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#00d09c]" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading meetings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.length > 0 ? (
              meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 transition-all shadow-lg flex flex-col overflow-hidden group hover:shadow-[0_15px_40px_rgba(0,208,156,0.1)]"
                >
                  <div className="p-6 pb-0">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border ${
                        isFinalized(meeting)
                          ? 'bg-green-500/15 text-green-400 border-green-500/30'
                          : 'bg-[#00d09c]/15 text-[#00d09c] border-[#00d09c]/30'
                      }`}>
                        {isFinalized(meeting) ? '✓ Finalized' : 'Pending'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-[#00d09c] transition-colors">
                      {meeting.title}
                    </h3>
                  </div>

                  <div className="px-6 py-4 space-y-3">
                    {isFinalized(meeting) && (
                      <div className="flex items-center gap-3 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-medium">
                        <Clock size={16} />
                        <span>{formatDateTime(meeting.finalDate)}</span>
                      </div>
                    )}

                    {!isFinalized(meeting) && (
                      <div className="text-sm text-gray-400">
                        <p className="font-bold mb-2.5">Proposed Dates:</p>
                        <div className="space-y-2">
                          {meeting.proposedDates?.slice(0, 2).map((date, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                              <Calendar size={14} className="text-[#00d09c] flex-shrink-0" />
                              {formatDateTime(date)}
                            </div>
                          ))}
                          {meeting.proposedDates?.length > 2 && (
                            <p className="text-[12px] text-gray-600 italic">+{meeting.proposedDates.length - 2} more dates</p>
                          )}
                        </div>
                      </div>
                    )}

                    {meeting.location && (
                      <div className="flex items-start gap-2 text-[12px] text-gray-400">
                        <MapPin size={14} className="text-gray-600 flex-shrink-0 mt-0.5" />
                        <span>{meeting.location}</span>
                      </div>
                    )}

                    {meeting.meetingLink && (
                      <div className="flex items-center gap-2 text-[12px] text-[#00d09c]">
                        <LinkIcon size={14} />
                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Join Meeting Link
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="p-6 pt-4 mt-auto">
                    <button
                      onClick={() => window.location.href = `/module3-meetings/${meeting.id}`}
                      className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(0,208,156,0.2)]"
                    >
                      View & Respond <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">No meetings scheduled yet</p>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
    </div>
  );
};

export default MeetingList;
