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
  MessageSquare,
  BarChart3,
  TrendingUp,
  Loader2, 
  ExternalLink,
  Tag as TagIcon,
  Book
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
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-8 text-left">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Admin Dashboard</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 opacity-70">Module 4: Intelligence & Knowledge Systems</p>
          </div>
          <button onClick={openAddModal} className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(0,208,156,0.2)] hover:scale-105 active:scale-95">
            <Plus size={18} /> Add New Material
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
           <div className="bg-[#121826] border border-gray-800/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-[#00d09c]/30 transition-all text-left">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen size={100} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Materials</p>
              <h3 className="text-3xl font-black text-white">{stats.totalResources}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#00d09c]">
                <BarChart3 size={12} /> Live Inventory
              </div>
           </div>

           <div className="bg-[#121826] border border-gray-800/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-yellow-400/30 transition-all text-left">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-yellow-400">
                <Users size={100} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Student Bookmarks</p>
              <h3 className="text-3xl font-black text-white">{stats.totalBookmarks}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-yellow-400">
                <TrendingUp size={12} /> High Engagement
              </div>
           </div>

           <div className="bg-[#121826] border border-gray-800/50 p-6 rounded-[2rem] relative overflow-hidden group hover:border-[#00d09c]/30 transition-all text-left">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-[#00d09c]">
                <TagIcon size={100} />
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Trending Subject</p>
              <h3 className="text-xl font-black text-white uppercase italic">{stats.trendingSubject}</h3>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#00d09c]">
                <TrendingUp size={12} /> Most Searched
              </div>
           </div>
        </div>

        <div className="mb-8 flex gap-4">
          <div className="relative flex-1 text-left">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
            <input 
              type="text" 
              placeholder="QUICK SEARCH RESOURCES..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b0f1a] border border-gray-800 rounded-2xl py-5 pl-16 pr-6 text-xs font-bold text-white focus:outline-none focus:border-[#00d09c]/50 transition-all placeholder:text-gray-800 tracking-widest"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00d09c]" size={40} /></div>
        ) : (
          <div className="bg-[#121826] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-black/20">
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Resource</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Metadata</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map(resource => (
                  <tr key={resource.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center border border-gray-800 group-hover:border-[#00d09c]/30 transition-all">
                          <Book className="text-gray-600 group-hover:text-[#00d09c] transition-colors" size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#00d09c] transition-colors">{resource.title}</h4>
                          <p className="text-[10px] text-gray-600 mt-1 line-clamp-1 max-w-sm">{resource.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2 text-left">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black bg-[#00d09c]/10 text-[#00d09c] px-2 py-0.5 rounded border border-[#00d09c]/10 uppercase">{resource.type}</span>
                           <span className="text-[9px] font-black bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">{resource.subject}</span>
                        </div>
                        <div className="flex gap-1">
                           {resource.tags?.map((t, i) => <span key={i} className="text-[8px] text-gray-700 italic">#{t}</span>)}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEditModal(resource)} className="p-3 bg-black/20 hover:bg-[#00d09c] hover:text-black rounded-xl text-gray-500 transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => triggerDelete(resource.id)} className="p-3 bg-black/20 hover:bg-red-500 hover:text-white rounded-xl text-gray-500 transition-all">
                          <Trash2 size={16} />
                        </button>
                        <a href={resource.url} target="_blank" rel="noreferrer" className="p-3 bg-black/20 hover:bg-blue-500 hover:text-white rounded-xl text-gray-500 transition-all">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) }

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#121826] w-full max-w-2xl rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden text-left">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#1a2130]">
                <h3 className="text-xl font-black text-white">{editResourceId ? 'Edit Resource' : 'New Resource'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Resource Title *</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} required className={`w-full bg-[#090e17] border ${formErrors.title ? 'border-red-500' : 'border-gray-800'} rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none`} placeholder="e.g. Introduction to React" />
                  {formErrors.title && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.title}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Subject *</label>
                    <input name="subject" value={formData.subject} onChange={handleInputChange} required className={`w-full bg-[#090e17] border ${formErrors.subject ? 'border-red-500' : 'border-gray-800'} rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none`} placeholder="e.g. Web Development" />
                    {formErrors.subject && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Resource Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className={`w-full bg-[#090e17] border ${formErrors.type ? 'border-red-500' : 'border-gray-800'} rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none`}>
                      <option value="ARTICLE">Article</option>
                      <option value="VIDEO">Video</option>
                      <option value="PDF">PDF</option>
                      <option value="COURSE">Course</option>
                    </select>
                    {formErrors.type && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.type}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">URL *</label>
                  <input name="url" value={formData.url} onChange={handleInputChange} required className={`w-full bg-[#090e17] border ${formErrors.url ? 'border-red-500' : 'border-gray-800'} rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none`} placeholder="https://..." />
                  {formErrors.url && <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.url}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none" placeholder="Briefly describe the resource..."></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tags (Comma separated)</label>
                  <div className="relative">
                    <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input name="tags" value={formData.tags} onChange={handleInputChange} className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-10 py-3 text-white focus:border-[#00d09c] outline-none" placeholder="react, frontend, tutorial" />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-4 rounded-xl font-black transition-all shadow-[0_4px_20px_rgba(0,208,156,0.2)]">
                    {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto"/> : (editResourceId ? 'Update Resource' : 'Save Resource')}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-bold text-gray-500 hover:text-white transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
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

export default AdminKnowledgeHub;
