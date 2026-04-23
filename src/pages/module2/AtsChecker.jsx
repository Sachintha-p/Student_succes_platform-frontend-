import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; 
import { 
  Bell, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Loader2, 
  Target,
  TrendingUp,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

const AtsChecker = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a resume first, bro!");

    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/v1/resumes/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const actualResult = data.data || data; 

        // Mapping backend response fields
        setResult({
          score: actualResult.atsScore || 0,
          status: (actualResult.atsScore || 0) >= 75 ? "Good Match" : "Needs Improvement",
          keywordMatch: actualResult.keywordCount || "Scanned",
          weakPoints: actualResult.weakPoints || [],
          improvements: actualResult.improvements || [],
          missingKeywords: actualResult.missingKeywords || [],
          matchedKeywords: actualResult.matchedKeywords || []
        });
      } else {
        alert("Failed to analyze. Check your Spring Boot terminal for errors!");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Server error. Is Spring Boot running?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-indigo-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm';
    if (score >= 60) return 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm';
    return 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-600 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="relative bg-white border border-slate-200 p-10 rounded-[2.5rem] mb-12 shadow-xl shadow-slate-200/50 text-left overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-4">
                <Sparkles size={14} className="animate-pulse" /> AI Powered Analysis
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">ATS Score Checker 🎯</h2>
              <p className="text-slate-400 mt-2 text-base font-medium italic">Instant professional feedback on your resume's industry performance.</p>
            </div>
            <button className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-lg transition-all active:scale-95">
              <Bell size={24} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left items-start">
          
          {/* --- UPLOAD SECTION --- */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200/50 shadow-2xl shadow-indigo-100/50 sticky top-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Upload size={24} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">Upload Resume</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF Format only • Max 5MB</p>
               </div>
            </div>
            
            <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center hover:bg-slate-50 hover:border-indigo-500 transition-all cursor-pointer relative group bg-slate-50/30">
              <input 
                type="file" 
                name="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border border-slate-100 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-slate-200/50">
                  <FileText className="text-indigo-600" size={40} />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-indigo-600 font-black text-lg tracking-tight">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ready to analyze</p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-900 font-black text-lg mb-2">Drop your PDF here</p>
                    <p className="text-sm text-slate-400 font-medium">System will extract data and identify improvements</p>
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isAnalyzing || !file}
              className="mt-10 w-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-30 text-white font-black py-6 rounded-[1.5rem] shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Analyzing Resume Integrity...
                </>
              ) : (
                <>
                  <Target size={24} className="group-hover:scale-125 transition-transform" />
                  Scan & Verify Score
                </>
              )}
            </button>
            <p className="text-[9px] text-slate-300 text-center mt-6 font-bold uppercase tracking-[0.2em]">Processed by SmartCampus AI Engine v2.0</p>
          </div>

          {/* --- RESULTS SECTION --- */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200/50 shadow-2xl shadow-indigo-100/50 min-h-[600px] flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 mb-8 px-2">Analysis Results</h3>

            {!result && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-6 pb-20">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
                  <Target size={64} strokeWidth={1} />
                </div>
                <div className="text-center">
                   <p className="font-black uppercase tracking-widest text-[11px] mb-2">Awaiting Document</p>
                   <p className="font-medium text-slate-400 text-sm max-w-[250px]">Upload a resume to unlock professional insights and weak points.</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-20">
                <div className="relative">
                   <div className="w-24 h-24 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="text-indigo-600 animate-pulse" size={24} />
                   </div>
                </div>
                <div className="text-center">
                  <p className="text-slate-900 font-extrabold text-lg animate-pulse mb-1">Deep Scanning Data...</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Our AI is mapping your career trajectory</p>
                </div>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Score Header */}
                <div className="flex items-center justify-between p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all duration-700 group-hover:scale-125"></div>
                  <div className="relative z-10">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-2">Executive Overview</p>
                    <p className={`text-6xl font-black ${getScoreColor(result.score)} tracking-tighter`}>
                      {result.score}<span className="text-2xl text-slate-300 ml-1">.0</span>
                    </p>
                  </div>
                  <div className={`px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest border relative z-10 ${getScoreBg(result.score)}`}>
                    {result.status}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-5">
                  {[
                    { label: "Keywords", val: result.keywordMatch, icon: <Search size={14} className="text-indigo-400"/> },
                    { label: "Formatting", val: "Passed", icon: <CheckCircle2 size={14} className="text-indigo-600"/> },
                    { label: "Readability", val: "High", icon: <TrendingUp size={14} className="text-indigo-600"/> }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center gap-3 group">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:text-indigo-600 transition-colors">{item.icon}</div>
                      <div>
                         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.label}</p>
                         <p className="font-black text-slate-900 text-sm">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* --- WEAK POINTS SECTION --- */}
                   <section>
                    <h4 className="text-[11px] font-black text-rose-500 bg-rose-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 flex items-center justify-center gap-2 border border-rose-100 shadow-sm w-fit mx-auto lg:mx-0">
                      <ShieldAlert size={14} />
                      Critical Weak Points
                    </h4>
                    <div className="space-y-4">
                      {result.weakPoints.length > 0 ? (
                        result.weakPoints.map((point, i) => (
                          <div key={i} className="p-5 bg-white border border-rose-50 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                            <p className="text-xs text-slate-600 leading-relaxed font-bold">{point}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                           <p className="text-xs text-slate-400 font-bold italic">Perfect alignment detected.</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* --- IMPROVEMENTS SECTION --- */}
                  <section>
                    <h4 className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-6 flex items-center justify-center gap-2 border border-indigo-100 shadow-sm w-fit mx-auto lg:mx-0">
                      <TrendingUp size={14} />
                      Strategic Insights
                    </h4>
                    <div className="space-y-4">
                      {result.improvements.length > 0 ? (
                        result.improvements.map((tip, i) => (
                          <div key={i} className="p-5 bg-white border border-indigo-50 rounded-2xl flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
                            <p className="text-xs text-slate-600 leading-relaxed font-bold">{tip}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                           <p className="text-xs text-slate-400 font-bold italic">Highly optimized for ATS screening.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Keywords Grid Full Width */}
                <div className="p-8 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-2xl mt-4">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <div>
                      <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <AlertCircle size={14} /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.length > 0 ? result.missingKeywords.slice(0, 10).map((word, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-[10px] font-black border border-white/10 hover:bg-white/20 transition-colors uppercase tracking-wider">
                            {word}
                          </span>
                        )) : <p className="text-[10px] text-white/40 font-bold">None detected</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                         <CheckCircle2 size={14} /> Top Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedKeywords.length > 0 ? result.matchedKeywords.slice(0, 10).map((word, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-[10px] font-black border border-white/10 hover:bg-white/20 transition-colors uppercase tracking-wider">
                            {word}
                          </span>
                        )) : <p className="text-[10px] text-white/40 font-bold">No matches found</p>}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AtsChecker;