import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Send, 
  Loader2, 
  Trash2, 
  Plus, 
  BookOpen, 
  Search,
  MessageSquare,
  History,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Rocket,
  BarChart2,
  Target,
  Zap,
  Bot,
  BrainCircuit,
  Layers,
  ShieldCheck
} from 'lucide-react';

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

const AiChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  
  // Resources Modal State
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [modalResources, setModalResources] = useState([]);

  const messagesEndRef = useRef(null);
  const userId = 12; // Static user for demo
  const token = localStorage.getItem('accessToken') || 'mock-token-for-testing';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/ai-assistant/user/${userId}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Sort conversations by ID descending to show newest first
        const sorted = data.data.sort((a, b) => b.id - a.id);
        setConversations(sorted);
      }
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setRecommendations([]);
  };

  const requestDeleteConversation = (e, id) => {
    e.stopPropagation();
    setConfirmingDeleteId(id);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setConfirmingDeleteId(null);
  };

  const confirmDeleteConversation = async (e, id) => {
    e.stopPropagation();
    setConfirmingDeleteId(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/ai-assistant/conversation/${id}/deactivate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConvId === id) startNewChat();
      }
    } catch (err) { console.error(err); }
  };

  const loadConversation = async (id) => {
    setActiveConvId(id);
    setMessages([]);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/ai-assistant/conversation/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const reconstructedMessages = data.data.map(msg => {
          let recs = [];
          if (msg.role === 'assistant') {
            recs = [
              { id: `yt-${msg.id}`, title: `YouTube Search: ${msg.content.substring(0, 30)}`, type: 'VIDEO', subject: 'External', description: `Video tutorials related to ${msg.content.substring(0, 50)}...`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(msg.content.substring(0, 50))}` },
              { id: `art-${msg.id}`, title: `Academic Articles`, type: 'ARTICLE', subject: 'External', description: `Web articles found for this topic.`, url: `https://www.google.com/search?q=${encodeURIComponent(msg.content.substring(0, 50))}` }
            ];
          }
          return { role: msg.role, content: msg.content, resources: recs };
        });
        setMessages(reconstructedMessages);
        if (reconstructedMessages.length > 0) {
            const lastAssistantMsg = [...reconstructedMessages].reverse().find(m => m.role === 'assistant');
            if (lastAssistantMsg) setRecommendations(lastAssistantMsg.resources);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/api/v1/ai-assistant/ask?userId=${userId}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query: input, 
          conversationId: activeConvId 
        })
      });
      
      const data = await res.json();
      if (data.success) {
        let recs = data.data.recommendedResources || [];
        if (recs.length === 0 && input.trim()) {
           recs = [
             { id: `yt-${Date.now()}`, title: `YouTube Tutorials`, type: 'VIDEO', subject: 'External', description: `Watch comprehensive video tutorials on ${input}.`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(input + ' tutorial')}` },
             { id: `art-${Date.now()}`, title: `Articles & Guides`, type: 'ARTICLE', subject: 'External', description: `Read detailed web articles and guides.`, url: `https://www.google.com/search?q=${encodeURIComponent(input + ' guide')}` },
             { id: `not-${Date.now()}`, title: `Academic Notes & Papers`, type: 'PDF', subject: 'External', description: `Explore published academic research.`, url: `https://scholar.google.com/scholar?q=${encodeURIComponent(input)}` },
             { id: `crs-${Date.now()}`, title: `Interactive Courses`, type: 'COURSE', subject: 'External', description: `Find structured courses on this topic.`, url: `https://www.coursera.org/search?query=${encodeURIComponent(input)}` }
           ];
        }

        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.data.answer,
            resources: recs
        }]);
        setRecommendations(recs);
        if (!activeConvId) fetchConversations();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleBookmark = async (resource) => {
    try {
      // Dynamic resources (YouTube, etc) have 'yt-' or 'art-' etc prefix
      const isDynamic = typeof resource.id === 'string' && (resource.id.startsWith('yt-') || resource.id.startsWith('art-') || resource.id.startsWith('not-') || resource.id.startsWith('crs-'));
      
      let resourceIdToBookmark = resource.id;

      if (isDynamic) {
        const createRes = await fetch('http://localhost:8080/api/v1/resources', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: resource.title,
            url: resource.url,
            description: resource.description,
            subject: 'Targeted Search',
            type: resource.type,
            tags: ['AI-Recommended', 'Study-Assistant']
          })
        });
        const createdData = await createRes.json();
        if (createdData.success) {
          resourceIdToBookmark = createdData.data.id;
        } else {
          return;
        }
      }

      await fetch(`http://localhost:8080/api/v1/bookmarks/${resourceIdToBookmark}?userId=${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Resource Bookmarked!');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden relative z-10 bg-white">
        {/* Hierarchical Header (Knowledge Hub Style) */}
        <header className="p-10 border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">AI Strategic Advisor</h1>
              <p className="text-sm text-slate-400 mt-2 font-bold tracking-widest uppercase">Individual Research Module — Advanced Strategic Intelligence</p>
            </div>
            <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-2xl border border-indigo-100 shadow-sm uppercase tracking-widest">
               <BrainCircuit size={14} strokeWidth={3} />
               Executive Support Active
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Step 1: Research History Sidebar */}
          <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/30">
            <div className="p-5 border-b border-slate-200 bg-white/50">
            <button 
              onClick={startNewChat}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
            >
              <Plus size={20} /> New Study Session
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            <div className="flex items-center gap-2 px-3 mb-4">
               <History size={14} className="text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">History</span>
            </div>
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => loadConversation(conv.id)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all border ${activeConvId === conv.id ? 'bg-indigo-50/80 border-indigo-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50/80 hover:border-slate-100'}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${activeConvId === conv.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600 transition-colors'}`}>
                        <MessageSquare size={12} />
                      </div>
                      <span className={`text-xs font-bold truncate ${activeConvId === conv.id ? 'text-indigo-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                        {conv.title || `Session #${conv.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      <Clock size={10} />
                      <span>{formatRelativeTime(conv.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {confirmingDeleteId === conv.id ? (
                      <div className="flex gap-1 animate-in slide-in-from-right duration-200">
                        <button onClick={(e) => confirmDeleteConversation(e, conv.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"><CheckCircle2 size={14} /></button>
                        <button onClick={cancelDelete} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg"><Plus className="rotate-45" size={14} /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => requestDeleteConversation(e, conv.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

          <div className="flex-1 flex flex-col h-full relative bg-white overflow-hidden">
            {/* Professional Academic Header Removal (Redundant) */}

          {/* Messages container - scrollable independently */}
          <div className="flex-1 overflow-y-auto p-12 pb-[350px] space-y-10 custom-scrollbar bg-slate-50/20">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-6 py-24 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center mb-8 border border-slate-200 shadow-sm">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">AI Strategic Research Advisor</h3>
                <p className="text-base text-slate-500 font-medium leading-relaxed mb-12 max-w-xl">
                  Advanced Intelligence Module — Professional Academic & Research Strategy
                </p>
                
                {/* Minimalist Icon-Only Suggestion Chips */}
                <div className="flex items-center justify-center gap-4">
                  {[
                    { icon: Rocket, label: "Research Roadmap", title: "Deep Research Strategy" },
                    { icon: BarChart2, label: "GPA Analysis", title: "Academic Performance" },
                    { icon: Target, label: "Career Path", title: "Career Deployment" },
                    { icon: BookOpen, label: "Literature Review", title: "Expert Literature Search" }
                  ].map((chip, i) => (
                    <button 
                      key={i} 
                      onClick={() => setInput(chip.title)}
                      title={chip.label}
                      className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                    >
                      <chip.icon size={22} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-500`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md' : 'bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm'} p-6 relative group`}>
                    <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${msg.role === 'user' ? 'border-indigo-400/30' : 'border-slate-100'}`}>
                      {msg.role === 'user' ? (
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-100">Researcher</span>
                          <User size={12} className="text-white opacity-80" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Bot size={12} className="text-indigo-600" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Advisor Insight</span>
                        </div>
                      )}
                    </div>
                    <div className={`text-base leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                      {msg.content}
                    </div>
                    
                    {/* Inline Strategic Data Sources */}
                    {msg.resources && msg.resources.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-6">
                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Integrated Research Matrix</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {msg.resources.map((res, ridx) => (
                            <div key={ridx} className={`group p-4 rounded-xl border transition-all duration-300 ${msg.role === 'user' ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}>
                              <div className="flex justify-between items-start mb-3">
                                <div className={`p-1.5 rounded-lg ${msg.role === 'user' ? 'bg-white/20' : 'bg-white border border-slate-100 shadow-sm'}`}>
                                  {res.type === 'VIDEO' ? <BookOpen size={14} className="text-indigo-600" /> : <Layers size={14} className="text-indigo-600" />}
                                </div>
                                <a 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className={`p-1.5 rounded-lg transition-colors ${msg.role === 'user' ? 'hover:bg-white/20' : 'hover:bg-indigo-600 hover:text-white bg-white border border-slate-100'}`}
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                              <h5 className={`text-[13px] font-bold truncate mb-1 ${msg.role === 'user' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'}`}>{res.title}</h5>
                              <p className={`text-[10px] font-medium leading-relaxed line-clamp-1 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-500'}`}>{res.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white/60 backdrop-blur-3xl border border-white shadow-lg p-6 rounded-[2rem] rounded-tl-sm flex items-center gap-5">
                  <div className="flex gap-1.5 items-center justify-center h-6">
                    <div className="w-1.5 h-full bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-2/3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-full bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500 animate-pulse">Synthesizing Knowledge...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Professional Docked Input Area */}
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-40">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto">
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-1 transition-all focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 shadow-sm">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter research query or strategic question..."
                  className="w-full text-base py-4 px-5 outline-none font-medium placeholder:text-slate-400 text-slate-800 bg-transparent"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm ${loading || !input.trim() ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={18} /> Send</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Contextual Resources Modal */}
      {showResourcesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden text-left flex flex-col scale-in-center overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">Knowledge Deep-Dive</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Curated materials for your current query</p>
                </div>
              </div>
              <button 
                onClick={() => setShowResourcesModal(false)} 
                className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-2.5 rounded-2xl transition-all"
              >
                <Plus size={28} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modalResources.map(res => (
                  <div key={res.id} className="bg-white border border-slate-100 p-6 rounded-3xl hover:border-indigo-200 transition-all group flex flex-col h-full shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">{res.type || 'DOCUMENT'}</span>
                      <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{res.subject || 'GENERAL'}</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">{res.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{res.description}</p>
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-3 w-full text-xs font-bold text-white bg-slate-900 py-4 rounded-2xl transition-all hover:bg-indigo-600 active:scale-[0.98] shadow-lg"
                    >
                      Access Material
                      <ExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AiChatPage;