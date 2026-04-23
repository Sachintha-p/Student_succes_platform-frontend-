import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Users, CheckCircle, XCircle, Loader2, 
  Clock, ArrowLeft, Crown, MessageSquare, 
  Target, Sparkles, User 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8080';

const toast = (msg, type = 'success') => {
  const el = document.createElement('div');
  el.className = `fixed bottom-6 right-6 z-[999] px-6 py-4 rounded-2xl font-bold text-sm shadow-2xl transition-all ${
    type === 'success' ? 'bg-[#00d09c] text-gray-900' : 'bg-red-500 text-white'
  }`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

const formatDate = (dt) => {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Sub-component to handle profile review ("Balala") logic for each individual request.
 * It dynamically fetches match data from MatchingController.
 */
const RequestCard = ({ req, onAccept, onDecline, token, actionLoading }) => {
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    const fetchProfileMatch = async () => {
      setMatchLoading(true);
      try {
        // Calls MatchingController to calculate compatibility
        const res = await fetch(`${API}/api/v1/matching/score?groupId=${req.groupId}&studentId=${req.inviterId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          setMatchData(resData.data); //
        }
      } catch (e) {
        console.error("Match score fetch error:", e);
      } finally {
        setMatchLoading(false);
      }
    };

    if (req.inviterId && req.groupId) {
      fetchProfileMatch();
    }
  }, [req, token]);

  const isCurrentAction = actionLoading === `${req.id}-accept` || actionLoading === `${req.id}-decline`;

  return (
    <div className="bg-[#121826] border border-gray-800/50 rounded-[2rem] p-7 hover:border-yellow-400/20 transition-all shadow-xl">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
        
        {/* Left: Requester Identity & Message */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="w-14 h-14 bg-[#090e17] border border-gray-800 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="text-[#00d09c]" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-white font-black text-lg">{req.inviterName || 'Unknown Student'}</h3>
              <span className="bg-yellow-400/10 text-yellow-400 text-[9px] font-black px-2 py-0.5 rounded-lg border border-yellow-400/20 uppercase tracking-widest">
                PENDING REQUEST
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4">
              <Clock size={12} />
              <span>Requested on {formatDate(req.createdAt)}</span>
            </div>

            {/* Student's Application Message */}
            <div className="bg-[#090e17] p-4 rounded-2xl border border-gray-800 relative group mb-4">
              <MessageSquare className="absolute -top-2 -left-2 text-gray-700 bg-[#090e17] p-0.5 rounded-full" size={16} />
              <p className="text-gray-400 text-xs italic leading-relaxed">
                "{req.message || 'No message provided.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Center: AI Matching Analysis ("Balala" Profile) */}
        <div className="w-full lg:w-64 flex flex-col gap-3">
          <div className="bg-[#090e17] border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Target size={12} /> Skill Match
              </span>
              {matchLoading ? (
                <Loader2 size={12} className="animate-spin text-gray-600" />
              ) : (
                <span className={`text-xs font-black ${matchData?.score > 70 ? 'text-[#00d09c]' : 'text-yellow-500'}`}>
                  {matchData ? `${Math.round(matchData.score)}%` : 'N/A'}
                </span>
              )}
            </div>
            
            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-[#00d09c] transition-all duration-1000" 
                style={{ width: `${matchData?.score || 0}%` }}
              ></div>
            </div>

            {/* Displaying Matched Skills */}
            <div className="flex flex-wrap gap-1.5">
              {matchData?.matchedSkills?.length > 0 ? (
                matchData.matchedSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-[#00d09c]/5 border border-[#00d09c]/10 text-[#00d09c] text-[8px] font-black rounded-md uppercase">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[8px] text-gray-600 italic">No exact skill matches found.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => onAccept(req.id)}
            disabled={!!actionLoading}
            className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-4 py-3.5 rounded-xl font-black text-[10px] transition-all disabled:opacity-50 shadow-lg shadow-[#00d09c]/10"
          >
            {actionLoading === `${req.id}-accept` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            APPROVE
          </button>
          <button
            onClick={() => onDecline(req.id)}
            disabled={!!actionLoading}
            className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-[#090e17] hover:bg-red-500/10 hover:text-red-400 border border-gray-800 text-gray-500 px-4 py-3.5 rounded-xl font-black text-[10px] transition-all disabled:opacity-50"
          >
            {actionLoading === `${req.id}-decline` ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            REJECT
          </button>
        </div>
      </div>
    </div>
  );
};

const JoinRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const token = localStorage.getItem('accessToken');

  // Fetches pending requests for teams the user owns
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/v1/teams/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const resData = await res.json();
        setRequests(resData.data || []);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Approve logic hits TeamController
  const handleAccept = async (requestId) => {
    setActionLoading(requestId + '-accept');
    try {
      const res = await fetch(`${API}/api/v1/teams/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Request approved! Team is growing 🎉');
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        const err = await res.json();
        toast(err.message || 'Approval failed.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Decline logic hits TeamController
  const handleDecline = async (requestId) => {
    setActionLoading(requestId + '-decline');
    try {
      const res = await fetch(`${API}/api/v1/teams/requests/${requestId}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Join request rejected.');
        setRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        const err = await res.json();
        toast(err.message || 'Rejection failed.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Grouping requests by project group name for visual clarity
  const grouped = requests.reduce((acc, req) => {
    const key = req.groupName || `Team #${req.groupId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />
      <main className="flex-1 ml-72 p-8 text-left">
        
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/my-groups')}
            className="flex items-center gap-2 text-gray-600 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Teams
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#121826] border border-yellow-400/20 rounded-2xl flex items-center justify-center">
              <Users className="text-yellow-400" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-white tracking-tight italic">
                  Manage <span className="text-yellow-400">Join Requests</span>
                </h1>
                <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2.5 py-1 rounded-lg border border-yellow-400/20">
                  <Crown size={11} />
                  <span className="text-[9px] font-black uppercase">Owner Hub</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs font-medium">
                {requests.length > 0
                  ? `Review ${requests.length} pending application${requests.length > 1 ? 's' : ''} for your project teams`
                  : 'Your dashboard is clear. No pending requests.'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-yellow-400" size={40} />
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Processing Applications...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-[#121826] border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-gray-700" size={36} />
            </div>
            <h3 className="text-white font-black text-lg mb-2">No Requests Found</h3>
            <p className="text-gray-600 text-sm">When students request to join your teams, they will appear here.</p>
            <button onClick={() => navigate('/my-groups')} className="mt-6 bg-[#121826] border border-gray-800 text-gray-400 hover:text-white px-8 py-3 rounded-2xl font-black text-xs transition-all">
              GO TO MY TEAMS
            </button>
          </div>
        ) : (
          <div className="space-y-12 max-w-5xl">
            {Object.entries(grouped).map(([groupName, groupRequests]) => (
              <div key={groupName} className="animate-in slide-in-from-bottom-4 duration-500">
                {/* Team Group Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-0.5 bg-gray-800 flex-1"></div>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-[#121826] border border-gray-800 rounded-full">
                    <Users size={12} className="text-[#00d09c]" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">{groupName}</span>
                  </div>
                  <div className="h-0.5 bg-gray-800 flex-1"></div>
                </div>

                {/* Individual Request Cards */}
                <div className="space-y-4">
                  {groupRequests.map((req) => (
                    <RequestCard 
                      key={req.id} 
                      req={req} 
                      onAccept={handleAccept} 
                      onDecline={handleDecline} 
                      token={token}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default JoinRequests;