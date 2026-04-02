import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase, Search, Users, LogOut, LayoutDashboard, Calendar, CheckSquare, ChevronDown, Flag } from 'lucide-react';

const Sidebar = () => {
  // --- 1. STATE FOR REAL USER DATA ---
  const [userData, setUserData] = useState({
    fullName: 'Loading...',
    email: 'Fetching email...'
  });

  const [expandedSections, setExpandedSections] = useState({
    menu: true,
    module3: true
  });

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');

  // --- 2. FETCH REAL PROFILE FROM BACKEND ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        // Hitting the endpoint we just added in AuthController.java
        const response = await fetch('http://localhost:8080/api/v1/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Data contains { fullName, email, role } from backend
          setUserData({
            fullName: data.fullName,
            email: data.email
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    { name: 'Profile', icon: <User size={18}/>, path: '/student-dashboard' },
    { name: 'Job Listings', icon: <Briefcase size={18}/>, path: '/student-job-listings' },
    { name: 'ATS Checker', icon: <Search size={18}/>, path: '/ats-checker' },
    { name: 'My Groups', icon: <Users size={18}/>, path: '/my-groups' },
  ];

  const module3Items = [
    { name: 'Events', icon: <Calendar size={18}/>, path: '/module3' },
    { name: 'Meetings', icon: <Users size={18}/>, path: '/module3-meetings' },
    { name: 'Projects', icon: <CheckSquare size={18}/>, path: '/module3-projects' },
    { name: 'Milestones', icon: <Flag size={18}/>, path: '/module3-milestones' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-72 bg-[#121826] border-r border-gray-800/50 flex flex-col fixed h-full z-20 overflow-y-auto">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-800/50">
        <div className="w-9 h-9 bg-gradient-to-br from-[#00d09c] to-[#00e6ae] rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-black text-lg">S</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm">Student Hub</span>
          <span className="text-gray-500 text-xs">Learning Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        {/* Main Menu Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('menu')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            <span>Main Menu</span>
            <ChevronDown 
              size={14} 
              style={{
                transform: expandedSections.menu ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>
          {expandedSections.menu && (
            <ul className="space-y-1 mt-3">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <button 
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      isActive(item.path)
                        ? 'bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/30' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a2230]/60'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Module 3 Section */}
        <div className="border-t border-gray-800/50 pt-6">
          <button
            onClick={() => toggleSection('module3')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            <span>Module 3</span>
            <ChevronDown 
              size={14}
              style={{
                transform: expandedSections.module3 ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>
          {expandedSections.module3 && (
            <ul className="space-y-1 mt-3">
              {module3Items.map((item) => (
                <li key={item.name}>
                  <button 
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      isActive(item.path)
                        ? 'bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/30' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a2230]/60'
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* --- DYNAMIC USER PROFILE SECTION --- */}
      <div className="p-4 border-t border-gray-800/50 bg-[#090e17]/80">
        <div className="bg-[#1a2230] p-4 rounded-xl flex items-center justify-between border border-gray-800/50 hover:border-[#00d09c]/40 hover:shadow-[0_0_15px_rgba(0,208,156,0.1)] transition-all">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            {/* Dynamic Initial Icon */}
            <div className="w-9 h-9 bg-gradient-to-br from-[#00d09c] to-[#00e6ae] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userData.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden text-left min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {userData.fullName}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {userData.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;