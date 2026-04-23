import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { Bell, CheckCircle, XCircle, Loader2, Users, Clock, UserCheck, ArrowLeft } from 'lucide-react';
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
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Invitations = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of item being actioned
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
            <div className="w-14 h-14 bg-[#121826] border border-blue-400/20 rounded-2xl flex items-center justify-center">
              <Bell className="text-blue-400" size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight italic">
                Team <span className="text-blue-400">Invitations</span>
              </h1>
              <p className="text-gray-600 text-xs font-medium mt-1">
                {invites.length > 0
                  ? `${invites.length} pending invitation${invites.length > 1 ? 's' : ''} waiting for your response`
                  : 'No pending invitations'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-400" size={40} />
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Loading Invitations...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-[#121826] border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bell className="text-gray-700" size={36} />
            </div>
            <h3 className="text-white font-black text-lg mb-2">All Clear!</h3>
            <p className="text-gray-600 text-sm">No pending team invitations right now.</p>
            <button onClick={() => navigate('/my-groups')} className="mt-6 bg-[#121826] border border-gray-800 text-gray-400 hover:text-white px-8 py-3 rounded-2xl font-black text-xs transition-all">
              BROWSE OPEN TEAMS
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="bg-[#121826] border border-gray-800/50 rounded-[2rem] p-7 hover:border-blue-400/20 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Info */}
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-[#090e17] rounded-xl border border-gray-800 flex items-center justify-center flex-shrink-0">
                      <Users className="text-[#00d09c]" size={22} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-white font-black text-lg truncate">{invite.groupName}</h3>
                        <span className="bg-blue-400/10 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-lg border border-blue-400/20 uppercase tracking-widest flex-shrink-0">
                          INVITED
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <UserCheck size={12} />
                        <span>Invited by <span className="text-gray-300 font-semibold">{invite.inviterName}</span></span>
                        <span className="text-gray-700">·</span>
                        <Clock size={11} />
                        <span>{formatDate(invite.createdAt)}</span>
                      </div>
                      {invite.message && (
                        <p className="text-gray-500 text-xs italic bg-[#090e17] px-4 py-2.5 rounded-xl border border-gray-800">
                          "{invite.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDecline(invite.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 bg-[#090e17] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-gray-800 text-gray-500 px-5 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50"
                    >
                      {actionLoading === `${invite.id}-decline` ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                      DECLINE
                    </button>
                    <button
                      onClick={() => handleAccept(invite.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-5 py-3 rounded-xl font-black text-xs transition-all disabled:opacity-50 shadow-lg"
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