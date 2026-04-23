import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Trash2, 
  MessageSquare,
  BarChart3,
  TrendingUp,
  Loader2, 
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Monitor,
  Activity
} from 'lucide-react';

const AdminAiAssistant = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAiChats: 0,
    topAiTopics: {},
    recentConversations: []
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });

  const token = localStorage.getItem('accessToken') || 'mock-token-for-testing';

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/module4/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) { 
        console.error("Stats fetch failed:", err); 
    } finally {
        setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const triggerDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await fetch(`http://localhost:8080/api/v1/module4/admin/conversations/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchStats(); 
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting conversation");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-600 font-sans selection:bg-indigo-100">
      <Sidebar />

      <main className="flex-1 ml-72 p-10 relative">
        <header className="flex justify-between items-start mb-12 text-left">
          <div className="animate-in slide-in-from-left duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <Monitor size={14} className="text-white" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Intelligence Monitor</p>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              AI <span className="text-indigo-600">Assistant</span> Moderation
            </h2>
          </div>
          <div className="flex items-center gap-4 bg-[#f8fafc] border border-slate-200/60 px-6 py-4 rounded-[1.5rem] shadow-sm">
             <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute opacity-40"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Neural Gateway Active</p>
          </div>
        </header>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Fetching Intelligence Logs...</p>
            </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {/* Professional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-[#f8fafc] border border-slate-200/60 p-12 rounded-[3rem] relative overflow-hidden group hover:border-indigo-400/50 transition-all text-left shadow-sm">
                        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-50/50 rounded-full -translate-y-20 translate-x-20 opacity-60"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Engagement Analytics</p>
                        <h3 className="text-6xl font-black text-slate-900 mb-8 tabular-nums tracking-tighter italic">{stats.totalAiChats}</h3>
                        <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 bg-white px-5 py-2.5 rounded-2xl w-fit border border-slate-100 shadow-sm">
                            <Activity size={14} /> Total Intelligence Queries
                        </div>
                        
                    </div>

                    <div className="bg-[#f8fafc] border border-slate-200/60 p-12 rounded-[3rem] relative overflow-hidden group hover:border-blue-400/50 transition-all text-left shadow-sm">
                        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-50/50 rounded-full -translate-y-20 translate-x-20 opacity-60"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Subject Trend</p>
                        <h3 className="text-3xl font-black text-slate-900 mb-8 uppercase italic tracking-tight leading-tight">
                            {stats.topAiTopics && Object.keys(stats.topAiTopics).length > 0 
                                ? Object.keys(stats.topAiTopics)[0] 
                                : 'NO ACTIVE DATA'}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] font-black text-blue-600 bg-white px-5 py-2.5 rounded-2xl w-fit border border-slate-100 shadow-sm">
                            <Zap size={14} /> Critical Interest Area
                        </div>
                    </div>
                </div>

                {/* Refined AI Insights Section */}
                {stats.topAiTopics && Object.keys(stats.topAiTopics).length > 0 && (
                <div className="mb-12 bg-[#f8fafc] border border-slate-200/60 p-12 rounded-[3.5rem] text-left shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-8 mb-12">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border border-slate-200 shadow-sm">
                            <Sparkles size={36} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Neural Insights</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 italic">Quantifying student academic interests</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(stats.topAiTopics).slice(0, 4).map(([topic, count]) => (
                            <div key={topic} className="bg-white border border-slate-100 p-8 rounded-3xl flex items-center justify-between group hover:border-indigo-300/50 hover:shadow-lg transition-all shadow-sm">
                                <div className="flex flex-col gap-1 overflow-hidden pr-4">
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-70">Focus Area</span>
                                    <span className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{topic}</span>
                                </div>
                                <div className="text-3xl font-black text-indigo-600 bg-indigo-50/30 px-5 py-3 rounded-2xl border border-indigo-100 shadow-inner tabular-nums">
                                    {count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Professional Moderation Table */}
                <div className="mb-24 bg-[#f8fafc] border border-slate-200/60 rounded-[3.5rem] overflow-hidden shadow-sm animate-in fade-in duration-1000">
                    <div className="p-12 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/50">
                        <div className="text-left">
                            <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">Audit Log</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Institutional oversight of AI interactions</p>
                        </div>
                        <div className="bg-white border border-slate-200 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.25em] text-slate-900 flex items-center gap-3 shadow-sm">
                            <ShieldCheck size={16} className="text-indigo-600" /> Administrative Hub Secure
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-100/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-200/60">
                                    <th className="px-12 py-8">User Integrity</th>
                                    <th className="px-12 py-8">Contextual Metadata</th>
                                    <th className="px-12 py-8">Temporal Data</th>
                                    <th className="px-12 py-8 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {stats.recentConversations && stats.recentConversations.length > 0 ? (
                                stats.recentConversations.map((conv) => (
                                    <tr key={conv.id} className="hover:bg-white transition-all group">
                                        <td className="px-12 py-10">
                                            <div className="flex items-center gap-6 text-left">
                                                <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] text-slate-900 flex items-center justify-center font-black text-base border border-slate-200 group-hover:border-indigo-300 transition-all shadow-sm">
                                                    {conv.studentName?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{conv.studentName}</p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Auth ID: #{conv.userId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors mb-3 leading-tight">{conv.title}</p>
                                                <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                                    {conv.subject || 'GENERAL INTELLIGENCE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10">
                                            <div className="flex flex-col gap-1.5 text-left">
                                                <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-900 uppercase">
                                                    <Calendar size={14} className="text-indigo-600" />
                                                    {new Date(conv.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-6 opacity-60 italic">Session Inception</p>
                                            </div>
                                        </td>
                                        <td className="px-12 py-10 text-right">
                                            <button 
                                                onClick={() => triggerDelete(conv.id)}
                                                className="p-5 bg-white text-slate-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-200 hover:border-red-600"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.6em] italic">Awaiting Neural Logs...</p>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Professional Delete Confirmation - Professional Light */}
        {deleteConfirm.isOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" />
                <div className="bg-white w-full max-w-md rounded-[3.5rem] p-12 relative z-10 animate-in slide-in-from-bottom-10 duration-500 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-red-100 shadow-inner rotate-6">
                        <Trash2 size={44} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase mb-3 leading-none">Terminate Log?</h3>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-12 leading-relaxed max-w-[280px] mx-auto opacity-70">
                        This AI session and all associated intelligence metadata will be permanently purged from the archive.
                    </p>
                    <div className="grid grid-cols-2 gap-5">
                        <button 
                            onClick={() => setDeleteConfirm({ isOpen: false, id: null })} 
                            className="py-5 font-black text-[11px] text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors border border-slate-200 rounded-3xl bg-[#f8fafc] active:scale-95 shadow-sm"
                        >
                            Abort
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="py-5 bg-red-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-red-600/10 active:scale-95"
                        >
                            Confirm Purge
                        </button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminAiAssistant;