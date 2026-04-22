import { useState, useEffect } from 'react';
import { Search, BookMarked, ExternalLink, Bookmark as BookmarkIcon, Filter, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import ReactMarkdown from 'react-markdown';

const KnowledgeHubPage = () => {
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiOverview, setAiOverview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const getResourceImage = (type, id) => {
    const patterns = {
      'VIDEO': 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop',
      'ARTICLE': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop',
      'PDF': 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=2073&auto=format&fit=crop',
      'COURSE': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
      'DOCUMENT': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop'
    };
    const seed = typeof id === 'number' ? id % 3 : 0;
    const variants = ['', '&sig=1', '&sig=2'];
    return (patterns[type] || patterns['DOCUMENT']) + variants[seed];
  };
  
  const userId = 12; // Simulation
  const token = localStorage.getItem('accessToken') || 'mock-token-for-testing';

  useEffect(() => {
    fetchResources();
    fetchBookmarks();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (subjectFilter) queryParams.append('subject', subjectFilter);
      if (typeFilter) queryParams.append('type', typeFilter);

      const res = await fetch(`http://localhost:8080/api/v1/resources?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setResources(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/bookmarks?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setBookmarks(data.data);
    } catch (err) { console.error(err); }
  };

  const toggleBookmark = async (resourceId, isBookmarked, resObj = null) => {
    try {
      const isExternal = String(resourceId).startsWith('ext-');
      let finalId = resourceId;

      // Optimistic UI Update for instant visual feedback
      if (isBookmarked) {
        setBookmarks(prev => prev.filter(b => b.id !== resourceId && b.url !== resObj?.url));
      } else if (resObj) {
        setBookmarks(prev => [...prev, resObj]);
      }

      if (isExternal) {
        // Persist dynamic resource
        const addRes = await fetch(`http://localhost:8080/api/v1/resources`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            title: resObj.title, url: resObj.url, description: resObj.description,
            subject: 'Targeted Search', type: resObj.type, tags: [searchQuery]
          })
        });
        const d = await addRes.json();
        if (d.success) finalId = d.data.id;
      }

      if (isBookmarked) {
        await fetch(`http://localhost:8080/api/v1/bookmarks/${finalId}?userId=${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await fetch(`http://localhost:8080/api/v1/bookmarks/${finalId}?userId=${userId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      fetchBookmarks();
      if (isExternal) fetchResources(); // Refresh grid to show the newly saved real resource
    } catch (err) { console.error(err); }
  };

  const filteredResources = resources.filter(res => 
    res.subject !== 'Targeted Search' &&
    (res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    (subjectFilter === '' || res.subject === subjectFilter)
  );

  const dynamicExternalLinks = searchQuery.trim().length > 2 ? [
    { id: `ext-yt`, title: `YouTube Video Tutorials`, type: 'VIDEO', subject: 'External Link', description: `Watch deep-dive video explanations on "${searchQuery}" via YouTube.`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' tutorial')}` },
    { id: `ext-art`, title: `Articles & Web Guides`, type: 'ARTICLE', subject: 'External Link', description: `Read comprehensive technical articles and guides covering "${searchQuery}".`, url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' guide')}` },
    { id: `ext-pdf`, title: `Academic Notes & Research`, type: 'PDF', subject: 'External Link', description: `Explore published academic research and university notes.`, url: `https://scholar.google.com/scholar?q=${encodeURIComponent(searchQuery)}` },
    { id: `ext-crs`, title: `Interactive Courses`, type: 'COURSE', subject: 'External Link', description: `Discover structured learning paths and professional courses.`, url: `https://www.coursera.org/search?query=${encodeURIComponent(searchQuery)}` }
  ] : [];

  const displayResources = showBookmarksOnly ? bookmarks : [...filteredResources, ...dynamicExternalLinks];

  const handleGetAiOverview = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiOverview(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/ai-assistant/ask?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: "Provide a concise professional academic overview of: " + searchQuery })
      });
      const data = await res.json();
      if (data.success) {
        setAiOverview(data.data.answer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-72 relative">
        <header className="p-10 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Knowledge Hub</h1>
              <p className="text-sm text-slate-400 mt-2 font-bold tracking-widest uppercase">Curated Academic Library & Resources</p>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Library Assets</span>
                <span className="text-2xl font-black text-indigo-600">{resources.length}</span>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curated List</span>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-xl border border-indigo-100 shadow-sm uppercase tracking-widest">
                  <BookMarked size={12} strokeWidth={3} />
                  Premium Access
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 zero-scrollbar">
          {/* Controls Bar */}
          <div className="mb-12 space-y-6">
            <div className="flex flex-col xl:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-200/50 shadow-2xl shadow-slate-200/40">
              <div className="flex-1 flex gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for subjects, topics, or materials..."
                    className="w-full bg-slate-50 border border-slate-100 py-5 pl-14 pr-6 rounded-[1.5rem] focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all text-base font-bold placeholder:text-slate-300 text-slate-700"
                  />
                </div>
                <button 
                  onClick={handleGetAiOverview}
                  disabled={!searchQuery.trim() || aiLoading}
                  className="bg-indigo-600 hover:bg-slate-900 text-white px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-3 whitespace-nowrap shadow-xl shadow-indigo-200 group active:scale-95"
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
                  Ask Intelligence
                </button>
              </div>
              
              <button 
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 ${showBookmarksOnly ? 'bg-amber-500 text-white shadow-xl shadow-amber-200' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-200'}`}
              >
                <BookmarkIcon size={18} fill={showBookmarksOnly ? "white" : "none"} />
                {showBookmarksOnly ? 'View All Hub' : 'My Bookmarks'}
              </button>
            </div>

            {/* Pill Style Filters (Wrapping) */}
            <div className="flex flex-wrap gap-2 px-2">
              <div className="flex items-center px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mr-2">
                <Filter size={12} className="mr-2" /> Filter By
              </div>
              {['', 'Programming', 'Computer Science', 'Mathematics', 'Database Systems', 'Software Engineering'].map(subj => (
                <button
                  key={subj}
                  onClick={() => setSubjectFilter(subj)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${subjectFilter === subj ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'}`}
                >
                  {subj || 'All Subjects'}
                </button>
              ))}
            </div>
          </div>

          {/* AI Overview Box (Glassmorphic Redesign) */}
          {aiOverview && (
            <div className="mb-12 bg-white/60 backdrop-blur-2xl border border-indigo-100 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-6 duration-700 group">
               {/* Ambient Mesh Background */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:scale-110"></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-200/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>

               <div className="flex items-center gap-5 mb-10 relative z-10">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 animate-pulse">
                     <Sparkles size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Subject Brief</h3>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                       <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                       Strategic Intelligence for: '{searchQuery}'
                    </p>
                  </div>
               </div>
               <div className="text-lg text-slate-700 leading-relaxed max-w-none relative z-10 font-medium bg-white/40 p-8 rounded-[2rem] border border-white/50 shadow-inner italic">
                  <ReactMarkdown>{aiOverview}</ReactMarkdown>
               </div>
               <button onClick={() => setAiOverview(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition-all hover:bg-white p-3 rounded-full z-10 shadow-sm">
                 <X size={24} />
               </button>
            </div>
          )}

          {/* Grid Area */}
          {loading ? (
             <div className="h-96 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
               <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Synchronizing Knowledge Base</p>
             </div>
          ) : displayResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {displayResources.map(res => {
                const isExternalLink = String(res.id).startsWith('ext-');
                const bookmarkedItem = bookmarks.find(b => b.id === res.id || (isExternalLink && b.url === res.url));
                const isBookmarked = !!bookmarkedItem;
                const activeResourceId = bookmarkedItem ? bookmarkedItem.id : res.id;
                
                return (
                  <div key={res.id} className="group bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-indigo-400/40 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.12)] transition-all duration-500 relative animate-in fade-in slide-in-from-bottom-4">
                    {/* Image Header with Geometric Pattern */}
                    <div className="h-52 relative overflow-hidden">
                       <img 
                        src={getResourceImage(res.type, res.id)} 
                        alt={res.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                       
                       <div className="absolute top-5 left-5">
                          <span className="text-[10px] font-black text-white bg-indigo-600/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 uppercase tracking-[0.1em]">{res.type || 'DOCUMENT'}</span>
                       </div>
                       <div className="absolute top-5 right-5 z-20">
                            <button 
                              onClick={() => toggleBookmark(activeResourceId, isBookmarked, res)}
                              className={`p-3 rounded-2xl transition-all duration-300 backdrop-blur-xl ${isBookmarked ? 'bg-amber-400 text-white shadow-xl scale-110 rotate-12' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:scale-110'}`}
                            >
                               <BookmarkIcon size={18} fill={isBookmarked ? "white" : "none"} strokeWidth={isBookmarked ? 1.5 : 2.5} />
                            </button>
                       </div>

                       <div className="absolute bottom-5 left-5 right-5">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/20">
                                <Search size={14} />
                             </div>
                             <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest truncate">{res.subject || 'GENERAL RESEARCH'}</span>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 flex flex-col flex-1 bg-white">
                      <h3 className="text-xl font-extrabold text-slate-900 mb-4 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{res.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-10 flex-1 font-medium">{res.description}</p>
                      
                      <div className="pt-6 border-t border-slate-50 flex justify-between items-center mt-auto">
                        <div className="flex gap-2">
                          {(res.tags || []).slice(0, 2).map((tag, idx) => (
                             <span key={idx} className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 tracking-tighter">#{tag}</span>
                          ))}
                        </div>
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-indigo-600 text-[11px] font-black text-slate-900 hover:text-white transition-all rounded-xl shadow-sm hover:shadow-indigo-200 active:scale-95 group/link"
                        >
                          ACCESS <ExternalLink size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                  <AlertCircle size={40} />
               </div>
               <h3 className="text-2xl font-extrabold text-slate-900">No matching assets</h3>
               <p className="text-sm mt-2 text-slate-400 font-medium">Try broadening your search or clearing filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Mock Component for clarity
const BookOpen = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 3 0 0 1 3-3h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a2 2 0 0 1-2-2V4z" />
    <path d="M22 4a2 2 0 0 0-2-2h-7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a2 2 0 0 0 2-2V4z" />
  </svg>
);

export default KnowledgeHubPage;