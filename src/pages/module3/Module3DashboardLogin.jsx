import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Module3DashboardLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Hardcoded admin credentials
  const ADMIN_EMAIL = 'admin@gmail.com';
  const ADMIN_PASSWORD = '12345678';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate credentials
    if (formData.email !== ADMIN_EMAIL || formData.password !== ADMIN_PASSWORD) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Store dashboard login session
      const dashboardSession = {
        adminEmail: formData.email,
        loginTime: new Date().toISOString(),
        authenticated: true
      };
      
      localStorage.setItem('dashboardAdmin', JSON.stringify(dashboardSession));
      
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/module3-dashboard');
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/module3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090e17] via-[#121826] to-[#090e17] flex items-center justify-center px-6 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-32 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/15 rounded-2xl border border-[#00d09c]/30 mb-6">
            <Lock className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">Sign in to manage your events, meetings, and projects</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 font-bold text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/15 border border-green-500/40 rounded-2xl p-4 flex gap-3">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-green-400 font-bold text-sm">{successMessage}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="admin@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-6 text-slate-900 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="w-full bg-indigo-600 hover:bg-[#00e6ae] disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-gray-900 py-3.5 rounded-xl font-black transition-all shadow-[0_8px_20px_rgba(0,208,156,0.3)] active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-gray-500 text-sm font-medium">Not the admin?</p>
            <button
              onClick={handleGoBack}
              className="text-indigo-600 hover:text-[#00e6ae] font-bold text-sm transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Module3DashboardLogin;