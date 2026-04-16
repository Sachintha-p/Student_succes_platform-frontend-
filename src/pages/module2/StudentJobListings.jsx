import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Search, Briefcase, MapPin, X, Loader2, Send, Calendar, 
  User, Mail, Phone, FileText, Building2, ChevronRight, Sparkles,
  CheckCircle2, Info
} from 'lucide-react';

const StudentJobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const token = localStorage.getItem('accessToken');

  // --- FETCH JOBS WITH DUPLICATE PROTECTION ---
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      // We fetch a large size to get all records, but handle them safely
      const response = await fetch('http://localhost:8080/api/v1/jobs?size=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const resData = await response.json();
        const rawJobs = resData.data?.content || resData.data || [];
        
        // --- THE FIX: Filter duplicates by ID ---
        // This ensures that even if the API returns the same job twice, 
        // the frontend only shows it once.
        const uniqueJobs = Array.from(
          new Map(rawJobs.map(job => [job.id, job])).values()
        );
        
        setJobs(uniqueJobs);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Validation Helpers
  const handleNameChange = (e) => {
    const rawValue = e.target.value;
    const formattedName = rawValue.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setFullName(formattedName);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^(?:0|94|\+94)?(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)(0|2|3|4|5|7|9)|7(0|1|2|4|5|6|7|8)\d)\d{6}$/.test(phone);

  const handleApply = async () => {
    if (!selectedJob) return;
    if (!fullName || !email || !phoneNumber) return alert("Fill in all details!");
    if (!isValidEmail(email)) return alert("Invalid email!");
    if (!isValidPhone(phoneNumber)) return alert("Invalid 10-digit Phone Number!");

    setIsApplying(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/job-applications', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobListingId: selectedJob.id, fullName, email, phoneNumber, coverLetter: "" })
      });

      if (response.ok) {
        alert("Applied successfully! 🚀");
        setSelectedJob(null);
        setFullName(''); setEmail(''); setPhoneNumber('');
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Submission failed.");
      }
    } catch (err) { alert("Server error."); } finally { setIsApplying(false); }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-8">
        <header className="relative overflow-hidden bg-[#121826] rounded-[2.5rem] border border-gray-800 p-10 mb-10 shadow-xl text-left">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#00d09c]/10 text-[#00d09c] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00d09c]/20 mb-5">
                <Sparkles size={14} /> Verified Jobs
              </div>
              <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Your Career <span className="text-[#00d09c]">Starts Here</span></h1>
              <p className="text-gray-500 text-sm font-medium italic">Showing {jobs.length} unique opportunities curated for you.</p>
            </div>
            
            <div className="relative group w-full md:w-[400px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by role or company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#090e17] border border-gray-700 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-[#00d09c]/50 transition-all shadow-2xl placeholder:text-gray-600"
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-[#00d09c]" size={40} />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Cleaning duplicate entries</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-left">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-[#121826] p-8 rounded-[2.5rem] border border-gray-800/50 hover:border-[#00d09c]/30 transition-all group shadow-lg flex flex-col justify-between active:scale-[0.98]">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-[#090e17] rounded-2xl flex items-center justify-center border border-gray-800 group-hover:border-[#00d09c]/20 transition-colors">
                      <Briefcase className="text-[#00d09c]" size={28} />
                    </div>
                    <span className="bg-[#00d09c]/5 text-[#00d09c] text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border border-[#00d09c]/10">
                      {job.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d09c] transition-colors line-clamp-1">{job.title}</h3>
                  <p className="text-gray-500 font-semibold mb-8 flex items-center gap-2">
                    <Building2 size={16} className="text-gray-600" /> {job.company}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <MapPin size={18} className="text-gray-700" /> {job.location}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <Calendar size={18} className="text-gray-700" /> Ends: {job.deadline || 'Ongoing'}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(job)} className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-4 rounded-[1.2rem] font-black transition-all flex items-center justify-center gap-2 shadow-lg">
                  View Details <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL (Restored Premium Two-Column Version) */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl overflow-y-auto">
            <div className="bg-[#121826] w-full max-w-5xl rounded-[3rem] border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh]">
              
              <div className="p-10 border-b border-gray-800 flex justify-between items-center bg-[#1a2130]/30">
                <div className="flex items-center gap-6 text-left">
                    <div className="w-16 h-16 bg-[#00d09c]/10 rounded-[1.5rem] flex items-center justify-center border border-[#00d09c]/20 text-[#00d09c]"><Briefcase size={32} /></div>
                    <div>
                      <p className="text-[#00d09c] font-black uppercase tracking-[0.4em] text-[10px] mb-1">Job Specification</p>
                      <h2 className="text-3xl font-black text-white leading-tight">{selectedJob.title}</h2>
                      <p className="text-gray-500 font-bold flex items-center gap-2 mt-1 italic italic">
                        <Building2 size={16} /> {selectedJob.company} • <MapPin size={16} /> {selectedJob.location}
                      </p>
                    </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-3 bg-gray-800/40 rounded-2xl text-gray-500 hover:text-white hover:bg-red-500/10 transition-all"><X size={28}/></button>
              </div>

              <div className="p-10 overflow-y-auto text-left flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-7 space-y-10">
                    <section>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-4 w-1 bg-[#00d09c] rounded-full"></div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">About the Role</h4>
                      </div>
                      <div className="bg-[#090e17]/50 p-8 rounded-[2rem] border border-gray-800 shadow-inner">
                        <p className="text-gray-400 text-base leading-relaxed whitespace-pre-wrap font-medium">{selectedJob.description}</p>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-4 w-1 bg-[#00d09c] rounded-full"></div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Requirements</h4>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedJob.requiredSkills?.map((skill, index) => (
                          <span key={index} className="bg-[#00d09c]/5 text-[#00d09c] text-xs font-bold px-6 py-3 rounded-xl border border-[#00d09c]/10">{skill}</span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="bg-[#090e17] p-8 rounded-[2.5rem] border border-gray-800 sticky top-0 shadow-2xl">
                      <div className="text-center mb-10">
                        <h4 className="text-xl font-black text-white mb-2">Direct Apply</h4>
                        <p className="text-xs text-gray-500 font-medium">Fill details to proceed</p>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase ml-3">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00d09c] transition-colors" size={18} />
                            <input type="text" placeholder="Auto-formatting Name" className="w-full bg-[#121826] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#00d09c] outline-none transition-all" value={fullName} onChange={handleNameChange} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase ml-3">Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00d09c] transition-colors" size={18} />
                            <input type="email" placeholder="name@example.com" className={`w-full bg-[#121826] border rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none transition-all ${email && !isValidEmail(email) ? 'border-red-500/40 focus:border-red-500' : 'border-gray-800 focus:border-[#00d09c]'}`} value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase ml-3">Phone</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00d09c] transition-colors" size={18} />
                            <input type="text" placeholder="07XXXXXXXX" className={`w-full bg-[#121826] border rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none transition-all ${phoneNumber && !isValidPhone(phoneNumber) ? 'border-red-500/40 focus:border-red-500' : 'border-gray-800 focus:border-[#00d09c]'}`} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <button onClick={handleApply} disabled={isApplying} className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-5 rounded-2xl font-black shadow-lg mt-10 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                        {isApplying ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Application</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentJobListings;