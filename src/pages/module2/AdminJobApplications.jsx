import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
  User, Briefcase, CheckCircle,
  XCircle, Search, AlertTriangle, Loader2, Calendar, ClipboardList, Info
} from 'lucide-react';

const AdminJobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const fetchApplications = useCallback(async () => {
    if (!token) { navigate('/'); return; }
    try {
      setLoading(true);
      // URL updated to match ApplicationController @RequestMapping
      const response = await fetch('http://localhost:8080/api/v1/job-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const responseData = await response.json();
        // Handling the ApiResponse wrapper
        const actualData = responseData.data || [];
        setApplications(actualData);
      } else {
        setError(`Failed to load applications (Error ${response.status})`);
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Updated to use @RequestParam for status as required by the backend
      const response = await fetch(`http://localhost:8080/api/v1/job-applications/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchApplications();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SHORTLISTED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  // Filtering using DTO field names: applicantName and jobTitle
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        <header className="relative overflow-hidden bg-white border border-slate-200 p-10 rounded-[2.5rem] mb-12 shadow-xl shadow-slate-200/50 text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                  <Info size={14} /> Admin Dashboard
                </div>
                <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  <ClipboardList size={14} /> {applications.length} Applications
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Job <span className="text-indigo-600">Applications</span>
              </h1>
              <p className="text-slate-400 text-base font-medium italic">Review and manage student career requests.</p>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 outline-none focus:border-indigo-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </header>

        <div className="relative group w-full mb-12">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
          <input
            type="text"
            placeholder="Search by student or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[1.8rem] py-6 pl-16 pr-8 text-slate-900 focus:outline-none focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/40 text-sm font-bold placeholder:text-slate-300"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
        ) : error ? (
          <div className="text-center py-20 text-red-400"><AlertTriangle className="mx-auto mb-2" size={40}/>{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 text-left">
            {filteredApps.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                    <User className="text-indigo-600" size={28} />
                  </div>
                  <div>
                    {/* Using applicantName from JobApplicationResponse */}
                    <h3 className="text-lg font-bold text-slate-900">{app.applicantName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1 font-medium text-indigo-600"><Briefcase size={12}/> {app.jobTitle}</span>
                      <span className="flex items-center gap-1 font-medium text-slate-500">@{app.companyName}</span>
                      <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </div>
                  
                  <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

                  <div className="flex gap-2 shrink-0">
                    <div className="flex flex-col items-end mr-4">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Resume</span>
                      <span className="text-xs text-slate-600 font-medium max-w-[150px] truncate">{app.resumeFileName}</span>
                    </div>
                    
                    {app.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                        >
                          <CheckCircle size={18} /> Shortlist
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-red-500 hover:bg-red-50 transition-all"
                        >
                          <XCircle size={18} /> Reject
                        </button>
                      </>
                    )}
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

export default AdminJobApplications;