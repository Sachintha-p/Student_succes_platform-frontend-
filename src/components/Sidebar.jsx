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
    { name: 'Profile', icon: <User size={20} />, path: '/student-dashboard' },
    { name: 'AI Assistant', icon: <Brain size={20} />, path: '/ai-assistant' },
    { name: 'Knowledge Hub', icon: <BookOpen size={20} />, path: '/knowledge-hub' },
    { name: 'Job Listings', icon: <Briefcase size={20} />, path: '/student-job-listings' },
    { name: 'ATS Checker', icon: <Search size={20} />, path: '/ats-checker' },
    { name: 'My Groups', icon: <Users size={20} />, path: '/my-groups' },
    { name: 'Invitations', icon: <Bell size={20} />, path: '/invitations', badge: badgeCounts.invites },
    { name: 'Join Requests', icon: <Users size={20} />, path: '/join-requests', badge: badgeCounts.requests },
    { name: 'Smart Match', icon: <Sparkles size={20} />, path: '/smart-match' },
    { name: 'Events', icon: <Calendar size={20} />, path: '/module3' },
    { name: 'Meetings', icon: <Users size={20} />, path: '/module3-meetings' },
    { name: 'Projects', icon: <CheckSquare size={20} />, path: '/module3-projects' },
  ];

  const adminItems = [
    { name: 'Control Panel', icon: <LayoutDashboard size={20} />, path: '/module3-dashboard' },
    { name: 'Jobs Admin', icon: <Briefcase size={20} />, path: '/admin-job-dashboard' },
    { name: 'Resources Admin', icon: <BookOpen size={20} />, path: '/admin-knowledge-hub' },
    { name: 'AI Analytics', icon: <Brain size={20} />, path: '/admin-ai-assistant' },
  ];

  const isAdmin = userData.role && userData.role.includes('ADMIN');
  const menuItems = isAdmin ? adminItems : studentItems;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="w-72 bg-[#121826] border-r border-gray-800/50 flex flex-col fixed h-full z-20 overflow-y-auto">
      {/* Teammate's Brand Logo Style */}
      <div className="p-8 flex items-center gap-3 border-b border-gray-800/50">
        <div className="w-10 h-10 bg-[#00d09c] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,208,156,0.3)]">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-white font-bold text-xl tracking-tight">Student Hub</span>
        </div>
      </div>

      {/* Navigation with Restored Alignment */}
      <nav className="flex-1 px-4 mt-4 text-left">
        <div className="mb-6">
          <button
            onClick={() => toggleSection('menu')}
            className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors"
          >
            <span>{isAdmin ? 'Admin Menu' : 'Menu'}</span>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${expandedSections.menu ? '' : '-rotate-90'}`}
            />
          </button>
          
          {expandedSections.menu && (
            <ul className="space-y-1 mt-3">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative ${
                      isActive(item.path)
                        ? 'bg-[#00d09c]/10 text-[#00d09c] border border-[#00d09c]/20 font-semibold' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-sm flex-1 text-left">{item.name}</span>
                    {item.badge > 0 && (
                      <span className="w-5 h-5 bg-[#00d09c] text-gray-900 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* User profile Section */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="bg-[#1a2130] p-4 rounded-2xl flex items-center justify-between border border-gray-800/30">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="w-10 h-10 bg-[#00d09c] rounded-xl flex items-center justify-center text-white font-black shadow-inner flex-shrink-0">
              {userData.fullName?.charAt(0)}
            </div>
            <div className="overflow-hidden text-left min-w-0">
              <p className="text-sm font-bold text-white truncate max-w-[120px]">{userData.fullName}</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{userData.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
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