import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { Bell, CheckCircle, XCircle, Loader2, Users, Clock, UserCheck, ArrowLeft } from 'lucide-react';
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

const Invitations = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const token = localStorage.getItem('accessToken');

  const fetchInvites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/v1/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data.data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchInvites(); }, [fetchInvites]);

  const handleAccept = async (id) => {
    setActionLoading(id + '-accept');
    try {
      const res = await fetch(`${API}/api/v1/invitations/${id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Invitation accepted! Welcome to the team 🎉');
        setInvites(prev => prev.filter(i => i.id !== id));
      } else {
        const err = await res.json();
        toast(err.message || 'Could not accept invitation.', 'error');
      }
    } catch { toast('Network error.', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (id) => {
    setActionLoading(id + '-decline');
    try {
      const res = await fetch(`${API}/api/v1/invitations/${id}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast('Invitation declined.');
        setInvites(prev => prev.filter(i => i.id !== id));
      } else {
        const err = await res.json();
        toast(err.message || 'Could not decline invitation.', 'error');
      }
    } catch { toast('Network error.', 'error'); }
    finally { setActionLoading(null); }
  };

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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Bell className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Team <span className="text-indigo-600">Invitations</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">
                {invites.length > 0
                  ? `${invites.length} pending invitation${invites.length > 1 ? 's' : ''} waiting for your response`
                  : 'No pending invitations'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Invitations...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bell className="text-indigo-300" size={36} />
            </div>
            <h3 className="text-slate-900 font-black text-lg mb-2">All Clear!</h3>
            <p className="text-slate-400 text-sm">No pending team invitations right now.</p>
            <button
              onClick={() => navigate('/my-groups')}
              className="mt-6 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-8 py-3 rounded-2xl font-black text-xs transition-all shadow-sm"
            >
              BROWSE OPEN TEAMS
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="bg-white border border-slate-200/60 rounded-3xl p-7 hover:shadow-xl hover:shadow-indigo-600/5 hover:-translate-y-0.5 transition-all shadow-lg shadow-slate-200/50"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Info */}
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Users className="text-indigo-600" size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-slate-900 font-black text-lg truncate">{invite.groupName}</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-lg border border-indigo-200 uppercase tracking-widest flex-shrink-0">
                          INVITED
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                        <UserCheck size={12} />
                        <span>Invited by <span className="text-slate-700 font-semibold">{invite.inviterName}</span></span>
                        <span className="text-slate-300">·</span>
                        <Clock size={11} />
                        <span>{formatDate(invite.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDecline(invite.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-200 border border-slate-200 text-slate-500 px-5 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50 shadow-sm"
                    >
                      {actionLoading === `${invite.id}-decline` ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                      DECLINE
                    </button>
                    <button
                      onClick={() => handleAccept(invite.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      {actionLoading === `${invite.id}-accept` ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                      ACCEPT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Invitations;
