import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { 
  Briefcase, Search, Plus, MapPin, 
  Clock, Trash2, Edit2, X, AlertTriangle, Loader2
} from 'lucide-react';
// Verify that DateTimePicker uses "export const DatePicker" and NOT "require()"
import { DatePicker } from "../../components/DateTimePicker";

const AdminJobListings = () => {
  const [jobs, setJobs] = useState([]); // Initialized as array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editJobId, setEditJobId] = useState(null); 
  
  const [formData, setFormData] = useState({
    title: '', company: '', description: '', requiredSkills: '', 
    type: 'FULL_TIME', location: '', remote: false, deadline: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const fetchJobs = useCallback(async () => {
    if (!token) { navigate('/'); return; }
    try {
      setLoading(true);
      // UPDATED: Added ?size=1000 to fetch all records instead of the default page size
      const response = await fetch('http://localhost:8080/api/v1/jobs?size=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const responseData = await response.json();
        // CRASH FIX: Ensure we extract the array even if it's inside a PagedResponse object
        const actualJobs = responseData.data?.content || (Array.isArray(responseData.data) ? responseData.data : []);
        setJobs(actualJobs);
      } else {
        setError(`Failed to load jobs (Error ${response.status})`);
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openAddModal = () => {
    setFormData({ title: '', company: '', description: '', requiredSkills: '', type: 'FULL_TIME', location: '', remote: false, deadline: '' });
    setEditJobId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setFormData({
      title: job.title || '',
      company: job.company || '',
      description: job.description || '',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
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
      processedValue = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    }
    if (name === 'description') {
      processedValue = value.toLowerCase().replace(/(^\w|\.\s+\w|!\s+\w|\?\s+\w)/g, (char) => char.toUpperCase());
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : processedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== ''),
      deadline: formData.deadline || null 
    };

    const method = editJobId ? 'PUT' : 'POST';
    const url = editJobId ? `http://localhost:8080/api/v1/jobs/${editJobId}` : 'http://localhost:8080/api/v1/jobs';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) { setIsModalOpen(false); fetchJobs(); }
    } catch (err) { alert("Server error."); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Close this job listing?")) return;
    try {
      await fetch(`http://localhost:8080/api/v1/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJobs();
    } catch (err) { alert("Server error."); }
  };

  // CRASH FIX: Safeguard filter against non-array 'jobs'
  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Manage Job Postings Ã¢Å¡â„¢Ã¯Â¸Â</h2>
            <p className="text-gray-500">Add or update opportunities for students.</p>
          </div>
          <button onClick={openAddModal} className="bg-indigo-600 text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={20} /> Post New Job</button>
        </header>

        <div className="relative group mb-8 text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Search jobs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:border-indigo-500 outline-none" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
        ) : error ? (
          <div className="text-center py-20 text-red-400"><AlertTriangle className="mx-auto mb-2" size={40}/>{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden">
                {!job.active && <div className="absolute top-4 right-[-30px] bg-red-500/20 text-red-500 text-[10px] px-10 py-1 rotate-45 border border-red-500/20 uppercase tracking-widest">Closed</div>}
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 mb-4"><Briefcase className="text-indigo-600" size={24} /></div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
                <p className="text-indigo-600 text-sm font-bold mb-4">{job.company}</p>
                <div className="space-y-2 mb-6 text-xs text-gray-500">
                  <div className="flex items-center gap-2"><MapPin size={14} /> {job.location || 'Not Specified'} {job.remote ? '(Remote)' : ''}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> {job.type}</div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button onClick={() => openEditModal(job)} disabled={!job.active} className="flex-1 flex justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-indigo-600/10 text-indigo-600 disabled:opacity-30"><Edit2 size={16} /> Edit</button>
                  <button onClick={() => handleDelete(job.id)} disabled={!job.active} className="flex-1 flex justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 disabled:opacity-30"><Trash2 size={16} /> Close</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-8 border-b border-slate-200 bg-slate-100">
                <h3 className="text-xl font-black text-slate-900">{editJobId ? 'Update Listing' : 'Post New Job'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-slate-900"><X size={20} /></button>
              </div>
              <div className="p-8 overflow-y-auto">
                <form id="jobForm" onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-black text-gray-500 uppercase">Job Title *</label><input name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-indigo-500 outline-none" /></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase">Company *</label><input name="company" value={formData.company} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-indigo-500 outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div><label className="text-[10px] font-black text-gray-500 uppercase">Job Type *</label><select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none"><option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="INTERNSHIP">Internship</option></select></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase">Location</label><input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-indigo-500 outline-none" /></div>
                    <div className="flex items-center pt-6"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="remote" checked={formData.remote} onChange={handleInputChange} className="w-5 h-5 accent-[#00d09c]" /><span className="text-xs font-bold text-slate-500">Remote</span></label></div>
                  </div>
                  <DatePicker value={formData.deadline} onChange={(v) => setFormData(p => ({...p, deadline: v}))} label="Deadline" minDate={new Date().toISOString().split('T')[0]} />
                  <div><label className="text-[10px] font-black text-gray-500 uppercase">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-indigo-500 outline-none"></textarea></div>
                  <div><label className="text-[10px] font-black text-gray-500 uppercase">Skills (Comma Sep.)</label><input name="requiredSkills" value={formData.requiredSkills} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-indigo-500 outline-none" /></div>
                </form>
              </div>
              <div className="p-8 border-t border-slate-200 flex justify-end gap-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-500">Discard</button><button type="submit" form="jobForm" disabled={isSubmitting} className="bg-indigo-600 text-gray-900 px-10 py-3 rounded-xl font-black">{isSubmitting ? <Loader2 className="animate-spin"/> : (editJobId ? 'Update' : 'Publish')}</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminJobListings;