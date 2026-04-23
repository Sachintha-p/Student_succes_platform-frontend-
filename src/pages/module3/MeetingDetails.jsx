import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Module3Header from '../../components/Module3Header';
import DashboardAccessButton from '../../components/DashboardAccessButton';
import { ChevronLeft, Calendar, MapPin, Link as LinkIcon, CheckCircle, Loader2, AlertCircle, X, Plus } from 'lucide-react';

const MeetingDetails = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [meeting, setMeeting] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAvailability, setSubmittingAvailability] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [userAvailability, setUserAvailability] = useState(null);

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const [meetingRes, summaryRes] = await Promise.all([
        fetch(`http://localhost:8080/api/module3/meetings/${meetingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://localhost:8080/api/module3/meetings/${meetingId}/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (meetingRes.ok) {
        const meetingData = await meetingRes.json();
        setMeeting(meetingData.data);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(Array.isArray(summaryData.data) ? summaryData.data : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrors({ fetch: 'Failed to load meeting details' });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelection = (date) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  const handleSubmitAvailability = async () => {
    if (selectedDates.length === 0) {
      setErrors({ availability: 'Please select at least one available date' });
      return;
    }

    try {
      setSubmittingAvailability(true);
      const response = await fetch(`http://localhost:8080/api/module3/meetings/${meetingId}/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availableDates: selectedDates
        })
      });

      if (response.ok) {
        setSuccessMessage('Your availability has been submitted!');
        setUserAvailability(selectedDates);
        setErrors({});
        setTimeout(() => {
          fetchMeetingDetails();
        }, 1500);
      } else {
        setErrors({ submit: 'Failed to submit availability' });
      }
    } catch (err) {
      console.error("Error submitting availability:", err);
      setErrors({ submit: 'An error occurred' });
    } finally {
      setSubmittingAvailability(false);
    }
  };

  const handleFinalizeMeeting = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/module3/meetings/${meetingId}/finalize`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccessMessage('Meeting finalized successfully!');
        setTimeout(() => {
          fetchMeetingDetails();
        }, 1500);
      }
    } catch (err) {
      console.error("Error finalizing meeting:", err);
      setErrors({ finalize: 'Failed to finalize meeting' });
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFinalized = meeting?.finalDate !== null && meeting?.finalDate !== undefined;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#090e17]">
        <Sidebar />
        <main className="flex-1 ml-72 p-10 text-gray-300 font-sans flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#00d09c]" size={40} />
            <p className="text-gray-500 font-bold">Loading meeting...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-screen bg-[#090e17]">
        <Sidebar />
        <main className="flex-1 ml-72 p-10 text-gray-300 font-sans">
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold">Meeting not found</p>
            <button onClick={() => navigate('/module3-meetings')} className="mt-4 text-[#00d09c] hover:underline font-bold">
              Back to meetings
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#090e17] min-h-screen">
      <Module3Header />
      <DashboardAccessButton />
      
      <div className="flex pt-24">
        <Sidebar />

      <main className="flex-1 ml-72 p-10 text-gray-300 font-sans" style={{minHeight: '100vh'}}>
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/module3-meetings')}
            className="p-2 bg-[#121826] border border-gray-800 rounded-xl text-gray-400 hover:text-[#00d09c] transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-white tracking-tight">{meeting.title}</h2>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                isFinalized
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-[#00d09c]/10 text-[#00d09c] border-[#00d09c]/20'
              }`}>
                {isFinalized ? '✓ Finalized' : 'Pending'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Coordinate availability and finalize meeting time</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 bg-[#00d09c]/10 border border-[#00d09c]/50 text-[#00d09c] p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {errors.fetch && (
          <div className="mb-8 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-bold">{errors.fetch}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meeting Info Card */}
            <div className="bg-[#121826] border border-gray-800 rounded-[2rem] p-8">
              <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest mb-6">Meeting Information</h3>

              <div className="space-y-4">
                {isFinalized && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-400 font-bold text-sm mb-1">Final Meeting Time</p>
                    <p className="text-white text-lg font-bold flex items-center gap-2">
                      <Calendar size={20} className="text-green-400" />
                      {formatDateTime(meeting.finalDate)}
                    </p>
                  </div>
                )}

                {meeting.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-[#00d09c] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Location</p>
                      <p className="text-white font-bold">{meeting.location}</p>
                    </div>
                  </div>
                )}

                {meeting.meetingLink && (
                  <div className="flex items-start gap-3">
                    <LinkIcon size={20} className="text-[#00d09c] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Meeting Link</p>
                      <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-[#00d09c] font-bold hover:underline break-all">
                        {meeting.meetingLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Proposed Dates */}
            <div className="bg-[#121826] border border-gray-800 rounded-[2rem] p-8">
              <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest mb-6">
                {isFinalized ? 'Original Proposed Dates' : 'Select Your Available Dates'}
              </h3>

              {errors.availability && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  <p className="text-sm">{errors.availability}</p>
                </div>
              )}

              <div className="space-y-2">
                {meeting.proposedDates?.map((date, idx) => {
                  const voteCount = summary.find(s => new Date(s.date).getTime() === new Date(date).getTime())?.votes || 0;
                  const isSelected = selectedDates.includes(date);

                  return (
                    <div
                      key={idx}
                      onClick={() => !isFinalized && handleDateSelection(date)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#00d09c]/20 border-[#00d09c] text-[#00d09c]'
                          : 'bg-[#1a2130] border-gray-800 hover:border-[#00d09c]/50'
                      } ${isFinalized ? 'cursor-default opacity-70' : ''}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {!isFinalized && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#00d09c] border-[#00d09c]'
                              : 'border-gray-600'
                          }`}>
                            {isSelected && <CheckCircle size={16} className="text-gray-900" />}
                          </div>
                        )}
                        <span className="font-bold">{formatDateTime(date)}</span>
                      </div>
                      <span className="bg-[#00d09c]/10 text-[#00d09c] text-sm font-bold px-3 py-1 rounded-lg border border-[#00d09c]/20">
                        {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!isFinalized && (
                <button
                  onClick={handleSubmitAvailability}
                  disabled={submittingAvailability}
                  className="w-full mt-6 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {submittingAvailability ? 'Submitting...' : 'Submit My Availability'}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Consensus & Actions */}
          <div className="space-y-6">
            {/* Best Time */}
            {summary.length > 0 && (
              <div className="bg-[#121826] border border-gray-800 rounded-[2rem] p-6">
                <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Best Time (Most Votes)</h4>
                {summary && summary[0] && (
                  <div className="bg-[#00d09c]/10 border border-[#00d09c]/20 rounded-xl p-4 text-center">
                    <p className="text-white font-bold text-sm mb-2">{formatDateTime(summary[0].date)}</p>
                    <p className="text-[#00d09c] font-black text-2xl">{summary[0].votes}</p>
                    <p className="text-gray-500 text-xs mt-1">{summary[0].votes === 1 ? 'person' : 'people'} available</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="bg-[#121826] border border-gray-800 rounded-[2rem] p-6 space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Actions</h4>

              {!isFinalized && (
                <button
                  onClick={handleFinalizeMeeting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold transition-all text-sm"
                >
                  Finalize Meeting Time
                </button>
              )}

              <button
                onClick={() => navigate('/module3-meetings')}
                className="w-full bg-gray-800/50 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                Back to Meetings
              </button>
            </div>

            {/* Stats */}
            <div className="bg-[#121826] border border-gray-800 rounded-[2rem] p-6">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Responses</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Proposed Dates</span>
                  <span className="text-white font-bold">{meeting.proposedDates?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Responses Received</span>
                  <span className="text-[#00d09c] font-bold">{summary.length > 0 ? summary[0].votes : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default MeetingDetails;
