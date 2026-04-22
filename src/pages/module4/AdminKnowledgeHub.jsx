import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Users, 
  BarChart3,
  TrendingUp,
  Loader2, 
  ExternalLink,
  Tag as TagIcon,
  Book,
  Sparkles,
  ArrowRight,
  BookMarked,
  Layers,
  Layout
} from 'lucide-react';

const AdminKnowledgeHub = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editResourceId, setEditResourceId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const [stats, setStats] = useState({
    totalResources: 0,
    totalBookmarks: 0,
    trendingSubject: 'Loading...',
    resourceDistribution: {}
  });
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    subject: '',
    type: 'ARTICLE',
    tags: ''
  });

  const token = localStorage.getItem('accessToken') || 'mock-token-for-testing';

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/resources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/module4/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) { console.error("Stats fetch failed:", err); }
  }, [token]);

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, [fetchResources, fetchStats]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ title: '', url: '', description: '', subject: '', type: 'ARTICLE', tags: '' });
    setEditResourceId(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setFormData({
      title: resource.title || '',
      url: resource.url || '',
      description: resource.description || '',
      subject: resource.subject || '',
      type: resource.type || 'ARTICLE',
      tags: resource.tags ? resource.tags.join(', ') : ''
    });
    setEditResourceId(resource.id);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errors = {};
    if (!formData.title || formData.title.length < 3) errors.title = "Title must be at least 3 characters";
    if (!formData.subject) errors.subject = "Subject is required";
    if (!formData.url || !formData.url.startsWith('http')) errors.url = "Valid URL starting with http/https is required";
    if (!formData.type) errors.type = "Type is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    setFormErrors({});
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
    };

    const method = editResourceId ? 'PUT' : 'POST';
    const url = editResourceId 
      ? `http://localhost:8080/api/v1/resources/${editResourceId}`
      : 'http://localhost:8080/api/v1/resources';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchResources();
        fetchStats();
      }
    } catch (err) {
      alert("Error saving resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const response = await fetch(`http://localhost:8080/api/v1/resources/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchResources();
        fetchStats();
      }
    } catch (err) {
      alert("Error deleting resource");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-600 font-sans selection:bg-indigo-100">
      <Sidebar />

      <main className="flex-1 ml-72 p-10 relative">
        <header className="flex justify-between items-start mb-12 text-left">
          <div className="animate-in slide-in-from-left duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                <Layout size={14} className="text-white" />
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Management System</p>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Knowledge <span className="text-indigo-600">Hub</span> Admin
            </h2>
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/10 flex items-center gap-3 active:scale-95"
          >
            <Plus size={18} /> New Material
          </button>
        </header>

        {/* Professional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
           <div className="bg-[#f8fafc] border border-slate-200/60 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-indigo-400/50 transition-all text-left shadow-sm">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inventory Assets</p>
              <h3 className="text-5xl font-black text-slate-900 mb-6">{stats.totalResources}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-white px-4 py-2 rounded-xl w-fit border border-slate-100 shadow-sm">
                <BarChart3 size={14} /> Live Repository
              </div>
           </div>

           <div className="bg-[#f8fafc] border border-slate-200/60 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-400/50 transition-all text-left shadow-sm">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Student Outreach</p>
              <h3 className="text-5xl font-black text-slate-900 mb-6">{stats.totalBookmarks}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-white px-4 py-2 rounded-xl w-fit border border-slate-100 shadow-sm">
                <BookMarked size={14} /> Active Bookmarks
              </div>
           </div>

           <div className="bg-[#f8fafc] border border-slate-200/60 p-10 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-400/50 transition-all text-left shadow-sm">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-12 translate-x-12 opacity-50"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">High Demand Subject</p>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-6 truncate leading-tight">{stats.trendingSubject}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-white px-4 py-2 rounded-xl w-fit border border-slate-100 shadow-sm">
                <Sparkles size={14} /> Analytics Trending
              </div>
           </div>
        </div>

        {/* Refined Search */}
        <div className="mb-10">
          <div className="relative group text-left max-w-2xl">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="QUICK SEARCH INVENTORY..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200/60 rounded-[2rem] py-6 pl-16 pr-8 text-[11px] font-bold text-slate-900 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-400 tracking-[0.2em] shadow-sm uppercase"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Hub...</p>
          </div>
        ) : (
          <div className="bg-[#f8fafc] border border-slate-200/60 rounded-[3rem] overflow-hidden shadow-sm animate-in fade-in duration-1000">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/30 border-b border-slate-200/60">
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Resource Meta</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Classification</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map(resource => (
                    <tr key={resource.id} className="hover:bg-white transition-all group">
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6 text-left">
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-indigo-200 transition-all">
                            <Layers className="text-slate-500 group-hover:text-indigo-600 transition-colors" size={24} />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{resource.title}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 max-w-md font-bold uppercase tracking-tighter opacity-70">{resource.url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-8">
                        <div className="flex flex-col gap-3 text-left">
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-widest">{resource.type}</span>
                             <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-widest">{resource.subject}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {resource.tags?.map((t, i) => <span key={i} className="text-[8px] text-slate-400 font-bold hover:text-indigo-600 transition-colors cursor-default">#{t.toUpperCase()}</span>)}
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-8">
                        <div className="flex gap-3 justify-end">
                          <button onClick={() => openEditModal(resource)} className="p-4 bg-white hover:bg-indigo-600 hover:text-white rounded-2xl text-slate-400 transition-all shadow-sm border border-slate-200">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => triggerDelete(resource.id)} className="p-4 bg-white hover:bg-red-600 hover:text-white rounded-2xl text-slate-400 transition-all shadow-sm border border-slate-200">
                            <Trash2 size={16} />
                          </button>
                          <a href={resource.url} target="_blank" rel="noreferrer" className="p-4 bg-white hover:bg-slate-900 hover:text-white rounded-2xl text-slate-400 transition-all shadow-sm border border-slate-200">
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) }

        {/* Modal Redesign - Clean Professional */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
            <div className="bg-[#fcfdfe] w-full max-w-2xl rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-500 text-left">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Update Hub Data</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Knowledge Resource Moderation</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"><X size={22} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Asset Nomenclature *</label>
                    <input 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required 
                      className={`w-full bg-[#f8fafc] border ${formErrors.title ? 'border-red-500' : 'border-slate-200'} rounded-2xl px-6 py-5 text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-bold`} 
                      placeholder="e.g. Advanced AI Frameworks" 
                    />
                    {formErrors.title && <p className="text-red-500 text-[10px] mt-2 font-bold ml-1 uppercase">{formErrors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Academic Category *</label>
                      <input 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold" 
                        placeholder="e.g. Engineering" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Material Type</label>
                      <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleInputChange} 
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer"
                      >
                        <option value="ARTICLE">ARTICLE</option>
                        <option value="VIDEO">VIDEO</option>
                        <option value="PDF">PDF</option>
                        <option value="COURSE">COURSE</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Source Destination URL *</label>
                    <input 
                      name="url" 
                      value={formData.url} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold" 
                      placeholder="https://source.sliit.lk/..." 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Executive Summary</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows="4" 
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold resize-none" 
                      placeholder="Provide a high-level overview..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Keywords for Retrieval (COMMA SEPARATED)</label>
                    <div className="relative">
                      <TagIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        name="tags" 
                        value={formData.tags} 
                        onChange={handleInputChange} 
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl px-16 py-5 text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold" 
                        placeholder="module4, research, case-study" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 flex gap-6">
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 bg-indigo-600 hover:bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : (
                      <>
                        {editResourceId ? 'Update Inventory' : 'Publish Asset'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 font-black text-[11px] text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Abort</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Professional Delete Popup */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" />
            <div className="bg-white w-full max-w-md rounded-[3rem] p-12 relative z-10 animate-in slide-in-from-bottom-10 duration-500 text-center shadow-2xl">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-100 shadow-inner rotate-3">
                <Trash2 size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase mb-3">Terminate Asset?</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-10 leading-relaxed max-w-[280px] mx-auto opacity-80">
                This material will be permanently expunged from the knowledge database.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setDeleteConfirm({ isOpen: false, id: null })} className="py-5 font-black text-[11px] text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors border border-slate-200 rounded-2xl bg-[#f8fafc] shadow-sm">Cancel</button>
                <button onClick={confirmDelete} className="py-5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-red-600/10 active:scale-95">Purge</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminKnowledgeHub;