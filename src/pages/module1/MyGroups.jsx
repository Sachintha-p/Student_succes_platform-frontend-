import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import { 
  Users, Plus, Search, ChevronRight, 
  Loader2, X, Mail, Crown, Trash2, LogOut, Edit3, UserMinus, Send,
  Sparkles, Layers, MessageSquare, Info
} from 'lucide-react';

const MyGroups = () => {
  const [activeTab, setActiveTab] = useState('explore'); 
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [manageModal, setManageModal] = useState({ isOpen: false, mode: '', group: null });
  const [editGroupData, setEditGroupData] = useState({ name: '', subject: '', description: '', maxMembers: 4, requiredSkills: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const [joinRequestModal, setJoinRequestModal] = useState({ isOpen: false, groupId: null, groupName: '' });
  const [joinMessage, setJoinMessage] = useState("I would like to join this project team.");

  const [inviteModal, setInviteModal] = useState({ isOpen: false, groupId: null, groupName: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [newGroup, setNewGroup] = useState({ name: '', subject: '', description: '', maxMembers: 4, requiredSkills: '' });
  const token = localStorage.getItem('accessToken');

  // --- DATA FETCHING ---
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/auth/profile', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const resData = await res.json();
        // Profiles sometimes return the user object directly or nested in .data
        const user = resData.data || resData;
        setCurrentUser(user);
      }
    } catch (err) { console.error("Profile fetch error:", err); } finally { setProfileLoading(false); }
  }, [token]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      // FIXED: Use the exact endpoints verified in Postman
      const endpoint = activeTab === 'explore' ? '/api/v1/teams' : '/api/v1/teams/my-teams';
      const response = await fetch(`http://localhost:8080${endpoint}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (response.ok) {
        const resData = await response.json();
        
        // ROBUST EXTRACTION: Handle Page objects vs plain Lists
        let groupList = [];
        if (resData.data) {
          if (Array.isArray(resData.data)) {
            groupList = resData.data;
          } else if (Array.isArray(resData.data.content)) {
            groupList = resData.data.content;
          }
        }
        
        setGroups(groupList);
      }
    } catch (err) { 
      console.error("Fetch error:", err); 
      setGroups([]);
    } finally { setLoading(false); }
  }, [token, activeTab]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // --- OWNERSHIP LOGIC ---
  const checkIsOwner = (group, user) => {
    if (!user || !group) return false;
    
    // Normalize both to strings to avoid type-mismatch (13 !== "13")
    const currentId = String(user.id || user.userId || '');
    
    // Check common owner/leader fields used in your Module 1 DTOs
    const groupOwnerId = String(
      group.ownerId || 
      group.leaderId || 
      group.owner?.id || 
      ''
    );
    
    return currentId !== '' && currentId === groupOwnerId;
  };

  // --- FILTERING LOGIC ---
  const filteredGroups = groups.filter(group => {
    const matchesSearch = 
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      group.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isOwner = checkIsOwner(group, currentUser);

    // Filter by tab selection
    if (activeTab === 'explore') return matchesSearch;
    if (activeTab === 'my-teams') return matchesSearch && !isOwner;
    if (activeTab === 'my-owns') return matchesSearch && isOwner;
    
    return matchesSearch;
  });

  // --- TEAM CREATION ---
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const parsedSkills = newGroup.requiredSkills ? newGroup.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '') : [];
      const payload = { ...newGroup, maxMembers: parseInt(newGroup.maxMembers) || 4, requiredSkills: parsedSkills };

      const response = await fetch('http://localhost:8080/api/v1/teams', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("Team Created Successfully! 🚀");
        setShowCreateModal(false);
        setNewGroup({ name: '', subject: '', description: '', maxMembers: 4, requiredSkills: '' }); 
        fetchGroups();
      } else {
        const errData = await response.json();
        alert(`Failed: ${errData.message}`);
      }
    } catch (err) { alert("Server error."); }
  };

  const handleRequestJoinSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${joinRequestModal.groupId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: joinMessage })
      });
      if (response.ok) {
        alert("Join Request Sent! ✨");
        setJoinRequestModal({ isOpen: false, groupId: null, groupName: '' });
      } else {
        const err = await response.json();
        alert(err.message || "Failed.");
      }
    } catch (err) { alert("Server error."); } finally { setActionLoading(false); }
  };

  const openManageModal = async (group, isOwner) => {
    setManageModal({ isOpen: true, mode: isOwner ? 'owner' : 'member', group });
    if (isOwner) {
      setEditGroupData({
        name: group.name || '', subject: group.subject || '', description: group.description || '',
        maxMembers: group.maxMembers || 4, requiredSkills: group.requiredSkills ? group.requiredSkills.join(', ') : ''
      });
    }
  };

  const handleLeaveGroup = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${manageModal.group.id}/leave`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Left successfully.");
        setManageModal({ isOpen: false, mode: '', group: null });
        fetchGroups();
      } else alert("Failed.");
    } catch (err) { alert("Server error."); } finally { setActionLoading(false); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const parsedSkills = editGroupData.requiredSkills ? editGroupData.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== '') : [];
      const payload = { ...editGroupData, maxMembers: parseInt(editGroupData.maxMembers) || 4, requiredSkills: parsedSkills };
      const response = await fetch(`http://localhost:8080/api/v1/teams/${manageModal.group.id}`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("Updated! ✅");
        setManageModal({ isOpen: false, mode: '', group: null });
        fetchGroups();
      } else alert("Failed.");
    } catch (err) { alert("Server error."); } finally { setActionLoading(false); }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Delete this team?")) return;
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${manageModal.group.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Deleted.");
        setManageModal({ isOpen: false, mode: '', group: null });
        fetchGroups();
      } else alert("Failed.");
    } catch (err) { alert("Server error."); } finally { setActionLoading(false); }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/teams/${inviteModal.groupId}/invite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }) 
      });
      if (response.ok) {
        alert(`Sent to ${inviteEmail}! ✨`);
        setInviteModal({ isOpen: false, groupId: null, groupName: '' });
        setInviteEmail('');
      } else {
        const errData = await response.json();
        alert(`Failed: ${errData.message}`);
      }
    } catch (err) { alert("Server error."); } finally { setInviteLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans text-left">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        <header className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">Team <span className="text-indigo-600">Matchmaker</span></h1>
            <p className="text-slate-400 font-medium italic text-lg mb-8">Build the ultimate squad for your next project.</p>
            
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-[1.25rem] w-fit">
              <button onClick={() => setActiveTab('explore')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${activeTab === 'explore' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 border border-slate-100' : 'text-slate-400 hover:text-indigo-600'}`}>EXPLORE TEAMS</button>
              <button onClick={() => setActiveTab('my-teams')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${activeTab === 'my-teams' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 border border-slate-100' : 'text-slate-400 hover:text-indigo-600'}`}>JOINED TEAMS</button>
              <button onClick={() => setActiveTab('my-owns')} className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${activeTab === 'my-owns' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100 border border-slate-100' : 'text-slate-400 hover:text-indigo-600'}`}>MY OWN TEAMS</button>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col items-end gap-6">
            <button onClick={() => setShowCreateModal(true)} className="group flex items-center gap-4 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-5 rounded-[1.5rem] font-black transition-all active:scale-95 shadow-2xl">
              <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-500" /> START NEW TEAM
            </button>
          </div>
        </header>

        <div className="relative group mb-10 max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input type="text" placeholder="Search project name or subject code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-5 pl-16 pr-8 text-sm text-slate-900 focus:border-indigo-500/40 outline-none transition-all shadow-xl shadow-slate-200/40 font-medium" />
        </div>

        {loading || profileLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Loading Project Groups</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
            <p className="text-slate-500 italic">No projects found for {activeTab.replace('-', ' ')}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {filteredGroups.map((group) => {
              const isOwner = checkIsOwner(group, currentUser);
              const progress = Math.min(100, ((group.currentMembers || 1) / group.maxMembers) * 100);

              return (
                <div key={group.id} className="bg-white border border-slate-200 p-8 rounded-[3rem] hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all duration-500 group relative flex flex-col h-full shadow-lg shadow-slate-200/50">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-500 shadow-sm">
                        <Users className="text-indigo-600 transition-colors" size={28}/>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{group.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">{group.subject || 'GENERAL'}</span>
                            {isOwner && (
                              <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[9px] font-black px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">
                                <Crown size={10} /> OWNER
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-3 leading-relaxed flex-grow italic">{group.description}</p>
                  
                  <div className="space-y-4 mb-10 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Formation Info</span>
                        <span className="text-indigo-600 font-black text-sm">{group.currentMembers || 1} <span className="text-slate-300 font-normal">/ {group.maxMembers}</span></span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => activeTab === 'explore' ? setJoinRequestModal({ isOpen: true, groupId: group.id, groupName: group.name }) : openManageModal(group, isOwner)}
                      className="w-full bg-slate-900 text-white hover:bg-indigo-600 py-5 rounded-[1.5rem] font-black text-xs transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group/btn"
                    >
                      {activeTab === 'explore' ? 'REQUEST TO JOIN' : 'TEAM CONTROL PANEL'} 
                      <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>

                    {isOwner && (activeTab === 'my-owns' || activeTab === 'explore') && (
                      <button 
                        onClick={() => {
                          setInviteModal({ isOpen: true, groupId: group.id, groupName: group.name });
                          setInviteEmail('');
                        }}
                        className="w-full bg-white text-indigo-600 border border-slate-100 py-4 rounded-[1.25rem] font-black text-[10px] tracking-widest transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-2 uppercase"
                      >
                        <Mail size={14} strokeWidth={3} /> Invite Student via IT Mail
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* === CREATE GROUP MODAL === */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">Start New Team</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Name *</label>
                <input required value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  placeholder="e.g. Alpha Dev Squad"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</label>
                  <input value={newGroup.subject} onChange={e => setNewGroup({...newGroup, subject: e.target.value})}
                    placeholder="e.g. SE3040"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Members *</label>
                  <input required type="number" min="2" max="10" value={newGroup.maxMembers}
                    onChange={e => setNewGroup({...newGroup, maxMembers: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea rows={3} value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="What is this team working on?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Required Skills (comma separated)</label>
                <input value={newGroup.requiredSkills} onChange={e => setNewGroup({...newGroup, requiredSkills: e.target.value})}
                  placeholder="e.g. React, Java, Spring Boot"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-xl font-black text-xs text-slate-500 border border-slate-200 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit"
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  Launch Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === JOIN REQUEST MODAL === */}
      {joinRequestModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Request to Join</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{joinRequestModal.groupName}</p>
              </div>
              <button onClick={() => setJoinRequestModal({isOpen: false, groupId: null, groupName: ''})} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleRequestJoinSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message to Team Leader</label>
                <textarea rows={4} value={joinMessage} onChange={e => setJoinMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setJoinRequestModal({isOpen: false, groupId: null, groupName: ''})}
                  className="px-6 py-3 rounded-xl font-black text-xs text-slate-500 border border-slate-200 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2 disabled:opacity-60">
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === INVITE MODAL === */}
      {inviteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">Invite Student</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{inviteModal.groupName}</p>
              </div>
              <button onClick={() => setInviteModal({isOpen: false, groupId: null, groupName: ''})} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={handleSendInvite} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Email *</label>
                <input required type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  placeholder="student@sliit.lk"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setInviteModal({isOpen: false, groupId: null, groupName: ''})}
                  className="px-6 py-3 rounded-xl font-black text-xs text-slate-500 border border-slate-200 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" disabled={inviteLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2 disabled:opacity-60">
                  {inviteLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MANAGE MODAL (Owner / Member) === */}
      {manageModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {manageModal.mode === 'owner' ? 'Manage Team' : 'Team Details'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{manageModal.group?.name}</p>
              </div>
              <button onClick={() => setManageModal({isOpen: false, mode: '', group: null})} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-500" /></button>
            </div>

            {manageModal.mode === 'owner' ? (
              <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Name *</label>
                  <input required value={editGroupData.name} onChange={e => setEditGroupData({...editGroupData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</label>
                    <input value={editGroupData.subject} onChange={e => setEditGroupData({...editGroupData, subject: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Members</label>
                    <input type="number" min="2" max="10" value={editGroupData.maxMembers} onChange={e => setEditGroupData({...editGroupData, maxMembers: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea rows={3} value={editGroupData.description} onChange={e => setEditGroupData({...editGroupData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Required Skills (comma separated)</label>
                  <input value={editGroupData.requiredSkills} onChange={e => setEditGroupData({...editGroupData, requiredSkills: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button type="button" onClick={handleDeleteGroup} disabled={actionLoading}
                    className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                    <Trash2 size={13} /> Delete Team
                  </button>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setManageModal({isOpen: false, mode: '', group: null})}
                      className="px-6 py-3 rounded-xl font-black text-xs text-slate-500 border border-slate-200 hover:bg-slate-50 uppercase tracking-widest transition-colors">Cancel</button>
                    <button type="submit" disabled={actionLoading}
                      className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2 disabled:opacity-60">
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Edit3 size={14} />} Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-8 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Subject</span><span className="font-black text-slate-900">{manageModal.group?.subject || '—'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Members</span><span className="font-black text-slate-900">{manageModal.group?.currentMembers || 1} / {manageModal.group?.maxMembers}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400 font-bold">Status</span><span className="font-black text-emerald-600">{manageModal.group?.open ? 'Open' : 'Closed'}</span></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button onClick={handleLeaveGroup} disabled={actionLoading}
                    className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />} Leave Team
                  </button>
                  <button onClick={() => setManageModal({isOpen: false, mode: '', group: null})}
                    className="px-6 py-3 rounded-xl font-black text-xs text-slate-500 border border-slate-200 hover:bg-slate-50 uppercase tracking-widest transition-colors">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MyGroups;