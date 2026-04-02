import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase, Search, Users, LogOut, LayoutDashboard, Brain, BookOpen, Settings } from 'lucide-react';

const Sidebar = () => {
  // --- 1. STATE FOR REAL USER DATA ---
  const [userData, setUserData] = useState({
    fullName: 'Loading...',
    email: 'Fetching email...',
    role: 'STUDENT'
  });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  // --- 2. FETCH REAL PROFILE FROM BACKEND ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:8080/api/v1/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            fullName: data.fullName,
            email: data.email,
            role: data.role
          });
        }
      } catch (err) {
        console.error("Sidebar profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const studentItems = [
    { name: 'Profile', icon: <User size={20}/>, path: '/student-dashboard' },
    { name: 'AI Assistant', icon: <Brain size={20}/>, path: '/ai-assistant' },
    { name: 'Knowledge Hub', icon: <BookOpen size={20}/>, path: '/knowledge-hub' },
    { name: 'Job Listings', icon: <Briefcase size={20}/>, path: '/student-job-listings' },
    { name: 'ATS Checker', icon: <Search size={20}/>, path: '/ats-checker' },
    { name: 'My Groups', icon: <Users size={20}/>, path: '/my-groups' },
  ];

  const adminItems = [
    { name: 'Jobs Admin', icon: <Briefcase size={20}/>, path: '/admin-dashboard' },
    { name: 'Resources Admin', icon: <BookOpen size={20}/>, path: '/admin-knowledge-hub' },
    { name: 'AI Analytics', icon: <Brain size={20}/>, path: '/admin-ai-assistant' },
  ];

  const menuItems = userData.role === 'ADMIN' ? adminItems : studentItems;

  return (
    <aside className="w-72 bg-[#121826] border-r border-gray-800/50 flex flex-col fixed h-full z-20">
      {/* Brand Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#00d09c] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,208,156,0.3)]">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Student Hub</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 text-left">
        <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Menu</p>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button 
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path 
                  ? 'bg-[#00d09c]/10 text-[#00d09c] border border-[#00d09c]/20 font-semibold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- DYNAMIC USER PROFILE SECTION --- */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="bg-[#1a2130] p-4 rounded-2xl flex items-center justify-between border border-gray-800/30">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Dynamic Initial Icon */}
            <div className="w-10 h-10 bg-[#00d09c] rounded-xl flex items-center justify-center text-white font-black shadow-inner">
              {userData.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-sm font-bold text-white truncate max-w-[120px]">
                {userData.fullName}
              </p>
              <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                {userData.email}
              </p>
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