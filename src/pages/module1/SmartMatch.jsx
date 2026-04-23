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
    type === 'success' ? 'bg-[#00d09c] text-gray-900' : 'bg-red-500 text-white'
  }`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

const ScoreRing = ({ score }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? '#00d09c' : score >= 40 ? '#f59e0b' : '#f87171';

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1a2130" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white font-black text-sm leading-none">{Math.round(score)}</span>
        <span className="text-gray-600 text-[8px] font-black uppercase">MATCH</span>
      </div>
    </div>
  );
};

const SkillPill = ({ skill, matched }) => (
  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider flex items-center gap-1 ${
    matched
      ? 'bg-[#00d09c]/10 text-[#00d09c] border-[#00d09c]/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20'
  }`}>
    {matched ? <CheckCircle size={9} /> : <XCircle size={9} />}
    {skill}
  </span>
);

const MatchCard = ({ match, onJoin, pendingIds }) => {
  const isPending = pendingIds.has(match.groupId);
  const scoreColor = match.score >= 70 ? 'text-[#00d09c]' : match.score >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-[#121826] border border-gray-800/50 rounded-[2rem] p-7 hover:border-[#00d09c]/20 transition-all shadow-xl flex flex-col gap-5">
      {/* Top row */}
      <div className="flex items-start gap-5">
        <ScoreRing score={match.score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-black text-base truncate">{match.groupName}</h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${
              match.score >= 70 ? 'bg-[#00d09c]/10 text-[#00d09c] border-[#00d09c]/20' :
              match.score >= 40 ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
              'bg-red-400/10 text-red-400 border-red-400/20'
            }`}>
              {match.score >= 70 ? '🔥 GREAT FIT' : match.score >= 40 ? '⚡ DECENT FIT' : '🌱 SKILL GAP'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
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
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Skills You Have</p>
              <div className="flex flex-wrap gap-1.5">
                {match.matchedSkills.map(s => <SkillPill key={s} skill={s} matched={true} />)}
              </div>
            </div>
          )}
          {match.missingSkills?.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Skills to Learn</p>
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
            ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 cursor-default'
            : 'bg-[#090e17] hover:bg-[#00d09c] hover:text-gray-900 border border-gray-800 cursor-pointer'
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
  const [filter, setFilter] = useState('all'); // all | great | decent | gap
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
        // Could be student profile not set up yet
        const err = await res.json();
        toast(err.message || 'Could not load matches. Make sure your student profile has skills set up.', 'error');
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  // Load pending requests to mark button states
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
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#121826] border border-purple-400/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-purple-400" size={26} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight italic">
                  Smart <span className="text-purple-400">Match</span>
                </h1>
                <p className="text-gray-600 text-xs font-medium mt-1">AI-powered compatibility scoring based on your skills</p>
              </div>
            </div>

            {/* Stats row */}
            {matches.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="bg-[#121826] border border-gray-800 rounded-2xl px-5 py-3 text-center">
                  <p className="text-white font-black text-xl">{matches.length}</p>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Teams Found</p>
                </div>
                <div className="bg-[#121826] border border-[#00d09c]/20 rounded-2xl px-5 py-3 text-center">
                  <p className="text-[#00d09c] font-black text-xl">{greatCount}</p>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Great Fits</p>
                </div>
                <div className="bg-[#121826] border border-purple-400/20 rounded-2xl px-5 py-3 text-center">
                  <p className="text-purple-400 font-black text-xl">{avgScore}%</p>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Avg Match</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {!loading && matches.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-[#121826] rounded-2xl border border-gray-800 w-fit mb-8">
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
                  filter === key ? 'bg-[#00d09c] text-gray-900 shadow-lg' : 'text-gray-400 hover:text-white'
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
              <Loader2 className="animate-spin text-purple-400" size={48} />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-300" size={20} />
            </div>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Analyzing Your Skills...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-[#121826] border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="text-gray-700" size={36} />
            </div>
            <h3 className="text-white font-black text-lg mb-2">No Matches Found</h3>
            <p className="text-gray-600 text-sm mb-6">
              This usually means your student profile doesn't have skills listed yet, or there are no open teams.
            </p>
            <div className="space-y-3">
              <button onClick={() => navigate('/student-dashboard')} className="block w-full bg-[#121826] border border-gray-800 text-gray-400 hover:text-white px-8 py-3 rounded-2xl font-black text-xs transition-all">
                UPDATE MY PROFILE & SKILLS
              </button>
              <button onClick={() => navigate('/my-groups')} className="block w-full bg-[#00d09c]/10 border border-[#00d09c]/20 text-[#00d09c] hover:bg-[#00d09c]/20 px-8 py-3 rounded-2xl font-black text-xs transition-all">
                BROWSE TEAMS MANUALLY
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-sm font-medium">No results for this filter.</p>
            <button onClick={() => setFilter('all')} className="mt-4 text-[#00d09c] font-black text-xs hover:underline">Show all results</button>
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