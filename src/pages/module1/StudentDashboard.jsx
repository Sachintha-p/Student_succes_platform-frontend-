import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { 
  Bell, GraduationCap, TrendingUp, ShieldCheck, 
  Mail, BookOpen, Edit3, X, Loader2, Save, User as UserIcon,
  Award, ChevronRight, Target, Zap, Clock, CheckCircle2,
  Users, Sparkles
} from 'lucide-react';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topMatch, setTopMatch] = useState(null);
  const [myTeam, setMyTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Edit Form State matching your image
  const [editForm, setEditForm] = useState({
    fullName: '',
    registrationNumber: '',
    degreeProgramme: '',
    yearOfStudy: '',
    semester: '',
    gpa: '',
    skills: '' 
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const fetchDashboardData = useCallback(async () => {
    if (!token) { navigate('/'); return; }
    try {
      setLoading(true);
      
      // 1. Fetch Basic Auth Profile (gets fullName, email, role)
      const authRes = await fetch('http://localhost:8080/api/v1/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const authData = await authRes.json();
      const basicUser = authData.data || authData;

      // 2. Fetch Detailed Student Profile (gets GPA, skills, degree, year, etc.)
      let studentDetails = {};
      try {
        const studentRes = await fetch('http://localhost:8080/api/v1/students/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          studentDetails = studentData.data || studentData;
        }
      } catch { /* Ignore if student profile doesn't exist yet */ }

      // Combine both sources of data
      const user = { ...basicUser, ...studentDetails };
      setProfile(user);

      // Sync form with fetched data
      setEditForm({
        fullName: user.fullName || '',
        registrationNumber: user.registrationNumber || '',
        degreeProgramme: user.degreeProgramme || '',
        yearOfStudy: user.yearOfStudy || '',
        semester: user.semester || '',
        gpa: user.gpa || '',
        skills: user.skills ? user.skills.join(', ') : ''
      });

      // 3. Fetch Matching Score
      try {
        const matchRes = await fetch('http://localhost:8080/api/v1/matching/my-groups', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          const list = matchData.data || matchData;
          if (list && list.length > 0) setTopMatch(list[0]);
        }
      } catch { /* matching optional */ }

      // 4. Fetch My Teams
      try {
        const groupRes = await fetch('http://localhost:8080/api/v1/teams/my?page=0&size=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          const list = groupData.data?.content || groupData.data || [];
          if (list.length > 0) setMyTeam(list[0]);
        }
      } catch { /* teams optional */ }

      // 5. Fetch pending invite count for badge
      try {
        const invRes = await fetch('http://localhost:8080/api/v1/invitations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (invRes.ok) {
          const invData = await invRes.json();
          setInviteCount((invData.data || []).length);
        }
      } catch { /* invites optional */ }

    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- VALIDATION & SUBMIT LOGIC ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormErrors({});

    // Form Validation Rules
    const errors = {};
    if (!editForm.fullName || editForm.fullName.trim() === '') errors.fullName = "Full name is required";
    if (!editForm.registrationNumber || editForm.registrationNumber.trim() === '') errors.registrationNumber = "Reg Number is required";
    
    const parsedGPA = parseFloat(editForm.gpa);
    if (editForm.gpa && (parsedGPA > 4.0 || parsedGPA < 0)) errors.gpa = "GPA must be between 0 and 4.0";
    
    if (!editForm.yearOfStudy || parseInt(editForm.yearOfStudy) <= 0) errors.yearOfStudy = "Valid Year is required";
    if (!editForm.semester || parseInt(editForm.semester) <= 0) errors.semester = "Valid Semester is required";
    if (!editForm.skills || editForm.skills.trim() === '') errors.skills = "At least one skill is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        ...editForm,
        gpa: parseFloat(editForm.gpa) || 0,
        yearOfStudy: parseInt(editForm.yearOfStudy) || 0,
        semester: parseInt(editForm.semester) || 0,
        skills: editForm.skills ? editForm.skills.split(',').map(s => s.trim().toLowerCase()) : []
      };

      // FIXED: Sending the PUT request to the StudentController endpoint!
      const response = await fetch('http://localhost:8080/api/v1/students/me', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        fetchDashboardData(); // Refresh data with new saved values
      } else {
        alert('Update failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 text-slate-900 relative overflow-hidden">
      {/* Background Decorative Blurs - Inspired by Home Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-20 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-sky-300 blur-[120px] rounded-full mix-blend-multiply" />
      </div>
      
      <Sidebar />

      <main className="flex-1 ml-72 p-10 relative z-10">
        {/* TOP NAV BAR */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Academic Portal</span>
            </h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 border border-indigo-200/50 text-indigo-700 font-bold text-[10px] uppercase tracking-widest mt-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Operational Status: Active
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700 hover:text-indigo-600 px-6 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-sm"
            >
              <Edit3 size={15} strokeWidth={2.5} /> Edit Identity
            </button>
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-600/20 ring-4 ring-white/50">
              {profile?.fullName?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        {/* ─── PROFILE HERO ─── */}
        <div className="relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl shadow-indigo-900/10 border border-white bg-white">
          {/* Cover Photo */}
          <div className="w-full h-80 relative group bg-indigo-950 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
              alt="University Students Studying"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-indigo-900/30 mix-blend-multiply z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-900/50 to-transparent z-10" />
            
            {/* High-Visibility IT Badge - Moved to Top Right for cleaner layout */}
            <div className="absolute top-8 right-12 flex items-center gap-4 bg-white/10 backdrop-blur-2xl border border-white/30 p-4 rounded-3xl z-30 shadow-2xl shadow-black/30 transform transition-transform hover:scale-105">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div className="pr-2">
                <div className="text-[9px] text-indigo-100 font-black uppercase tracking-[0.3em] leading-none mb-1.5 flex items-center gap-1.5 opacity-80">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Verified Identity
                </div>
                <p className="text-lg text-white font-black tracking-widest drop-shadow-lg">{profile?.registrationNumber || 'AUTHENTICATING...'}</p>
              </div>
            </div>
          </div>

          <div className="px-12 pb-12 relative z-50">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between -mt-16 gap-8">
              <div className="flex flex-col md:flex-row items-end gap-8">
                {/* Avatar - Slightly smaller for better balance */}
                <div className="w-40 h-40 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-[2.25rem] flex items-center justify-center text-white text-6xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-[8px] border-white relative z-50">
                  {profile?.fullName?.charAt(0) || 'S'}
                  <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                </div>

                <div className="pb-4 relative z-50">
                  <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-5 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]">
                    {profile?.fullName}
                  </h1>
                  
                  {/* Detailed Badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-sm transition-hover hover:border-indigo-200">
                      <GraduationCap size={16} className="text-indigo-600" />
                      <span className="text-xs font-bold">{profile?.degreeProgramme || 'Degree Not Set'}</span>
                    </div>
                    {profile?.gpa && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-sm transition-hover hover:border-amber-200">
                        <Award size={16} className="text-amber-600" />
                        <span className="text-xs font-black">GPA {profile.gpa}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-sm transition-hover hover:border-sky-200">
                      <Mail size={16} className="text-sky-600" />
                      <span className="text-xs font-medium">{profile?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Group - Improved contrast labels */}
              <div className="flex items-center gap-10 bg-white/80 border border-slate-100 p-6 rounded-[2.5rem] backdrop-blur-md shadow-xl shadow-slate-200/40 group mb-2">
                <div className="text-center">
                  <p className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest mb-1.5">Academic Year</p>
                  <p className="text-3xl font-black text-slate-900">{profile?.yearOfStudy || '—'}</p>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest mb-1.5">Semester</p>
                  <p className="text-3xl font-black text-slate-900">{profile?.semester || '—'}</p>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2"></div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
                    <Zap size={10} /> AI Sync
                  </p>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">
                    {topMatch ? `${topMatch.score}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            {/* Redesigned Skill Stack */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-10 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-indigo-600" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified Skill Proficiency</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[11px] font-extrabold rounded-2xl shadow-sm hover:border-indigo-400 hover:text-indigo-700 hover:shadow-indigo-100 transition-all cursor-default uppercase tracking-tight">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── ACTION GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Team Status Card */}
          <div className="md:col-span-2 group p-10 rounded-[3rem] bg-indigo-50/40 border border-indigo-100/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Strategic Squads</h3>
                  <p className="text-indigo-600/70 text-xs font-bold uppercase tracking-widest">Collaborative Deployment</p>
                </div>
              </div>

              {myTeam ? (
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Assignment</p>
                      <h4 className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{myTeam.name}</h4>
                      <p className="flex items-center gap-2 text-emerald-600 font-bold text-xs mt-2">
                        <CheckCircle2 size={14} /> Mission: Operational
                      </p>
                    </div>
                    <button onClick={() => navigate('/my-groups')} className="flex items-center gap-3 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                      Manage Operations <ArrowRight size={18} />
                    </button>
                  </div>
                  <div className="bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-indigo-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Task Saturation</p>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-3">
                      <div className="bg-gradient-to-r from-indigo-600 to-sky-500 h-full w-[75%] rounded-full shadow-lg transition-all duration-1000" />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-slate-900">75% Complete</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase">Phase 03</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {topMatch && (
                    <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2rem] border border-indigo-100 shadow-lg relative overflow-hidden group/match">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover/match:scale-125 transition-transform" />
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black text-xs">AI</div>
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Recommended Alliance</p>
                       </div>
                       <div className="flex justify-between items-center relative z-10">
                         <h4 className="text-xl font-bold text-slate-900">{topMatch.groupName}</h4>
                         <p className="text-xl font-black text-indigo-600">{topMatch.score}% Sync</p>
                       </div>
                    </div>
                  )}
                  <button onClick={() => navigate('/my-groups')} className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl uppercase tracking-widest">
                    Mobilize Squad Matchmaker <ChevronRight size={20} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions Column */}
          <div className="flex flex-col gap-4">
            <button
               onClick={() => navigate('/invitations')}
               className="group flex-1 flex flex-col justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <Bell size={24} />
                </div>
                {inviteCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 animate-pulse">
                    {inviteCount} NEW
                  </span>
                )}
              </div>
              <div className="mt-4 text-left">
                <h3 className="text-xl font-black text-slate-900">Inbox</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                   {inviteCount > 0 ? `${inviteCount} pending deploy` : 'No signals detected'}
                </p>
              </div>
            </button>

            <button
               onClick={() => navigate('/smart-match')}
               className="group flex-1 flex flex-col justify-between p-8 rounded-[2.5rem] bg-indigo-600 text-white hover:shadow-2xl hover:shadow-indigo-600/30 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform" />
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all duration-500 shadow-lg relative z-10">
                <Sparkles size={24} />
              </div>
              <div className="mt-4 text-left relative z-10">
                <h3 className="text-xl font-black uppercase tracking-tight">Smart Match</h3>
                <p className="text-indigo-100/70 text-xs font-bold uppercase tracking-[0.2em] mt-1">Autonomous Alignment</p>
              </div>
            </button>
          </div>
        </div>

        {/* ─── BOTTOM ROW: Bio + Academic Hub ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left mb-20">
          {/* Bio Section */}
          <div className="lg:col-span-2 group p-10 rounded-[3rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-slate-50 blur-[100px] -mr-40 -mb-40 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 bg-slate-100 text-slate-700 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500 shadow-sm">
                  <UserIcon size={22} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Executive Briefing</h3>
              </div>
              <p className="text-slate-600 text-xl leading-relaxed font-medium italic">
                "{profile?.bio || 'Initialize your professional profile to optimize strategic alignment with core project modules and high-performing squad alliances.'}"
              </p>
            </div>
          </div>

          {/* Premium Sidebar Hub */}
          <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
               <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] animate-pulse" />
               <div className="absolute bottom-[-10%] left-[-20%] w-48 h-48 bg-sky-500/20 rounded-full blur-[60px]" />
            </div>

            <div className="relative z-10 flex flex-col h-full gap-8">
              <div className="pb-8 border-b border-white/10">
                 <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-3">Academic Institution</p>
                 <h4 className="text-white font-black text-lg leading-tight group-hover:text-indigo-300 transition-colors">SLIIT — Sri Lanka Institute of Information Technology</h4>
              </div>

              <div className="space-y-6 flex-1">
                {[
                  { icon: BookOpen, label: 'Current Stage', value: profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : 'Unknown', color: 'bg-indigo-500/20 text-indigo-300' },
                  { icon: TrendingUp, label: 'Semester Status', value: profile?.semester ? `Phase ${profile.semester}` : 'Unknown', color: 'bg-sky-500/20 text-sky-300' },
                  { icon: Award, label: 'Performance GPA', value: profile?.gpa || '0.00', color: 'bg-amber-500/20 text-amber-300' },
                  { icon: Mail, label: 'Primary Contact', value: profile?.email || 'N/A', color: 'bg-emerald-500/20 text-emerald-300' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 group/item">
                    <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover/item:scale-110`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-white font-black text-sm truncate">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-8 mt-auto border-t border-white/10">
                 <div className="flex items-center justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                   <span>System Health</span>
                   <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Optimal</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CUSTOMIZED DARK THEME EDIT PROFILE MODAL --- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white text-slate-600 w-full max-w-[500px] rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-left relative animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-200/50 bg-slate-100">
                <h3 className="text-xl font-black text-slate-900 italic">Edit Profile</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-900 p-2 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {/* Modal Form */}
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    value={editForm.fullName} 
                    onChange={e => setEditForm({...editForm, fullName: e.target.value})} 
                    className={`w-full bg-slate-50 border ${formErrors.fullName ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all`}
                  />
                  {formErrors.fullName && <p className="text-[10px] text-red-500 font-bold">{formErrors.fullName}</p>}
                </div>

                {/* Reg Number & GPA */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Reg Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      value={editForm.registrationNumber} 
                      onChange={e => setEditForm({...editForm, registrationNumber: e.target.value.toUpperCase()})} 
                      placeholder="e.g. IT23662278"
                      className={`w-full bg-slate-50 border ${formErrors.registrationNumber ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-gray-700`}
                    />
                    {formErrors.registrationNumber && <p className="text-[10px] text-red-500 font-bold">{formErrors.registrationNumber}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">GPA</label>
                    <input 
                      type="number" step="0.01" max="4.0" min="0.0"
                      value={editForm.gpa} 
                      onChange={e => setEditForm({...editForm, gpa: e.target.value})} 
                      className={`w-full bg-slate-50 border ${formErrors.gpa ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all`}
                    />
                    {formErrors.gpa && <p className="text-[10px] text-red-500 font-bold">{formErrors.gpa}</p>}
                  </div>
                </div>

                {/* Degree Programme */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Degree Programme</label>
                  <input 
                    value={editForm.degreeProgramme} 
                    onChange={e => setEditForm({...editForm, degreeProgramme: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Year & Semester */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Year of Study <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" min="1" max="5"
                      value={editForm.yearOfStudy} 
                      onChange={e => setEditForm({...editForm, yearOfStudy: e.target.value})} 
                      className={`w-full bg-slate-50 border ${formErrors.yearOfStudy ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all`}
                    />
                    {formErrors.yearOfStudy && <p className="text-[10px] text-red-500 font-bold">{formErrors.yearOfStudy}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Semester <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" min="1" max="2"
                      value={editForm.semester} 
                      onChange={e => setEditForm({...editForm, semester: e.target.value})} 
                      className={`w-full bg-slate-50 border ${formErrors.semester ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all`}
                    />
                    {formErrors.semester && <p className="text-[10px] text-red-500 font-bold">{formErrors.semester}</p>}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-1.5 pb-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    My Skills (Comma separated) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    value={editForm.skills} 
                    onChange={e => setEditForm({...editForm, skills: e.target.value.toLowerCase()})} 
                    placeholder="e.g. react, java, spring boot"
                    className={`w-full bg-slate-50 border ${formErrors.skills ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 transition-all lowercase placeholder:text-gray-700`}
                  />
                  {formErrors.skills && <p className="text-[10px] text-red-500 font-bold">{formErrors.skills}</p>}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/50">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-black text-xs text-slate-500 hover:text-slate-900 hover:bg-white/5 transition-colors border border-slate-200 uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 disabled:opacity-70 uppercase tracking-widest shadow-lg shadow-indigo-600/30"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentDashboard;