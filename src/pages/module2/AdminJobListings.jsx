import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { 
  Briefcase, 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { DatePicker } from "../../components/DateTimePicker";

const AdminJobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editJobId, setEditJobId] = useState(null); 
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requiredSkills: '', 
    type: 'FULL_TIME',
    location: '',
    remote: false,
    deadline: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const fetchJobs = useCallback(async () => {
    if (!token) {
      navigate('/');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/v1/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const responseData = await response.json();
        const actualJobs = responseData.data?.content || responseData.data || [];
        setJobs(actualJobs);
      } else {
        setError(`Failed to load jobs (Error ${response.status})`);
      }
    } catch (err) {
      setError("Cannot connect to server. Is Spring Boot running?");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openAddModal = () => {
    setFormData({
      title: '', company: '', description: '', requiredSkills: '', 
      type: 'FULL_TIME', location: '', remote: false, deadline: ''
    });
    setEditJobId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setFormData({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      requiredSkills: job.requiredSkills ? job.requiredSkills.join(', ') : '',
      type: job.type || 'FULL_TIME',
      location: job.location || '',
      remote: job.remote || false,
      deadline: job.deadline || ''
    });
    setEditJobId(job.id);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (['title', 'company', 'location', 'requiredSkills'].includes(name)) {
      processedValue = value
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    if (name === 'description') {
      processedValue = value
        .toLowerCase()
        .replace(/(^\w|\.\s+\w|!\s+\w|\?\s+\w)/g, (char) => char.toUpperCase());
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleDateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      deadline: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      company: formData.company,
      description: formData.description,
      requiredSkills: formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== ''),
      type: formData.type,
      location: formData.location,
      remote: formData.remote,
      deadline: formData.deadline ? formData.deadline : null 
    };

    const method = editJobId ? 'PUT' : 'POST';
    const url = editJobId 
      ? `http://localhost:8080/api/v1/jobs/${editJobId}` 
      : 'http://localhost:8080/api/v1/jobs';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) { 
        setIsModalOpen(false); 
        fetchJobs(); 
      } else {
        const errData = await response.json();
        alert(`Failed to save: ${errData.message || 'Error'}`);
      }
    } catch (err) { 
      alert("Server error.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Close this job listing?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/v1/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchJobs();
    } catch (err) { 
      alert("Server error.");
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="relative overflow-hidden bg-white border border-slate-200 p-10 rounded-[2.5rem] mb-12 shadow-xl shadow-slate-200/50 text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-6 shadow-sm">
                <Info size={14} /> Admin Dashboard
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Manage Job <span className="text-indigo-600">Postings</span></h1>
              <p className="text-slate-400 text-base font-medium italic">Create and curate professional opportunities for the student body.</p>
            </div>
            
            <button 
                onClick={openAddModal} 
                className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl flex items-center gap-3 transition-all active:scale-[0.98]"
            >
              <Plus size={20} /> Post New Job
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative group w-full mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search by role, company, or location..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-[1.8rem] py-6 pl-16 pr-8 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/40 text-sm font-bold placeholder:text-slate-300" 
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Fetching Active Jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-20 rounded-[3rem] border border-red-100 text-center shadow-xl">
            <AlertTriangle className="mx-auto mb-6 text-red-400" size={50}/>
            <p className="text-slate-900 font-black text-xl mb-2">Sync Error</p>
            <p className="text-slate-400 font-medium italic">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-8 text-left">
            {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-400/50 transition-all">
                    {!job.active && (
                        <div className="absolute top-4 right-[-40px] bg-red-50 text-red-500 font-black text-[9px] px-12 py-2 rotate-45 border border-red-100 uppercase tracking-widest z-10 shadow-sm">
                            Closed Listing
                        </div>
                    )}
                    
                    <div className="relative z-0">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-8 group-hover:border-indigo-100 transition-colors">
                        <Briefcase className="text-indigo-600" size={32} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h3>
                      <p className="text-indigo-500 font-black text-sm uppercase tracking-widest mb-8">{job.company}</p>
                      
                      <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <MapPin size={18} className="text-indigo-400" />
                          <span className="text-xs font-bold text-slate-600">{job.location || 'Not Specified'} {job.remote ? '(Remote)' : ''}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <Clock size={18} className="text-indigo-400" />
                          <span className="text-xs font-bold text-slate-600">{job.type?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-8 border-t border-slate-100">
                      <button onClick={() => openEditModal(job)} disabled={!job.active} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 transition-all disabled:opacity-30 active:scale-95">
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(job.id)} disabled={!job.active} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 transition-all disabled:opacity-30 active:scale-95">
                        <Trash2 size={16} /> {job.active ? 'Close' : 'Closed'}
                      </button>
                    </div>
                  </div>
                ))
            ) : (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 italic font-medium text-slate-400 shadow-inner">
                    No jobs found matching your search. Try a different keyword.
                </div>
            )}
          </div>
        )}

        {/* --- ADD/EDIT MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 animate-in zoom-in-95">
              
              <div className="flex justify-between items-center p-10 border-b border-slate-100 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center border border-indigo-100 text-indigo-600 shadow-inner">
                        <Sparkles size={30} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editJobId ? 'Update Listing' : 'Publish Opportunity'}</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Live updates across all student feeds</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><X size={28} /></button>
              </div>

              <div className="p-10 overflow-y-auto text-left bg-slate-50/30">
                <form id="jobForm" onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Role Title *</label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-6 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner font-bold" placeholder="e.g. Lead UI Designer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hiring Company *</label>
                      <input type="text" name="company" value={formData.company} onChange={handleInputChange} required className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-6 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner font-bold" placeholder="e.g. SLIIT Research" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employment Type *</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-6 text-sm text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-inner font-bold appearance-none">
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="INTERNSHIP">Internship</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Work Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-6 text-sm text-slate-900 focus:border-indigo-500 outline-none shadow-inner font-bold" placeholder="e.g. Malabe / Online" />
                    </div>
                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="remote" checked={formData.remote} onChange={handleInputChange} className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600" />
                        <span className="text-xs font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors">Fully Remote Position</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Role Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" className="w-full bg-white border border-slate-100 rounded-[2rem] p-8 text-sm text-slate-900 focus:border-indigo-500 outline-none transition-all shadow-inner font-bold leading-relaxed" placeholder="Outline the responsibilities, project scope, and team structure..."></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DatePicker
                      value={formData.deadline}
                      onChange={handleDateChange}
                      label="Application Deadline"
                      minDate={new Date().toISOString().split('T')[0]}
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mandatory Tech Skills (Comma Sep.)</label>
                      <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleInputChange} className="w-full bg-white border border-slate-100 rounded-2xl py-5 px-6 text-sm text-slate-900 focus:border-indigo-500 outline-none shadow-inner font-bold" placeholder="Java, React, PostgreSQL" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-10 border-t border-slate-100 bg-white flex justify-end gap-6 rounded-b-[3rem]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest text-xs">Discard Changes</button>
                <button type="submit" form="jobForm" disabled={isSubmitting} className="bg-slate-900 hover:bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : (editJobId ? 'Update Listing' : 'Publish to Feed')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminJobListings;