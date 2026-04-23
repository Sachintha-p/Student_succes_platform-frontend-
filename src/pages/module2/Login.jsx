import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Key, Loader2, Shield, User, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [loginMode, setLoginMode] = useState('student');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const getOtpString = () => otp.join('');

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleStudentOtpRequest = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login/email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setStep(2); setOtp(['','','','','','']); }
      else setError('Failed to send OTP. Please check your email.');
    } catch { setError('Server error. Is your Spring Boot app running?'); }
    finally { setLoading(false); }
  };

  const handleStudentOtpVerify = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: getOtpString() }),
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/student-dashboard');
      } else setError('Invalid OTP. Please try again.');
    } catch { setError('Server error during verification.'); }
    finally { setLoading(false); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/admin-job-dashboard');
      } else setError(data.message || 'Invalid admin credentials.');
    } catch { setError('Server error. Is your Spring Boot app running?'); }
    finally { setLoading(false); }
  };

  const switchMode = (mode) => {
    setLoginMode(mode); setError(''); setStep(1);
    setEmail(''); setPassword(''); setOtp(['','','','','','']);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans">

      {/* Full-screen background — Stunning modern library interior */}
      <img
        src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=2070&auto=format&fit=crop"
        alt="University Campus Life"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Deep indigo gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-900/25 to-indigo-950/45" />

      {/* Brand — top left */}
      <div className="absolute top-8 left-10 flex items-center gap-2.5 z-10">
        <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
          <span className="text-white font-extrabold text-base">S</span>
        </div>
        <span className="text-white font-bold text-sm">Smart Campus Hub</span>
      </div>

      {/* Back to home — top right */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 right-10 z-10 flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </button>

      {/* Centered Floating Card */}
      <div className="absolute inset-0 flex items-center justify-center px-4 z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/40 border border-white/60 p-10">

          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              {loginMode === 'student' && step === 2
                ? `Code sent to ${email}`
                : 'Access your Smart Campus Hub account'}
            </p>
          </div>

          {loginMode === 'student' && (
            <div className="flex gap-2 mb-6">
              <div className="h-1 flex-1 rounded-full bg-indigo-600" />
              <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            </div>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            {[
              { mode: 'student', icon: <User size={14} />, label: 'Student' },
              { mode: 'admin',   icon: <Shield size={14} />, label: 'Admin' },
            ].map(({ mode, icon, label }) => (
              <button key={mode} type="button" onClick={() => switchMode(mode)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  loginMode === mode
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Student Step 1 */}
          {loginMode === 'student' && step === 1 && (
            <form onSubmit={handleStudentOtpRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Student Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="it2XXXXXX@my.sliit.lk"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all placeholder-slate-300 font-medium"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex justify-center items-center gap-2 active:scale-[0.98] text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending...' : 'Send Verification Code →'}
              </button>
            </form>
          )}

          {/* Student Step 2: OTP */}
          {loginMode === 'student' && step === 2 && (
            <form onSubmit={handleStudentOtpVerify} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">6 - Digit Code</label>
                <div className="flex gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={el => otpRefs.current[idx] = el}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      className="w-full aspect-square text-center text-xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all"
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading || getOtpString().length < 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex justify-center items-center gap-2 active:scale-[0.98] text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Verifying...' : 'Access Dashboard →'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                className="w-full text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Email
              </button>
            </form>
          )}

          {/* Admin */}
          {loginMode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Admin Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@sliit.lk"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all placeholder-slate-300 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all placeholder-slate-300 tracking-wider font-mono"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full mt-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-[0.98] text-sm"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[10px] text-slate-300 font-medium">
            © 2026 SLIIT Smart Campus Hub
          </p>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center z-10">
        <p className="text-white/25 text-[10px] font-semibold tracking-widest uppercase">
          SLIIT Student Success Platform — Powered by AI
        </p>
      </div>
    </div>
  );
};

export default Login;