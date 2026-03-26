import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, Briefcase, MapPin, Clock, X, Loader2, Send, Calendar } from 'lucide-react';

const StudentJobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const resData = await response.json();
          const jobData = resData.data?.content || resData.data || [];
          setJobs(jobData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [token]);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="mb-8 text-left">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Explore Opportunities 🚀
            </h2>
          </div>
          <p className="text-gray-500 text-sm font-medium italic">
            Find the perfect internship or job for your career path.
          </p>
        </header>

        <div className="relative mb-10 group max-w-4xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by role, company, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121826] border border-gray-800 rounded-2xl py-4 pl-14 pr-8 text-white focus:outline-none focus:border-[#00d09c] transition-all shadow-xl placeholder:text-gray-600"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#00d09c]" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Fetching listings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-[#121826] p-6 rounded-[2rem] border border-gray-800/50 hover:border-[#00d09c]/40 transition-all group shadow-lg flex flex-col justify-between relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {/* Smaller Icon Container */}
                      <div className="w-11 h-11 bg-[#090e17] rounded-xl flex items-center justify-center border border-gray-800 shadow-inner">
                        <Briefcase className="text-[#00d09c]" size={22} />
                      </div>
                      <span className="bg-[#00d09c]/10 text-[#00d09c] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border border-[#00d09c]/20">
                        {job.type?.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00d09c] transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-semibold mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span> {job.company}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                        <MapPin size={14} className="text-gray-600" /> 
                        {job.location} {job.remote && <span className="text-[#00d09c]">(Remote)</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                        <Calendar size={14} className="text-gray-600" /> 
                        Ends: {job.deadline || 'Ongoing'}
                      </div>
                    </div>
                  </div>

                  {/* Slimmer Button */}
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-3 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(0,208,156,0.2)] active:scale-[0.98] text-xs"
                  >
                    View Details <Send size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#121826]/30 rounded-[2rem] border border-dashed border-gray-800">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No listings found</p>
              </div>
            )}
          </div>
        )}

        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#121826] w-full max-w-3xl rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-[#1a2130]/50">
                <div>
                  <p className="text-[#00d09c] font-black uppercase tracking-[0.3em] text-[9px] mb-1">Opportunity Details</p>
                  <h3 className="text-xl font-black text-white">Review & Apply</h3>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 bg-gray-800/50 rounded-xl text-gray-400 hover:text-white transition-all">
                  <X size={20}/>
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh] text-left">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 bg-[#090e17] rounded-2xl flex items-center justify-center border border-gray-800 text-[#00d09c]">
                      <Briefcase size={28} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-white">{selectedJob.title}</h2>
                      <p className="text-gray-500 font-bold text-sm">{selectedJob.company} • {selectedJob.location}</p>
                   </div>
                </div>
                
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Job Description</h4>
                    <div className="bg-[#090e17] p-6 rounded-2xl border border-gray-800/50 shadow-inner">
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedJob.description}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requiredSkills?.map((skill, index) => (
                        <span key={index} className="bg-gray-800/50 text-[#00d09c] text-[10px] font-bold px-4 py-2 rounded-lg border border-gray-700/50">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="p-8 border-t border-gray-800 bg-[#1a2130]/50 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[9px] font-black text-gray-500 uppercase">Deadline</p>
                  <p className="text-white font-bold text-sm">{selectedJob.deadline || 'Open Enrollment'}</p>
                </div>
                <button className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-10 py-3.5 rounded-xl font-black shadow-lg text-sm">
                  Confirm Application
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentJobListings;