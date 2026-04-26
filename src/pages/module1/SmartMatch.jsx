import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Sparkles, Zap, ArrowLeft, Loader2, CheckCircle, XCircle,
  Users, ChevronRight, Clock, TrendingUp
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

const ScoreRing = ({ score }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#ef4444';

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-slate-900 font-black text-sm leading-none">{Math.round(score)}</span>
        <span className="text-slate-400 text-[8px] font-black uppercase">MATCH</span>
      </div>
    </div>
  );
};

const SkillPill = ({ skill, matched }) => (
  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider flex items-center gap-1 ${
    matched
      ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
      : 'bg-red-50 text-red-500 border-red-200'
  }`}>
    {matched ? <CheckCircle size={9} /> : <XCircle size={9} />}
    {skill}
  </span>
);

const MatchCard = ({ match, onJoin, pendingIds }) => {
  const isPending = pendingIds.has(match.groupId);
  const scoreColor = match.score >= 70 ? 'text-emerald-600' : match.score >= 40 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="bg-white border border-slate-200/60 rounded-3xl p-7 hover:shadow-xl hover:shadow-indigo-600/5 hover:-translate-y-1 transition-all shadow-lg shadow-slate-200/50 flex flex-col gap-5">
      {/* Top row */}
      <div className="flex items-start gap-5">
        <ScoreRing score={match.score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-slate-900 font-black text-base truncate">{match.groupName}</h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
              match.score >= 70 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              match.score >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-500 border-red-200'
            }`}>
              {match.score >= 70 ? '🔥 GREAT FIT' : match.score >= 40 ? '⚡ DECENT FIT' : '🌱 SKILL GAP'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <TrendingUp size={11} />
            <span className={`font-black ${scoreColor}`}>{match.score}%</span>
            <span>compatibility score</span>
          </div>
        </div>
      </div>

      {/* Skills breakdown */}
      {(match.matchedSkills?.length > 0 || match.missingSkills?.length > 0) && (
        <div className="space-y-3">
          {match.matchedSkills?.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Skills You Have</p>
              <div className="flex flex-wrap gap-1.5">
                {match.matchedSkills.map(s => <SkillPill key={s} skill={s} matched={true} />)}
              </div>
            </div>
          )}
          {match.missingSkills?.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Skills to Learn</p>
              <div className="flex flex-wrap gap-1.5">
                {match.missingSkills.map(s => <SkillPill key={s} skill={s} matched={false} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action */}
      <button
        disabled={isPending}
        onClick={() => onJoin(match.groupId)}
        className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 mt-auto ${
          isPending
            ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-default'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95'
        }`}
      >
        {isPending ? <><Clock size={13} /> REQUEST SENT</> : <>REQUEST TO JOIN <ChevronRight size={13} /></>}
      </button>
    </div>
  );
};

const SmartMatch = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('accessToken');

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/v1/matching/my-groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.data || []);
      } else {
        const err = await res.json();
        toast(err.message || 'Could not load matches. Make sure your student profile has skills set up.', 'error');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  const fetchMyRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/v1/join-requests/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const pending = new Set((data.data || []).filter(r => r.status === 'PENDING').map(r => r.groupId));
        setPendingIds(pending);
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => {
    fetchMatches();
    fetchMyRequests();
  }, [fetchMatches, fetchMyRequests]);

  const handleJoin = async (groupId) => {
    try {
      const res = await fetch(`${API}/api/v1/teams/${groupId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Join request sent! ✉️');
        setPendingIds(prev => new Set([...prev, groupId]));
      } else {
        const err = await res.json();
        toast(err.message || 'Could not send request.', 'error');
      }
    } catch { toast('Network error.', 'error'); }
  };

  const filtered = matches.filter(m => {
    if (filter === 'great') return m.score >= 70;
    if (filter === 'decent') return m.score >= 40 && m.score < 70;
    if (filter === 'gap') return m.score < 40;
    return true;
  });

  const avgScore = matches.length > 0
    ? Math.round(matches.reduce((a, b) => a + b.score, 0) / matches.length)
    : 0;
  const greatCount = matches.filter(m => m.score >= 70).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-sky-300 blur-[120px] rounded-full" />
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
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Sparkles className="text-white" size={26} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Match</span>
                </h1>
                <p className="text-slate-400 text-xs font-medium mt-1">AI-powered compatibility scoring based on your skills</p>
              </div>
            </div>

            {/* Stats row */}
            {matches.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
                  <p className="text-slate-900 font-black text-xl">{matches.length}</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Teams Found</p>
                </div>
                <div className="bg-white border border-emerald-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                  <p className="text-emerald-600 font-black text-xl">{greatCount}</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Great Fits</p>
                </div>
                <div className="bg-white border border-indigo-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                  <p className="text-indigo-600 font-black text-xl">{avgScore}%</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Avg Match</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {!loading && matches.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 w-fit mb-8 shadow-sm">
            {[
              { key: 'all', label: 'ALL RESULTS' },
              { key: 'great', label: '🔥 GREAT FIT (70%+)' },
              { key: 'decent', label: '⚡ DECENT (40%+)' },
              { key: 'gap', label: '🌱 SKILL GAP' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  filter === key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={20} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analyzing Your Skills...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="text-indigo-300" size={36} />
            </div>
            <h3 className="text-slate-900 font-black text-lg mb-2">No Matches Found</h3>
            <p className="text-slate-400 text-sm mb-6">
              This usually means your student profile doesn't have skills listed yet, or there are no open teams.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/student-dashboard')}
                className="block w-full bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-sm"
              >
                UPDATE MY PROFILE & SKILLS
              </button>
              <button
                onClick={() => navigate('/my-groups')}
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                BROWSE TEAMS MANUALLY
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm font-medium">No results for this filter.</p>
            <button onClick={() => setFilter('all')} className="mt-4 text-indigo-600 font-black text-xs hover:underline">
              Show all results
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(match => (
              <MatchCard
                key={`${match.studentId}-${match.groupId}`}
                match={match}
                onJoin={handleJoin}
                pendingIds={pendingIds}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SmartMatch;
