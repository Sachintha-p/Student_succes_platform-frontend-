import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { 
  Briefcase, 
  Bell, 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Calendar,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  Loader2
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

  // --- SMART CASING LOGIC ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    // 1. Title Case (Title, Company, Location, Skills)
    if (['title', 'company', 'location', 'requiredSkills'].includes(name)) {
      processedValue = value
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    // 2. Sentence Case (Description)
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

  // --- UPDATED FILTERING LOGIC FOR SEARCH ---
  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Manage Job Postings ⚙️</h2>
            <p className="text-gray-500 mt-1">Add or update opportunities for students.</p>
          </div>
          <button onClick={openAddModal} className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
              <Plus size={20} /> Post New Job
            </button>
        </header>

        {/* --- SEARCH INPUT --- */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 group text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search by role, company, or location..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-[#121826] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d09c] transition-all shadow-lg" 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00d09c]" size={40} /></div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            <AlertTriangle className="mx-auto mb-2" size={40}/>
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-left">
            {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                    <div key={job.id} className="bg-[#121826] p-6 rounded-3xl border border-gray-800/50 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-gray-700 transition-all">
                      {!job.active && <div className="absolute top-4 right-[-30px] bg-red-500/20 text-red-500 font-black text-[10px] px-10 py-1 rotate-45 border border-red-500/20 uppercase tracking-widest">Closed</div>}
                      <div>
                        <div className="w-12 h-12 bg-[#090e17] rounded-2xl flex items-center justify-center border border-gray-800 mb-4">
                          <Briefcase className="text-[#00d09c]" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{job.title}</h3>
                <p className="text-[#00d09c] text-sm font-bold mb-4">{job.company}</p>
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={14} /> {job.location || 'Not Specified'} {job.remote ? '(Remote)' : ''}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={14} /> {job.type}
                          </div>
                        </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                        <button onClick={() => openEditModal(job)} disabled={!job.active} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-[#00d09c]/10 text-[#00d09c] hover:bg-[#00d09c]/20 border border-[#00d09c]/20 transition-all disabled:opacity-30"><Edit2 size={16} /> Edit</button>
                        <button onClick={() => handleDelete(job.id)} disabled={!job.active} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-30"><Trash2 size={16} /> {job.active ? 'Close' : 'Closed'}</button>
                      </div>
                    </div>
                  ))
            ) : (
                <div className="col-span-full py-20 text-center">
                    <p className="text-gray-500">No jobs found matching your search.</p>
                </div>
            )}
          </div>
        )}

        {/* --- FULL DATA MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#121826] w-full max-w-3xl rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-8 border-b border-gray-800 bg-[#1a2130]">
                <h3 className="text-xl font-black text-white">{editJobId ? 'Update Listing' : 'Post New Job'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white bg-black/20 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>

              <div className="p-8 overflow-y-auto text-left">
                <form id="jobForm" onSubmit={handleSubmit} className="space-y-6">
                  {/* Title & Company */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Job Title *</label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none transition-all" placeholder="e.g. Frontend Developer" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Company Name *</label>
                      <input type="text" name="company" value={formData.company} onChange={handleInputChange} required className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none transition-all" placeholder="e.g. Google" />
                    </div>
                  </div>

                  {/* Type, Location, Remote */}
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Job Type *</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none appearance-none">
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="INTERNSHIP">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Location</label>
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none" placeholder="e.g. Colombo" />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" name="remote" checked={formData.remote} onChange={handleInputChange} className="w-5 h-5 accent-[#00d09c]" />
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Fully Remote</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Detailed Description </label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="5" className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none transition-all" placeholder="Describe the responsibilities..."></textarea>
                  </div>

                  {/* Deadline & Skills */}
                  <div className="grid grid-cols-2 gap-6">
                    <DatePicker
                      value={formData.deadline}
                      onChange={handleDateChange}
                      label="Application Deadline"
                      minDate={new Date().toISOString().split('T')[0]}
                    />
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Required Skills (Comma Sep.)</label>
                      <input type="text" name="requiredSkills" value={formData.requiredSkills} onChange={handleInputChange} className="w-full bg-[#090e17] border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-[#00d09c] outline-none" placeholder="Java, React, SQL" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-8 border-t border-gray-800 bg-[#1a2130]/50 flex justify-end gap-4 rounded-b-[2.5rem]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-white transition-colors">Discard</button>
                <button type="submit" form="jobForm" disabled={isSubmitting} className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-10 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(0,208,156,0.3)]">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : (editJobId ? 'Update Listing' : 'Publish Job')}
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