import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, LogOut, Shield, CheckCircle } from 'lucide-react';

const Module3Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardAuthed, setIsDashboardAuthed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if admin is logged into dashboard
  useEffect(() => {
    const dashboardSession = localStorage.getItem('dashboardAdmin');
    setIsDashboardAuthed(!!dashboardSession);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const handleDashboardLogout = () => {
    localStorage.removeItem('dashboardAdmin');
    navigate('/module3-dashboard-login');
  };

  const handleDashboardLogin = () => {
    navigate('/module3-dashboard-login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    { label: 'Events', path: '/module3' },
    { label: 'Meetings', path: '/module3-meetings' },
    { label: 'Projects', path: '/module3-projects' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#090e17] to-[#0d1117] backdrop-blur-md border-b border-[#00d09c]/20 z-50 shadow-[0_4px_20px_rgba(0,208,156,0.1)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo/Brand */}
        <div 
          onClick={() => navigate('/module3')}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="bg-gradient-to-br from-[#00d09c] to-[#00e6ae] p-2.5 rounded-xl group-hover:shadow-[0_8px_20px_rgba(0,208,156,0.4)] transition-all transform group-hover:scale-105">
            <BarChart3 size={20} className="text-gray-900 font-black" />
          </div>
          <span className="text-slate-900 font-black text-lg hidden sm:inline group-hover:text-indigo-600 transition-colors">
            Module 3
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isActive(link.path)
                  ? 'bg-indigo-600 text-gray-900 shadow-[0_6px_20px_rgba(0,208,156,0.3)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Dashboard Button */}
          {isDashboardAuthed ? (
            <button
              onClick={() => navigate('/module3-dashboard')}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#00d09c] to-[#00e6ae] hover:shadow-[0_8px_20px_rgba(0,208,156,0.4)] text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105"
            >
              <CheckCircle size={16} />
              My Dashboard
            </button>
          ) : (
            <button
              onClick={handleDashboardLogin}
              className="hidden sm:flex items-center gap-2 bg-white hover:bg-indigo-600/10 text-indigo-600 border border-[#00d09c]/30 hover:border-indigo-500/60 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              <Shield size={16} />
              Admin Dashboard
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={isDashboardAuthed ? handleDashboardLogout : handleLogout}
            className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-red-400 px-4 py-2.5 rounded-xl transition-all border border-slate-200 hover:border-red-400/40 font-bold text-sm"
            title={isDashboardAuthed ? 'Dashboard Logout' : 'Logout'}
          >
            <LogOut size={16} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-white transition-all text-slate-500 hover:text-indigo-600"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-[#00d09c]/20 bg-slate-50/98 backdrop-blur-md">
          <nav className="flex flex-col gap-2 p-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsMenuOpen(false);
                }}
                className={`w-full px-5 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  isActive(link.path)
                    ? 'bg-indigo-600 text-gray-900 shadow-[0_6px_20px_rgba(0,208,156,0.3)]'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
              {isDashboardAuthed ? (
                <button
                  onClick={() => {
                    navigate('/module3-dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d09c] to-[#00e6ae] text-gray-900 py-3 rounded-xl transition-all font-bold text-sm"
                >
                  <CheckCircle size={16} />
                  My Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleDashboardLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 border border-[#00d09c]/30 py-3 rounded-xl transition-all font-bold text-sm"
                >
                  <Shield size={16} />
                  Admin Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  isDashboardAuthed ? handleDashboardLogout() : handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 hover:border-red-400/50 py-3 rounded-xl transition-all font-bold text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Module3Header;