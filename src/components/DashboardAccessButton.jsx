import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle } from 'lucide-react';

const DashboardAccessButton = () => {
  const [isDashboardAuthed, setIsDashboardAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const dashboardSession = localStorage.getItem('dashboardAdmin');
    setIsDashboardAuthed(!!dashboardSession);
  }, []);

  const handleDashboardClick = () => {
    if (isDashboardAuthed) {
      navigate('/module3-dashboard');
    } else {
      navigate('/module3-dashboard-login');
    }
  };

  return (
    <button
      onClick={handleDashboardClick}
      className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-full shadow-[0_10px_30px_rgba(0,208,156,0.3)] transition-all transform hover:scale-110 active:scale-95 z-40 px-4 py-3 font-bold text-sm ${
        isDashboardAuthed
          ? 'bg-gradient-to-r from-[#00d09c] to-[#00e6ae] text-gray-900 hover:shadow-[0_15px_40px_rgba(0,208,156,0.5)]'
          : 'bg-[#121826] text-[#00d09c] border border-[#00d09c]/50 hover:border-[#00d09c] hover:bg-[#00d09c]/10'
      }`}
      title={isDashboardAuthed ? 'Go to My Dashboard' : 'Access Admin Dashboard'}
    >
      {isDashboardAuthed ? (
        <>
          <CheckCircle size={18} />
          <span className="hidden sm:inline">Dashboard</span>
        </>
      ) : (
        <>
          <Shield size={18} />
          <span className="hidden sm:inline">Admin</span>
        </>
      )}
    </button>
  );
};

export default DashboardAccessButton;
