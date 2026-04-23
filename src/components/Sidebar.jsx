import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Briefcase, Search, Users, LogOut, Brain, 
  BookOpen, Bell, Sparkles, LayoutDashboard, 
  Calendar, CheckSquare, ChevronDown 
} from 'lucide-react';

const API = 'http://localhost:8080';

const Sidebar = () => {
  // --- 1. Combined State Management ---
  const [userData, setUserData] = useState({
    fullName: 'Loading...',
    email: 'Fetching email...',
    role: 'STUDENT' 
  });
  
  const [badgeCounts, setBadgeCounts] = useState({ invites: 0, requests: 0 });
  const [expandedSections, setExpandedSections] = useState({ menu: true });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  // --- 2. Data Fetching (Profile & Badges) ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/v1/auth/profile`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          setUserData({ fullName: data.fullName, email: data.email, role: data.role });
        }
      } catch (err) { console.error('Sidebar profile fetch error:', err); }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!token) return;
      try {
        const [invRes, reqRes] = await Promise.all([
          fetch(`${API}/api/v1/invitations`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/v1/teams/requests/pending`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const invCount = invRes.ok ? ((await invRes.json()).data || []).length : 0;
        const reqCount = reqRes.ok ? ((await reqRes.json()).data || []).length : 0;
        setBadgeCounts({ invites: invCount, requests: reqCount });
      } catch { /* silent */ }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- 3. Combined Menu Definitions ---
  const studentItems = [
    { name: 'Profile', icon: <User size={20} />, path: '/student-dashboard', color: 'text-indigo-600' },
    { name: 'AI Assistant', icon: <Brain size={20} />, path: '/ai-assistant', color: 'text-sky-600' },
    { name: 'Knowledge Hub', icon: <BookOpen size={20} />, path: '/knowledge-hub', color: 'text-amber-600' },
    { name: 'Job Listings', icon: <Briefcase size={20} />, path: '/student-job-listings', color: 'text-emerald-600' },
    { name: 'ATS Checker', icon: <Search size={20} />, path: '/ats-checker', color: 'text-emerald-500' },
    { name: 'My Groups', icon: <Users size={20} />, path: '/my-groups', color: 'text-indigo-500' },
    { name: 'Invitations', icon: <Bell size={20} />, path: '/invitations', badge: badgeCounts.invites, color: 'text-rose-500' },
    { name: 'Join Requests', icon: <Users size={20} />, path: '/join-requests', badge: badgeCounts.requests, color: 'text-rose-600' },
    { name: 'Smart Match', icon: <Sparkles size={20} />, path: '/smart-match', color: 'text-violet-600' },
    { name: 'Events', icon: <Calendar size={20} />, path: '/module3', color: 'text-fuchsia-600' },
    { name: 'Meetings', icon: <Users size={20} />, path: '/module3-meetings', color: 'text-cyan-600' },
    { name: 'Projects', icon: <CheckSquare size={20} />, path: '/module3-projects', color: 'text-teal-600' },
  ];

  const adminItems = [
    { name: 'Control Panel', icon: <LayoutDashboard size={20} />, path: '/module3-dashboard', color: 'text-indigo-600' },
    { name: 'Jobs Admin', icon: <Briefcase size={20} />, path: '/admin-job-dashboard', color: 'text-emerald-600' },
    { name: 'Resources Admin', icon: <BookOpen size={20} />, path: '/admin-knowledge-hub', color: 'text-amber-600' },
    { name: 'AI Analytics', icon: <Brain size={20} />, path: '/admin-ai-assistant', color: 'text-sky-600' },
  ];

  const isAdmin = userData.role && userData.role.includes('ADMIN');
  const menuItems = isAdmin ? adminItems : studentItems;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="w-72 bg-white/90 backdrop-blur-xl border-r border-slate-200 flex flex-col fixed h-full z-20 overflow-y-auto shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand Logo Style */}
      <div className="p-8 flex items-center gap-3 border-b border-slate-100 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-slate-900 font-bold text-xl tracking-tight">Smart Campus</span>
          <span className="text-slate-500 font-medium text-xs tracking-wider uppercase">Hub Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-2 text-left">
        <div className="mb-6">
          <button
            onClick={() => toggleSection('menu')}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            <span>{isAdmin ? 'Admin Menu' : 'Main Menu'}</span>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${expandedSections.menu ? '' : '-rotate-90'}`}
            />
          </button>
          
          {expandedSections.menu && (
            <ul className="space-y-1.5 mt-3">
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-r-full shadow-sm shadow-indigo-600/50" />
                      )}
                      <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-indigo-600' : item.color}`}>
                        {item.icon}
                      </span>
                      <span className={`text-sm flex-1 text-left ${active ? 'font-bold' : 'font-semibold'}`}>
                        {item.name}
                      </span>
                      {item.badge > 0 && (
                        <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </nav>

      {/* User profile Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white p-3.5 rounded-2xl flex items-center justify-between border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="w-10 h-10 bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-700 font-bold shadow-inner flex-shrink-0">
              {userData.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden text-left min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{userData.fullName}</p>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[120px]">{userData.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all ml-1"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;