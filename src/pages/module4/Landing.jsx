import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Calendar, Bot, ArrowRight, ChevronRight,
  CheckCircle2, Sparkles, GraduationCap, Quote
} from 'lucide-react';

/* ─── Animated Counter Hook ─── */
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const Landing = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  const heroImages = [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2049&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
  ];

  /* Auto-rotate images */
  useEffect(() => {
    const iv = setInterval(() =>
      setCurrentImageIndex(p => (p + 1) % heroImages.length), 4000);
    return () => clearInterval(iv);
  }, []);

  /* Scroll-aware navbar */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Stats counter trigger on visibility */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.4 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCounter(500, 1800, statsVisible);
  const c2 = useCounter(4,   1000, statsVisible);
  const c3 = useCounter(95,  1600, statsVisible);

  const features = [
    { title: "Smart Team Matchmaker", description: "AI-powered group formation and skills-based matching for university projects.", icon: <Users className="w-6 h-6 text-indigo-600" />, bg: "bg-indigo-50", border: "border-indigo-100", glow: "hover:shadow-indigo-100" },
    { title: "Job Matchmaker & ATS",  description: "Upload your CV, get ATS scoring, and discover AI-driven job suggestions.",      icon: <Briefcase className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-50", border: "border-emerald-100", glow: "hover:shadow-emerald-100" },
    { title: "Campus Engagement Hub", description: "Manage campus events, RSVP, and track project tasks with Kanban boards.",      icon: <Calendar className="w-6 h-6 text-rose-600" />,    bg: "bg-rose-50",    border: "border-rose-100",    glow: "hover:shadow-rose-100" },
    { title: "AI Academic Assistant", description: "GPT-powered Q&A, study resource library, and smart academic guidance.",         icon: <Bot className="w-6 h-6 text-sky-600" />,       bg: "bg-sky-50",     border: "border-sky-100",     glow: "hover:shadow-sky-100" },
  ];

  const steps = [
    { number: "01", title: "Create Your Account", description: "Sign up in 30 seconds with your SLIIT student email. No credit card required.", icon: <GraduationCap className="w-6 h-6" /> },
    { number: "02", title: "Build Your AI Profile", description: "Enter your skills, GPA, and degree. Our AI creates your intelligent academic profile.", icon: <Sparkles className="w-6 h-6" /> },
    { number: "03", title: "Get Matched & Excel", description: "Receive personalized team matches, job recommendations, and AI-powered study guidance.", icon: <CheckCircle2 className="w-6 h-6" /> },
  ];

  const testimonials = [
    { name: "Kavya Perera",     degree: "BSc. IT, Year 3",        quote: "Smart Campus Hub completely changed how I find project teams. The AI matching is incredibly accurate — I found my ideal group in minutes!", avatar: "KP" },
    { name: "Dineth Rathnayake", degree: "SE, Year 2",            quote: "The ATS checker helped me optimize my CV and land my first internship interview. The AI feedback was spot on.", avatar: "DR" },
    { name: "Amaya Fernando",   degree: "BSc. CS, Year 4",        quote: "The AI Academic Assistant is like having a personal tutor. It helped me understand complex topics before my finals.", avatar: "AF" },
    { name: "Ravindu Silva",    degree: "IT, Year 3",             quote: "Managing our group project via the Campus Hub's Kanban board made collaboration seamless. Highly recommend!", avatar: "RS" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* ── NAVIGATION ────────────────────────────────── */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/50'
          : 'bg-transparent'
      }`}>
        <div className="px-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${
                scrolled
                  ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-indigo-500'
                  : 'text-white drop-shadow-lg'
              }`}>
                Smart Campus Hub
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className={`font-semibold px-4 py-2 transition-colors text-sm ${
                  scrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-6 py-2.5 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm ${
                  scrolled
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    : 'bg-white hover:bg-indigo-50 text-indigo-700'
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO — Full Screen ─────────────────────────── */}
      <section className="relative h-screen w-full overflow-hidden">

        {heroImages.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Campus Life ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
              idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/92 via-indigo-900/55 to-indigo-900/25" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 font-semibold text-xs mb-8">
            <span className="flex h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
            SLIIT Student Success Platform v2.0
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 drop-shadow-xl max-w-4xl">
            Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">
              academic life
            </span>
            , perfectly organized.
          </h1>

          <p className="text-lg text-white/75 mb-10 max-w-2xl leading-relaxed font-medium">
            Experience the next generation of campus engagement — AI-powered team matching,
            intelligent job suggestions, and seamless task management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 hover:shadow-2xl hover:shadow-indigo-600/40 transition-all group active:scale-95"
            >
              Start for free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl hover:bg-white/20 transition-all active:scale-95">
              Watch demo
            </button>
          </div>

          <div className="mt-10 flex items-center gap-8 text-sm text-white/50 font-semibold">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-300" />No credit card</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-300" />AI Features Included</div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`rounded-full transition-all duration-500 ${
                idx === currentImageIndex ? 'bg-white w-8 h-2.5' : 'bg-white/40 w-2.5 h-2.5 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── ANIMATED STATS BANNER ─────────────────────── */}
      <section ref={statsRef} className="py-16 bg-indigo-950">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: `${c1}+`, label: 'Active Students',  suffix: '' },
              { value: c2,        label: 'AI-Powered Modules', suffix: '' },
              { value: `${c3}%`, label: 'Team Match Rate',  suffix: '' },
            ].map((stat, i) => (
              <div key={i} className="group">
                <p className="text-5xl lg:text-6xl font-black text-white mb-3 transition-transform group-hover:scale-105">
                  {stat.value}
                </p>
                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-[0.25em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Platform Modules</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Four powerful AI-integrated modules, built for modern SLIIT students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/login')}
                className={`group p-8 rounded-3xl border ${f.border} ${f.bg} hover:bg-white hover:shadow-2xl ${f.glow} transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
              >
                <div className={`w-14 h-14 ${f.bg} border ${f.border} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{f.description}</p>
                <div className="inline-flex items-center text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section className="py-28 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center max-w-xl mx-auto mb-20">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Getting Started</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Up and running in 3 steps
            </h2>
            <p className="text-lg text-slate-500">No complicated setup. Just smart tools ready to use.</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-start gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.5%+1px)] right-[calc(16.5%+1px)] h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200" />

            {steps.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center text-center relative">
                {/* Number circle */}
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-600/25 mb-8 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200 leading-none">{step.number}</span>
                  <div className="mt-1">{step.icon}</div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section className="py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Student Stories</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Loved by SLIIT students
            </h2>
            <p className="text-lg text-slate-500">Real experiences from the Smart Campus community.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="group p-7 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300"
              >
                <Quote className="w-6 h-6 text-indigo-200 mb-4" />
                <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{t.degree}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ──────────────────────────── */}
      <section className="py-32 bg-indigo-950 relative overflow-hidden">
        {/* Mesh glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 font-semibold text-xs mb-8">
            <Sparkles className="w-3 h-3" />
            AI-Powered Academic Platform
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Ready to transform your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">
              academic journey?
            </span>
          </h2>
          <p className="text-lg text-indigo-200/70 mb-12 leading-relaxed max-w-xl mx-auto font-medium">
            Join hundreds of SLIIT students already using Smart Campus Hub to collaborate smarter,
            find better opportunities, and excel academically.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center px-12 py-5 text-base font-bold text-indigo-900 bg-white rounded-2xl hover:bg-indigo-50 hover:shadow-2xl hover:shadow-white/10 transition-all group active:scale-95"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-5 text-xs text-indigo-300/50 font-semibold">
            Free to use • No credit card required • Instant access
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="py-12 bg-slate-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <span className="font-bold text-white text-base">Smart Campus Hub</span>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">SLIIT Student Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">About</a>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              © 2026 SLIIT Student Success Platform
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
