import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Key, Loader2, Shield, User } from 'lucide-react';

const Login = () => {
  // --- 1. STATE MANAGEMENT ---
  const [loginMode, setLoginMode] = useState('student'); // 'student' or 'admin'
  const [step, setStep] = useState(1); // 1: Email, 2: OTP (for students)
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // --- 2. LOGIC: STUDENT FLOW (OTP) ---
  const handleStudentOtpRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStep(2); 
      } else {
        setError('Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      setError('Server error. Is your Spring Boot app running?');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/student-dashboard'); 
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Server error during verification.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. LOGIC: ADMIN FLOW (PASSWORD) ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/admin-dashboard'); 
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setError('Server error. Is your Spring Boot app running?');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. UI: TAB SWITCHING ---
  const switchMode = (mode) => {
    setLoginMode(mode);
    setError('');
    setStep(1); 
    setEmail('');
    setPassword('');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090e17] font-sans px-4">
      <div className="bg-[#121826] p-8 rounded-[2.5rem] shadow-2xl border border-gray-800/40 w-full max-w-[420px]">
        
        {/* Neon Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#00d09c] rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(0,208,156,0.4)]">
            <span className="text-white font-extrabold text-3xl">S</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold tracking-wide">Student Hub</h1>
          <p className="mt-2 text-gray-400 text-sm">Sign in to your account</p>
        </div>

        {/* --- TABS SECTION: THIS IS WHAT WAS MISSING --- */}
        <div className="flex bg-[#090e17] p-1.5 rounded-2xl mb-8 border border-gray-800 shadow-inner">
          <button
            type="button"
            onClick={() => switchMode('student')}
            className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
              loginMode === 'student' ? 'bg-[#121826] text-[#00d09c] shadow-lg border border-gray-800' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <User size={14} /> Student
          </button>
          <button
            type="button"
            onClick={() => switchMode('admin')}
            className={`flex-1 py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
              loginMode === 'admin' ? 'bg-[#121826] text-[#00d09c] shadow-lg border border-gray-800' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Shield size={14} /> Admin
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 text-xs font-bold text-red-400 bg-red-500/5 border border-red-500/20 rounded-2xl text-center flex items-center justify-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* --- STUDENT OTP FLOW --- */}
        {loginMode === 'student' && (
          step === 1 ? (
            <form onSubmit={handleStudentOtpRequest} className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#00d09c] transition-colors" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#090e17] border border-gray-800 text-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00d09c] transition-all placeholder-gray-600" placeholder="it2XXXXXX@my.sliit.lk" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#00d09c] hover:bg-[#00e6ae] disabled:opacity-50 text-gray-900 font-black py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,208,156,0.3)] transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStudentOtpVerify} className="space-y-5">
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00d09c] w-5 h-5" />
                <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-[#090e17] border border-gray-800 text-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00d09c] transition-all tracking-[0.5em] text-center text-xl font-black placeholder-gray-600" placeholder="000000" maxLength={6} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#00d09c] hover:bg-[#00e6ae] disabled:opacity-50 text-gray-900 font-black py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,208,156,0.3)] transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Verifying...' : 'Login Now'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); }} className="w-full text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest">← Back to Email</button>
            </form>
          )
        )}

        {/* --- ADMIN PASSWORD FLOW --- */}
        {loginMode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#00d09c] transition-colors" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#090e17] border border-gray-800 text-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00d09c] transition-all placeholder-gray-600" placeholder="admin@sliit.lk" />
            </div>
            <div className="relative group">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-[#00d09c] transition-colors" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#090e17] border border-gray-800 text-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00d09c] transition-all tracking-widest font-mono" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#00d09c] hover:bg-[#00e6ae] disabled:opacity-50 text-gray-900 font-black py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,208,156,0.3)] transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-sm mt-2">
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Authenticating...' : 'Admin Secure Login'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;