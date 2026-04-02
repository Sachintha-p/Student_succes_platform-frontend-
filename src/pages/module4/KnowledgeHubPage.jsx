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
    <div className="flex h-screen bg-[#0b0f1a] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-72 relative">
        <header className="p-8 border-b border-gray-800/20 bg-[#0b0f1a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-white via-white to-[#00d09c] bg-clip-text text-transparent italic tracking-tighter uppercase">Knowledge Hub</h1>
              <p className="text-xs text-gray-500 mt-2 font-bold tracking-widest uppercase opacity-70">Curated Library of Study Materials & Resources</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#00d09c]/10 text-[#00d09c] text-[10px] font-black rounded-full border border-[#00d09c]/20 shadow-[0_0_15px_rgba(0,208,156,0.1)] uppercase">
               <BookMarked size={14} />
               Explore & Bookmark
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 zero-scrollbar">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-10 bg-[#161b2c] p-6 rounded-3xl border border-gray-800 shadow-2xl">
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00d09c] transition-colors" size={18} />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources or ask AI a topic..."
                  className="w-full bg-[#0b0f1a] border border-gray-800 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-[#00d09c]/50 transition-all text-sm font-bold placeholder:text-gray-700"
                />
              </div>
              <button 
                onClick={handleGetAiOverview}
                disabled={!searchQuery.trim() || aiLoading}
                className="bg-[#00d09c]/10 text-[#00d09c] border border-[#00d09c]/30 hover:bg-[#00d09c] hover:text-black px-6 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 disabled:hover:bg-[#00d09c]/10 disabled:hover:text-[#00d09c] flex items-center gap-2 whitespace-nowrap"
              >
                {aiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Ask AI
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <select 
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-[#0b0f1a] border border-gray-800 py-4 pl-10 pr-10 rounded-2xl focus:outline-none focus:border-[#00d09c]/50 transition-all text-[11px] font-black uppercase appearance-none cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  <option value="Programming">Programming</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Database Systems">Database Systems</option>
                </select>
              </div>

               <button 
                onClick={fetchResources}
                className="bg-[#00d09c] text-black px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_5px_15px_rgba(0,208,156,0.2)]"
              >
                Apply Filters
              </button>

              <button 
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${showBookmarksOnly ? 'bg-yellow-400 text-black shadow-[0_5px_15px_rgba(250,204,21,0.2)]' : 'bg-[#161b2c] text-white border border-gray-800 hover:border-yellow-400/50'}`}
              >
                {showBookmarksOnly ? 'View All Resources' : 'My Bookmarks'}
              </button>
            </div>
          </div>

          {/* AI Overview Box */}
          {aiOverview && (
            <div className="mb-10 bg-gradient-to-br from-[#00d09c]/10 to-[#161b2c] border border-[#00d09c]/30 p-8 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,208,156,0.1)] relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00d09c]/20 blur-3xl rounded-full"></div>
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 bg-[#00d09c] rounded-full flex items-center justify-center text-black shadow-lg">
                     <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic">AI Overview</h3>
                    <p className="text-[10px] text-[#00d09c] font-bold uppercase tracking-widest mt-0.5">Deep Dive on: '{searchQuery}'</p>
                  </div>
               </div>
               <div className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none relative z-10 font-medium">
                  <ReactMarkdown>{aiOverview}</ReactMarkdown>
               </div>
               <button onClick={() => setAiOverview(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-black/20 p-2 rounded-xl transition-all z-10">
                 <X size={16} />
               </button>
            </div>
          )}

          {/* Grid Area */}
          {loading ? (
             <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-500">
               <Loader2 className="animate-spin text-[#00d09c]" size={40} />
               <p className="text-sm font-bold tracking-widest uppercase">Fetching resources...</p>
             </div>
          ) : displayResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {displayResources.map(res => {
                const isExternalLink = String(res.id).startsWith('ext-');
                const bookmarkedItem = bookmarks.find(b => b.id === res.id || (isExternalLink && b.url === res.url));
                const isBookmarked = !!bookmarkedItem;
                const activeResourceId = bookmarkedItem ? bookmarkedItem.id : res.id;
                
                return (
                  <div key={res.id} className="group bg-[#161b2c] border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-[#00d09c]/30 hover:bg-[#1a2135] transition-all duration-500 relative shadow-lg">
                    <div className="h-40 bg-gradient-to-br from-[#00d09c]/5 to-transparent relative overflow-hidden flex items-center justify-center">
                       <div className="absolute top-4 left-4">
                          <span className="text-[10px] font-black text-[#00d09c] bg-[#00d09c]/10 px-3 py-1 rounded-lg border border-[#00d09c]/20 uppercase">{res.type || 'DOCUMENT'}</span>
                       </div>
                       <div className="absolute top-4 right-4 z-20">
                            <button 
                              onClick={() => toggleBookmark(activeResourceId, isBookmarked, res)}
                              className={`p-2.5 rounded-xl transition-all duration-300 ${isBookmarked ? 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-110 border border-yellow-300' : 'bg-black/40 text-gray-500 border border-transparent hover:text-white hover:bg-black/60'}`}
                            >
                               <BookmarkIcon size={16} fill={isBookmarked ? "currentColor" : "none"} strokeWidth={isBookmarked ? 1 : 2} />
                            </button>
                       </div>
                       <BookOpen size={48} className="text-gray-800 group-hover:text-[#00d09c]/20 group-hover:scale-110 transition-all duration-700" />
                    </div>

                    <div className="p-8 flex flex-col flex-1">
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">{res.subject || 'GENERAL ACADEMIC'}</p>
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-[#00d09c] transition-colors">{res.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-8 flex-1">{res.description}</p>
                      
                      <div className="pt-6 border-t border-gray-800/30 flex justify-between items-center">
                        <div className="flex gap-1">
                          {res.tags?.slice(0, 2).map((tag, idx) => (
                             <span key={idx} className="text-[9px] font-black text-gray-700 uppercase bg-black/10 px-2 py-0.5 rounded italic">#{tag}</span>
                          ))}
                        </div>
                        <a 
                          href={res.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-10 h-10 bg-[#00d09c]/5 rounded-xl flex items-center justify-center text-[#00d09c] hover:bg-[#00d09c] hover:text-black transition-all shadow-inner"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center opacity-40">
               <AlertCircle size={60} className="mb-6 text-gray-700" />
               <h3 className="text-2xl font-light">No resources found</h3>
               <p className="text-sm mt-2">Try adjusting your filters or search keywords.</p>
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
    <path d="M2 targetContent-3 0 0 1 3-3h7a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a2 2 0 0 1-2-2V4z" />
    <path d="M22 4a2 2 0 0 0-2-2h-7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a2 2 0 0 0 2-2V4z" />
  </svg>
);

export default KnowledgeHubPage;
