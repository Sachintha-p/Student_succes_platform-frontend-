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
  Clock
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
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 flex overflow-hidden">
        {/* Left Sidebar: Conversations */}
        <div className="w-80 border-r border-gray-800/50 flex flex-col bg-[#0b0f1a]">
          <div className="p-6 border-b border-gray-800/20">
            <button 
              onClick={startNewChat}
              className="w-full bg-[#00d09c]/10 text-[#00d09c] border border-[#00d09c]/20 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#00d09c]/20 transition-all shadow-[0_0_20px_rgba(0,208,156,0.05)]"
            >
              <Plus size={20} /> New Academic Query
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            <div className="flex items-center gap-2 px-3 mb-4 opacity-50">
               <History size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#00d09c]">Memory Vault</span>
            </div>
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => loadConversation(conv.id)}
                className={`group p-4 rounded-2xl cursor-pointer transition-all border ${activeConvId === conv.id ? 'bg-[#161b2c] border-[#00d09c]/30 shadow-[0_4px_15px_rgba(0,208,156,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${activeConvId === conv.id ? 'bg-[#00d09c]/20 text-[#00d09c]' : 'bg-gray-800 text-gray-400 group-hover:text-white transition-colors'}`}>
                        <MessageSquare size={12} />
                      </div>
                      <span className={`text-xs font-bold truncate ${activeConvId === conv.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                        {conv.title || `Study Session #${conv.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                      <Clock size={10} />
                      <span>{formatRelativeTime(conv.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {confirmingDeleteId === conv.id ? (
                      <div className="flex gap-1 animate-in slide-in-from-right duration-200">
                        <button onClick={(e) => confirmDeleteConversation(e, conv.id)} className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><CheckCircle2 size={14} /></button>
                        <button onClick={cancelDelete} className="p-1.5 bg-gray-800 text-gray-400 rounded-lg"><Plus className="rotate-45" size={14} /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => requestDeleteConversation(e, conv.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-xl transition-all"
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

        {/* Middle: Chat Area */}
        <div className="flex-1 flex flex-col h-screen relative bg-[#090e17]">
          {/* Header */}
          <div className="h-20 border-b border-gray-800/20 px-10 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 bg-[#00d09c]/10 rounded-xl flex items-center justify-center border border-[#00d09c]/20">
                <Sparkles size={20} className="text-[#00d09c]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest italic">AI Academic Assistant</h2>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#00d09c] rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Powered by GPT-4 Intelligence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar pb-32">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 bg-gray-800/20 rounded-[2.5rem] flex items-center justify-center mb-6 border border-gray-800/30">
                  <MessageSquare size={40} className="text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 italic">How can I assist your studies today?</h3>
                <p className="text-xs max-w-xs text-gray-500 font-medium">Ask for explanations, research papers, tutorials or resource recommendations.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#161b2c] border border-gray-800/50 rounded-l-[1.5rem] rounded-tr-[1.5rem]' : 'bg-[#0b0f1a] border border-gray-800/50 rounded-r-[1.5rem] rounded-tl-[1.5rem]'} p-6 shadow-2xl relative group`}>
                    <div className="flex items-center gap-3 mb-3 border-b border-gray-800/30 pb-2">
                      {msg.role === 'user' ? (
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-[10px] font-black text-[#00d09c] uppercase tracking-widest">Student Explorer</span>
                          <User size={14} className="text-[#00d09c]" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-[#00d09c]" />
                          <span className="text-[10px] font-black text-[#00d09c] uppercase tracking-widest italic">Academic Intelligence</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed text-gray-300 text-left whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                    {msg.resources && msg.resources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-end">
                        <button
                          onClick={() => {
                            setModalResources(msg.resources);
                            setShowResourcesModal(true);
                          }}
                          className="flex items-center gap-2 text-[11px] font-bold text-black bg-[#00d09c] hover:bg-white px-4 py-2 rounded-xl transition-all shadow-[0_4px_15px_rgba(0,208,156,0.2)] group"
                        >
                          <BookOpen size={14} className="group-hover:scale-110 transition-transform" />
                          View {msg.resources.length} Related Resources
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0b0f1a] border border-gray-800/30 p-5 rounded-3xl flex items-center gap-4">
                  <Loader2 className="animate-spin text-[#00d09c]" size={20} />
                  <span className="text-sm text-gray-400 italic font-medium">Intelligence is processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8">
            <form onSubmit={handleSend} className="relative max-w-5xl mx-auto group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00d09c] to-[#00d09c]/20 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your academic query (e.g., Explain Newton's Second Law)..."
                  className="w-full bg-[#161b2c] border border-gray-800 text-base py-5 px-6 pr-20 rounded-2xl focus:outline-none focus:border-[#00d09c]/50 transition-all font-medium placeholder:text-gray-600"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg ${loading || !input.trim() ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[#00d09c] text-black hover:scale-105 active:scale-95'}`}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-4 font-bold uppercase tracking-widest">AI Academic Assistant for SLIIT Student Success Platform</p>
          </div>
        </div>

        {/* Right Sidebar: Recommendations */}
        <div className="w-80 border-l border-gray-800/20 bg-[#0b0f1a] p-6 hidden xl:flex flex-col bg-gradient-to-b from-[#0b0f1a] to-[#0b0f1a]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#00d09c]/10 rounded-lg flex items-center justify-center border border-[#00d09c]/20">
               <BookOpen size={16} className="text-[#00d09c]" />
            </div>
            <h2 className="font-bold text-sm uppercase tracking-tighter italic">Topic Intelligence</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 hover:pr-0 transition-all custom-scrollbar">
            {recommendations.length > 0 ? (
              recommendations.map(res => (
                <div key={res.id} className="bg-[#161b2c] border border-gray-800 p-5 rounded-3xl hover:border-[#00d09c]/30 hover:bg-[#1a2135] transition-all group cursor-pointer shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={40} />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-[#00d09c] uppercase tracking-tighter bg-[#00d09c]/5 px-2 py-0.5 rounded border border-[#00d09c]/10">{res.type || 'RESOURCE'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-[#00d09c] transition-colors">{res.title}</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 mb-4">{res.description}</p>
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-[11px] font-bold text-black bg-[#00d09c] py-2.5 rounded-xl transition-all hover:bg-white shadow-[0_5px_15px_rgba(0,208,156,0.1)]"
                  >
                    Launch Material
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-800/30 rounded-3xl transition-opacity">
                <BookOpen size={40} className="mb-4 text-gray-800/20" />
                <p className="text-[11px] text-gray-600 font-bold uppercase tracking-tight opacity-50">Intelligence will curate resources as you chat</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800/20">
             <button 
              onClick={() => window.location.href='/knowledge-hub'}
              className="w-full text-[10px] font-black text-[#00d09c] uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
             >
               Visit Full Library
               <ExternalLink size={12} />
             </button>
          </div>
        </div>
      </main>

      {/* Contextual Resources Modal */}
      {showResourcesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0b0f1a] w-full max-w-3xl max-h-[80vh] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden text-left flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#121826]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00d09c]/10 rounded-xl flex items-center justify-center border border-[#00d09c]/20">
                  <BookOpen size={20} className="text-[#00d09c]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Recommended Resources</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Based on your recent query</p>
                </div>
              </div>
              <button onClick={() => setShowResourcesModal(false)} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-[#0b0f1a]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modalResources.map(res => (
                  <div key={res.id} className="bg-[#161b2c] border border-gray-800 p-5 rounded-3xl hover:border-[#00d09c]/30 hover:bg-[#1a2135] transition-all group flex flex-col h-full shadow-lg">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-[#00d09c] uppercase tracking-tighter bg-[#00d09c]/10 px-2.5 py-1 rounded-lg border border-[#00d09c]/20">{res.type || 'DOCUMENT'}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{res.subject || 'GENERAL'}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-[#00d09c] transition-colors">{res.title}</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3 mb-5 flex-1">{res.description}</p>
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full text-[11px] font-bold text-white bg-black/40 border border-gray-700/50 py-3 rounded-xl transition-all hover:bg-[#00d09c] hover:text-black hover:border-transparent group-hover:shadow-[0_5px_15px_rgba(0,208,156,0.15)]"
                    >
                      Access Material
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatPage;
