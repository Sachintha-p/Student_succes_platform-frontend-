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
    type === 'success' ? 'bg-indigo-600 text-white' : 'bg-red-500 text-white'
  }`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

const formatDate = (dt) => {
  if (!dt) return '';
  return new Date(dt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const RequestCard = ({ req, onAccept, onDecline, token, actionLoading }) => {
  const [matchData, setMatchData] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    const fetchProfileMatch = async () => {
      setMatchLoading(true);
      try {
        const res = await fetch(
          `${API}/api/v1/matching/score-for-student?groupId=${req.groupId}&studentId=${req.inviterId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const resData = await res.json();
          setMatchData(resData.data);
        }
      } catch (e) {
        console.error('Match score fetch error:', e);
      } finally {
        setMatchLoading(false);
      }
    };

    if (req.inviterId && req.groupId) fetchProfileMatch();
  }, [req, token]);

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-7 hover:shadow-xl hover:shadow-indigo-600/5 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-200/50">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8">

        {/* Left: Requester Identity & Message */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="text-indigo-600" size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-slate-900 font-black text-lg">{req.inviterName || 'Unknown Student'}</h3>
              <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-lg border border-amber-200 uppercase tracking-widest">
                PENDING REQUEST
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
              <Clock size={12} />
              <span>Requested on {formatDate(req.createdAt)}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative mb-4">
              <MessageSquare className="absolute -top-2 -left-2 text-slate-300 bg-white p-0.5 rounded-full border border-slate-100" size={16} />
              <p className="text-slate-500 text-xs italic leading-relaxed">
                "{req.message || 'No message provided.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Center: AI Skill Match */}
        <div className="w-full lg:w-64 flex flex-col gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Target size={12} /> Skill Match
              </span>
              {matchLoading ? (
                <Loader2 size={12} className="animate-spin text-slate-400" />
              ) : (
                <span className={`text-xs font-black ${matchData?.score > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {matchData ? `${Math.round(matchData.score)}%` : 'N/A'}
                </span>
              )}
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-1000 rounded-full"
                style={{ width: `${matchData?.score || 0}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {matchData?.matchedSkills?.length > 0 ? (
                matchData.matchedSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[8px] font-black rounded-md uppercase">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[8px] text-slate-400 italic">No exact skill matches found.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => onAccept(req.id)}
            disabled={!!actionLoading}
            className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-black text-[10px] transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            {actionLoading === `${req.id}-accept` ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            APPROVE
          </button>
          <button
            onClick={() => onDecline(req.id)}
            disabled={!!actionLoading}
            className="flex-1 lg:w-32 flex items-center justify-center gap-2 bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-slate-200 text-slate-500 px-4 py-3.5 rounded-xl font-black text-[10px] transition-all disabled:opacity-50 shadow-sm"
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
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

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

  const grouped = requests.reduce((acc, req) => {
    const key = req.groupName || `Team #${req.groupId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-indigo-400 blur-[120px] rounded-full" />
      </div>

      <Sidebar />
      <main className="flex-1 ml-72 p-10 relative z-10 text-left">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/my-groups')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-xs font-black uppercase tracking-widest mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Teams
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Users className="text-white" size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Manage <span className="text-amber-500">Join Requests</span>
                </h1>
                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Crown size={11} />
                  <span className="text-[9px] font-black uppercase">Owner Hub</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs font-medium">
                {requests.length > 0
                  ? `Review ${requests.length} pending application${requests.length > 1 ? 's' : ''} for your project teams`
                  : 'Your dashboard is clear. No pending requests.'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-amber-500" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Applications...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-amber-50 border border-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-amber-300" size={36} />
            </div>
            <h3 className="text-slate-900 font-black text-lg mb-2">No Requests Found</h3>
            <p className="text-slate-400 text-sm">When students request to join your teams, they will appear here.</p>
            <button
              onClick={() => navigate('/my-groups')}
              className="mt-6 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-sm"
            >
              GO TO MY TEAMS
            </button>
          </div>
        ) : (
          <div className="space-y-12 max-w-5xl">
            {Object.entries(grouped).map(([groupName, groupRequests]) => (
              <div key={groupName}>
                {/* Team group divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px bg-slate-200 flex-1" />
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                    <Users size={12} className="text-indigo-600" />
                    <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest">{groupName}</span>
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

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
