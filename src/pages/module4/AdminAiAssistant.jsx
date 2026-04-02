import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Trash2, 
  MessageSquare,
  BarChart3,
  TrendingUp,
  Loader2, 
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
        fetchStats(); // Refresh the list and total count
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting conversation");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-8 text-left">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">AI Assistant Admin</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">Module 4: Intelligence Moderation</p>
          </div>
        </header>

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00d09c]" size={40} /></div>
        ) : (
            <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#121826] border border-gray-800/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-400/30 transition-all text-left">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-400">
                        <MessageSquare size={100} />
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total AI Queries</p>
                    <h3 className="text-3xl font-black text-white">{stats.totalAiChats}</h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-400">
                        <BarChart3 size={12} /> Intelligence Pulse
                    </div>
                </div>

                <div className="bg-[#121826] border border-gray-800/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-blue-400/30 transition-all text-left">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-blue-400">
                        <TrendingUp size={100} />
                    </div>
                    {/* Show top topic if available */}
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Top Query Topic</p>
                    <h3 className="text-xl font-black text-white uppercase italic">
                        {stats.topAiTopics && Object.keys(stats.topAiTopics).length > 0 
                            ? Object.keys(stats.topAiTopics)[0] 
                            : 'None'}
                    </h3>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-400">
                        <TrendingUp size={12} /> Most Asked
                    </div>
                </div>
                </div>

                {/* AI Assistant Insights */}
                {stats.topAiTopics && Object.keys(stats.topAiTopics).length > 0 && (
                <div className="mb-10 bg-[#121826] border border-gray-800/50 p-8 rounded-[2.5rem] text-left">
                    <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center border border-blue-400/20">
                        <TrendingUp size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter">AI Assistant Insights</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Trending academic subject queries</p>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.topAiTopics).slice(0, 4).map(([topic, count]) => (
                        <div key={topic} className="bg-[#0b0f1a] border border-gray-800/30 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-400/40 transition-all">
                        <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="text-xs font-black text-white truncate pr-2 uppercase">{topic}</span>
                            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Query Volume</span>
                        </div>
                        <div className="text-xl font-black text-blue-400 bg-blue-400/5 px-4 py-2 rounded-xl border border-blue-400/10">
                            {count}
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* AI Assistant Moderation Table */}
                {stats.recentConversations && stats.recentConversations.length > 0 ? (
                <div className="mb-20 bg-[#121826] border border-gray-800/50 rounded-[2.5rem] overflow-hidden text-left">
                    <div className="p-8 border-b border-gray-800/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter">AI Assistant Moderation</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manage student academic sessions</p>
                    </div>
                    <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/10">
                        Admin Control Active
                    </div>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="bg-[#0b0f1a] text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            <th className="px-8 py-5">Student</th>
                            <th className="px-8 py-5">Conversation Title</th>
                            <th className="px-8 py-5">Subject</th>
                            <th className="px-8 py-5">Date Started</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/20">
                        {stats.recentConversations.map((conv) => (
                            <tr key={conv.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#00d09c]/10 text-[#00d09c] flex items-center justify-center font-black text-[10px]">
                                    {conv.studentName?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white">{conv.studentName}</p>
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">ID: #{conv.userId}</p>
                                </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{conv.title}</p>
                            </td>
                            <td className="px-8 py-6">
                                <span className="bg-blue-400/10 text-blue-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-400/10">
                                {conv.subject || 'GENERAL'}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-[10px] font-bold text-gray-600">
                                {new Date(conv.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-6 text-right">
                                <button 
                                onClick={() => triggerDelete(conv.id)}
                                className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-[0_4px_15px_rgba(239,68,68,0.1)] active:scale-90"
                                >
                                <Trash2 size={16} />
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                ) : (
                    <div className="text-center py-20 text-gray-500 text-sm">No active AI conversations found.</div>
                )}
            </>
        )}

        {/* Top-Aligned Delete Confirmation Popup */}
        {deleteConfirm.isOpen && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-8 fade-in duration-300">
            <div className="bg-[#1a2130] w-full max-w-lg rounded-2xl border border-red-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex items-center p-4 gap-5">
              <div className="w-10 h-10 shrink-0 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Confirm Deletion</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="px-4 py-2.5 font-bold text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-gray-700/50 hover:bg-white/10 uppercase text-[9px] tracking-widest">Cancel</button>
                <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-xl font-black transition-all shadow-[0_4px_15px_rgba(239,68,68,0.3)] active:scale-95 uppercase text-[9px] tracking-widest">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAiAssistant;
