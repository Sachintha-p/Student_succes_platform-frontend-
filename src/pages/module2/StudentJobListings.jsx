import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Sidebar from '../../components/Sidebar';
import { 
  Search, Briefcase, MapPin, X, Loader2, Send, Calendar, 
  User, Mail, Phone, Building2, ChevronRight, Sparkles,
  CheckCircle, AlertTriangle, Zap, Target, Check, XCircle 
} from 'lucide-react';

const StudentJobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const navigate = useNavigate(); 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error("No access token found. Redirecting to login...");
      navigate('/login'); 
      return;
    }

    try {
      setLoading(true);
      
      // 1. Fetch All Active Jobs
      const jobsResponse = await fetch('http://localhost:8080/api/v1/jobs?size=1000', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (jobsResponse.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      if (jobsResponse.ok) {
        const resData = await jobsResponse.json();
        const rawJobs = resData.data?.content || resData.data || [];
        
        const uniqueJobs = Array.from(new Map(rawJobs.map(item => [item.id, item])).values());
        setJobs(uniqueJobs);
      }

      // 2. Fetch AI Recommendations
      const recsResponse = await fetch('http://localhost:8080/api/v1/jobs/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (recsResponse.ok) {
        const recsData = await recsResponse.json();
        setRecommendations(recsData.data || []);
      }

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNameChange = (e) => {
    const raw = e.target.value;
    const formatted = raw.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setFullName(formatted);
  };
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidPhone = (val) => /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\d)\d{6}$/.test(val);

  const handleApply = async () => {
    if (!selectedJob) return;
    const token = localStorage.getItem('accessToken');
    
    if (!fullName || !email || !phoneNumber) {
      return showToast("Please fill in all details!", "error");
    }
    if (!isValidEmail(email)) return showToast("Please enter a valid email.", "error");
    if (!isValidPhone(phoneNumber)) return showToast("Please enter a valid phone number.", "error");
    
    setIsApplying(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/job-applications', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ jobListingId: selectedJob.id, fullName, email, phoneNumber, coverLetter: "" })
      });
      
      if (response.ok) {
        showToast("Applied successfully! 🚀");
        setSelectedJob(null);
        setFullName(''); setEmail(''); setPhoneNumber('');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to submit application.", "error");
      }
    } catch (err) { 
      showToast("Server error. Please try again.", "error"); 
    } finally { 
      setIsApplying(false); 
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans relative">
      <Sidebar />
      <main className="flex-1 ml-72 p-10 relative">
        {/* Header Section */}
        <header className="relative overflow-hidden bg-white border border-slate-200 p-10 rounded-[2.5rem] mb-12 shadow-xl shadow-slate-200/50 text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-6 shadow-sm">
                <Sparkles size={14} className="animate-pulse" /> Career Opportunities
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Your Career <span className="text-indigo-600">Starts Here</span></h1>
              <p className="text-slate-400 text-base font-medium italic">Discover {jobs.length} premium roles curated for your future success at SLIIT.</p>
            </div>
            
            <div className="relative group w-full xl:w-[450px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" placeholder="Search by role, company, or tech stack..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] py-5 pl-14 pr-6 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner text-sm font-bold placeholder:text-slate-300"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">AI Analyzing Matches...</p>
          </div>
        ) : (
          <>
            {/* AI RECOMMENDATIONS SECTION */}
            {recommendations.length > 0 && !searchTerm && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Zap className="text-white" size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">AI Top Matches For You</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="relative bg-white p-1 rounded-[2.5rem] border border-indigo-200 hover:border-indigo-500 transition-all group shadow-xl shadow-indigo-100/20 flex flex-col active:scale-[0.98]">
                      
                      {/* Match Score Badge */}
                      <div className="absolute -top-4 right-8 bg-indigo-600 text-white font-black text-xs px-5 py-2 rounded-full shadow-xl flex items-center gap-2 z-10">
                        <Target size={14} /> {rec.matchScore}% Match
                      </div>

                      <div className="bg-white p-8 rounded-[2.3rem] h-full flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100"><Zap className="text-indigo-600" size={28} /></div>
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-100">{rec.type?.replace('_', ' ')}</span>
                          </div>
                          
                          <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{rec.jobTitle}</h3>
                          <p className="text-slate-500 font-bold mb-6 flex items-center gap-2 text-sm italic"><Building2 size={16} className="text-indigo-400" /> {rec.companyName}</p>

                          {/* Skill Matching UI */}
                          <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                            <div>
                              <p className="text-[10px] text-slate-400 font-black uppercase mb-3 flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> Matched Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {rec.matchedSkills?.map((s, i) => <span key={i} className="text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100 font-bold">{s}</span>)}
                                {rec.matchedSkills?.length === 0 && <span className="text-[10px] text-slate-400 italic font-medium">No direct matches</span>}
                              </div>
                            </div>
                            
                            {rec.missingSkills?.length > 0 && (
                              <div className="pt-4 border-t border-slate-200/50">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-3 flex items-center gap-2"><XCircle size={14} className="text-red-400"/> Gaps Identified</p>
                                <div className="flex flex-wrap gap-2">
                                  {rec.missingSkills?.map((s, i) => <span key={i} className="text-[10px] bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100 font-bold">{s}</span>)}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-sm text-slate-400 font-bold mb-8">
                            <MapPin size={18} className="text-indigo-400" /> {rec.location}
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const fullJobDetails = jobs.find(j => j.id === rec.jobListingId);
                            if(fullJobDetails) setSelectedJob(fullJobDetails);
                            else showToast("Job details temporarily unavailable.", "error");
                          }} 
                          className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 shadow-lg"
                        >
                          View Matching Role <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ALL JOBS SECTION */}
            <div className="flex items-center gap-3 mb-8">
               <div className="h-8 w-1.5 bg-slate-300 rounded-full"></div>
               <h2 className="text-2xl font-black text-slate-900">Discover All Positions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200/50 hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] group-hover:bg-indigo-600 transition-all duration-300 -mr-12 -mt-12 group-hover:mr-0 group-hover:mt-0 opacity-20 group-hover:opacity-10"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors shadow-sm">
                        <Briefcase className="text-indigo-600" size={32} />
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.1em] border border-indigo-100 shadow-sm">{job.type?.replace('_', ' ')}</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-slate-500 font-bold mb-8 flex items-center gap-2 italic text-sm">
                      <Building2 size={16} className="text-indigo-400" /> {job.company}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <MapPin size={18} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Calendar size={18} className="text-indigo-500" />
                        <span className="text-xs font-bold text-slate-600">{job.deadline || 'Ongoing'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedJob(job)} 
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-auto group/btn"
                  >
                    View Details <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal Logic (Premium Indigo Version) */}
        {selectedJob && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
             {/* Modal Header */}
             <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
               <div className="flex items-center gap-8 text-left">
                   <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center border border-indigo-100 text-indigo-600 shadow-inner">
                     <Briefcase size={36} />
                   </div>
                   <div>
                     <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 flex items-center gap-2">
                       <Sparkles size={12} /> Opening ID #{selectedJob.id}
                     </p>
                     <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedJob.title}</h2>
                     <div className="flex items-center gap-4 mt-2">
                        <p className="text-slate-500 font-bold flex items-center gap-2 text-sm italic"><Building2 size={18} className="text-indigo-400" /> {selectedJob.company}</p>
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                        <p className="text-slate-500 font-bold flex items-center gap-2 text-sm italic"><MapPin size={18} className="text-indigo-400" /> {selectedJob.location}</p>
                     </div>
                   </div>
               </div>
               <button 
                onClick={() => setSelectedJob(null)} 
                className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
               >
                 <X size={28}/>
               </button>
             </div>

             <div className="p-10 overflow-y-auto text-left flex-1 bg-slate-50/30">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 <div className="lg:col-span-7 space-y-12">
                   <section>
                     <div className="flex items-center gap-3 mb-6">
                        <div className="h-6 w-1.5 bg-indigo-600 rounded-full"></div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Role Description</h4>
                     </div>
                     <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/50 shadow-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap text-base">
                        {selectedJob.description}
                     </div>
                   </section>

                   <section className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                      <div className="relative z-10 flex items-center justify-between">
                         <div>
                            <h4 className="text-2xl font-black mb-2">Ready to take the leap?</h4>
                            <p className="text-indigo-200 text-sm font-medium">Join {selectedJob.company} and start your journey today.</p>
                         </div>
                         <Briefcase size={60} className="text-white/20" />
                      </div>
                   </section>
                 </div>

                 <div className="lg:col-span-5">
                   <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 sticky top-0">
                     <div className="text-center mb-10">
                        <h4 className="text-2xl font-black text-slate-900 mb-2">Fast Application</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Initial direct contact with HR</p>
                     </div>
                     
                     <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Candidate Name</label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input 
                              type="text" placeholder="e.g. John Doe" 
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner font-bold" 
                              value={fullName} onChange={handleNameChange} 
                            />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Work Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input 
                              type="email" placeholder="email@sliit.lk" 
                              className={`w-full bg-slate-50 border rounded-2xl py-5 pl-14 pr-6 text-sm text-slate-900 outline-none transition-all font-bold shadow-inner ${email && !isValidEmail(email) ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500 focus:bg-white'}`} 
                              value={email} onChange={(e) => setEmail(e.target.value)} 
                            />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                          <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            <input 
                              type="text" placeholder="07XXXXXXXX" 
                              className={`w-full bg-slate-50 border rounded-2xl py-5 pl-14 pr-6 text-sm text-slate-900 outline-none transition-all font-bold shadow-inner ${phoneNumber && !isValidPhone(phoneNumber) ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-indigo-500 focus:bg-white'}`} 
                              value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} 
                            />
                          </div>
                       </div>
                     </div>

                     <div className="mt-12">
                       <button 
                        onClick={handleApply} 
                        disabled={isApplying} 
                        className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-6 rounded-3xl font-black shadow-xl shadow-indigo-100 text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 group"
                       >
                         {isApplying ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Submit Application</>}
                       </button>
                       <p className="text-[9px] text-slate-400 text-center mt-6 font-bold uppercase tracking-widest leading-relaxed">By clicking submit, you agree to share your SLIIT student profile with {selectedJob.company}</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
          </div>
        )}

        {/* Premium Toast Notification */}
        {toast.show && (
          <div 
            className={`fixed bottom-10 right-10 flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 animate-in slide-in-from-right-10 ${
              toast.type === 'success' 
                ? 'bg-white border-l-8 border-indigo-500 text-slate-900' 
                : 'bg-white border-l-8 border-red-500 text-slate-900'
            }`}
            style={{ zIndex: 9999 }}
          >
            <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-indigo-50' : 'bg-red-50'}`}>
              {toast.type === 'success' ? (
                <CheckCircle className="text-indigo-600" size={24} />
              ) : (
                <AlertTriangle className="text-red-500" size={24} />
              )}
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">{toast.type === 'success' ? 'Success' : 'Attention Required'}</p>
              <p className="font-medium text-slate-500 text-xs">{toast.message}</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentJobListings;