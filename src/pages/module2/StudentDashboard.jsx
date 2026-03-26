import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // Importing the separate menu bar
import { 
  Bell, 
  ChevronRight,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Mail,
  BookOpen,
  Edit3
} from 'lucide-react';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  // --- 1. FETCH PROFILE DATA (Logic remains unchanged) ---
  const fetchProfile = useCallback(async () => {
    if (!token) {
      navigate('/');
      return;
    }
    try {
      setLoading(true);
      // Hits your AuthServiceImpl getProfile logic
      const response = await fetch('http://localhost:8080/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      
      {/* 1. SEPARATE SIDEBAR COMPONENT */}
      <Sidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 ml-72 p-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Welcome back, {profile?.fullName?.split(' ')[0] || 'Student'}! 👋
            </h2>
            <p className="text-gray-500 mt-1">Manage your profile and personal details</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-[#121826] border border-gray-800 rounded-xl text-gray-400 hover:text-[#00d09c] transition-all">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-[#00d09c] rounded-xl flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(0,208,156,0.3)]">
              {profile?.fullName?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        {/* --- PROFILE SUMMARY CARD --- */}
        <div className="bg-[#121826] rounded-3xl border border-gray-800/50 p-8 shadow-2xl mb-8 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00d09c]/5 blur-[100px] rounded-full"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 bg-[#00d09c] rounded-[2rem] flex items-center justify-center text-white text-5xl font-black shadow-[0_10px_30px_rgba(0,208,156,0.3)] relative">
                {profile?.fullName?.charAt(0) || 'S'}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#121826] rounded-full flex items-center justify-center p-1">
                   <div className="w-full h-full bg-[#00d09c] rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-black text-white tracking-tight">{profile?.fullName || 'Student'}</h1>
                  <span className="bg-[#00d09c]/10 text-[#00d09c] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#00d09c]/20">Active</span>
                </div>
                <p className="text-gray-400 text-lg mb-1">{profile?.degreeProgramme || 'Degree not specified'}</p>
                <p className="text-gray-600 text-sm">{profile?.email}</p>
              </div>
            </div>

            <button className="bg-[#1a2130] border border-gray-800 hover:border-gray-700 text-gray-300 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
              Edit Profile
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 mt-12 pt-10 border-t border-gray-800/50 gap-4">
            <div className="text-center">
              <div className="flex justify-center mb-2"><GraduationCap className="text-[#00d09c]" size={24} /></div>
              <p className="text-white font-black text-xl">{profile?.registrationNumber || 'PENDING'}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Reg Number</p>
            </div>
            <div className="text-center border-x border-gray-800/50">
              <div className="flex justify-center mb-2"><TrendingUp className="text-[#00d09c]" size={24} /></div>
              <p className="text-white font-black text-xl">{profile?.gpa || 'N/A'}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">GPA</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2"><ShieldCheck className="text-[#00d09c]" size={24} /></div>
              <p className="text-white font-black text-xl">{profile?.role || 'Student'}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Status</p>
            </div>
          </div>
        </div>

        {/* --- LOWER SECTIONS --- */}
        <div className="space-y-8 text-left">
          <div className="bg-[#121826] rounded-3xl border border-gray-800/50 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00d09c]/10 text-[#00d09c] rounded-lg">
                  <Edit3 size={18} />
                </div>
                <h3 className="text-xl font-bold text-white">About Me</h3>
              </div>
              <button className="text-gray-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-1">
                Edit <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-gray-400 leading-relaxed italic">
              "You haven't added a bio yet. Click Edit Profile to add one!"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#121826] rounded-3xl border border-gray-800/50 p-8 shadow-2xl flex items-center gap-6">
              <div className="w-14 h-14 bg-[#00d09c]/5 rounded-2xl flex items-center justify-center border border-[#00d09c]/10">
                <Mail className="text-[#00d09c]" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-white font-bold">{profile?.email || 'Not available'}</p>
              </div>
            </div>

            <div className="bg-[#121826] rounded-3xl border border-gray-800/50 p-8 shadow-2xl flex items-center gap-6">
              <div className="w-14 h-14 bg-[#00d09c]/5 rounded-2xl flex items-center justify-center border border-[#00d09c]/10">
                <BookOpen className="text-[#00d09c]" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Degree Programme</p>
                <p className="text-white font-bold">{profile?.degreeProgramme || 'Not Specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;