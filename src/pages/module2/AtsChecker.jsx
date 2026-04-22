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
  ShieldAlert
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
    if (score >= 80) return 'text-[#00d09c]';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-[#00d09c]/20 text-[#00d09c] border-[#00d09c]/30';
    if (score >= 60) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
    return 'bg-red-400/20 text-red-400 border-red-400/30';
  };

  return (
    <div className="flex min-h-screen bg-[#090e17] text-gray-300 font-sans">
      <Sidebar />

      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">ATS Score Checker 🎯</h2>
            <p className="text-gray-500 mt-1">Get instant feedback on your resume's industry performance.</p>
          </div>
          <button className="p-3 bg-[#121826] border border-gray-800 rounded-xl text-gray-400 hover:text-[#00d09c] transition-all">
            <Bell size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left items-start">
          
          {/* --- UPLOAD SECTION --- */}
          <div className="bg-[#121826] p-8 rounded-3xl border border-gray-800/50 shadow-2xl sticky top-10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Upload size={20} className="text-[#00d09c]" />
              Upload Resume
            </h3>
            
            <div className="border-2 border-dashed border-gray-800 rounded-2xl p-10 text-center hover:bg-white/[0.02] hover:border-[#00d09c]/30 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                name="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#090e17] rounded-2xl flex items-center justify-center border border-gray-800 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="text-[#00d09c]" size={32} />
                </div>
                {file ? (
                  <p className="text-[#00d09c] font-bold tracking-tight">{file.name}</p>
                ) : (
                  <>
                    <p className="text-white font-bold mb-1">Drag and drop your PDF here</p>
                    <p className="text-sm text-gray-500">Only PDF files are supported for scanning</p>
                  </>
                )}
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isAnalyzing || !file}
              className="mt-8 w-full bg-[#00d09c] hover:bg-[#00e6ae] disabled:opacity-30 text-gray-900 font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(0,208,156,0.3)] transition-all flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target size={20} />
                  Scan My Resume
                </>
              )}
            </button>
          </div>

          {/* --- RESULTS SECTION --- */}
          <div className="bg-[#121826] p-8 rounded-3xl border border-gray-800/50 shadow-2xl min-h-[500px]">
            <h3 className="text-xl font-bold text-white mb-6">Analysis Results</h3>

            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 pt-20">
                <Target size={64} strokeWidth={1} />
                <p className="font-medium text-center max-w-[200px]">Upload a resume to see your professional score and weak points.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 pt-20">
                <div className="w-16 h-16 border-4 border-[#00d09c]/20 border-t-[#00d09c] rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-white font-bold animate-pulse">Extracting Data...</p>
                  <p className="text-xs text-gray-500 mt-1">Our system is identifying improvements.</p>
                </div>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* Score Header */}
                <div className="flex items-center justify-between p-6 bg-[#090e17] border border-gray-800 rounded-2xl shadow-inner">
                  <div>
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Overall ATS Score</p>
                    <p className={`text-5xl font-black ${getScoreColor(result.score)}`}>
                      {result.score}<span className="text-xl text-gray-600 ml-1">/100</span>
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border ${getScoreBg(result.score)}`}>
                    {result.status}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Keywords", val: result.keywordMatch, icon: <Search size={14}/> },
                    { label: "Formatting", val: "Passed", icon: <CheckCircle2 size={14} className="text-[#00d09c]"/> },
                    { label: "Readability", val: "High", icon: <CheckCircle2 size={14} className="text-[#00d09c]"/> }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-[#090e17] border border-gray-800 rounded-2xl text-center">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">{item.label}</p>
                      <div className="flex items-center justify-center gap-1 font-bold text-white text-sm">
                        {item.icon} {item.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- WEAK POINTS SECTION --- */}
                <div>
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} />
                    Weak Points Identified
                  </h4>
                  <div className="space-y-3">
                    {result.weakPoints.length > 0 ? (
                      result.weakPoints.map((point, i) => (
                        <div key={i} className="p-4 bg-red-400/5 border border-red-400/20 rounded-xl flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div>
                          <p className="text-sm text-gray-300 leading-relaxed">{point}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">No significant weak points found. Great job!</p>
                    )}
                  </div>
                </div>

                {/* --- IMPROVEMENTS SECTION --- */}
                <div>
                  <h4 className="text-xs font-black text-[#00d09c] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Recommended Improvements
                  </h4>
                  <div className="space-y-3">
                    {result.improvements.length > 0 ? (
                      result.improvements.map((tip, i) => (
                        <div key={i} className="p-4 bg-[#00d09c]/5 border border-[#00d09c]/20 rounded-xl flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00d09c] mt-1.5 shadow-[0_0_8px_rgba(0,208,156,0.8)]"></div>
                          <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">Your resume is highly optimized.</p>
                    )}
                  </div>
                </div>

                {/* Keywords Grid */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.slice(0, 8).map((word, i) => (
                        <span key={i} className="px-2 py-1 bg-red-400/5 text-red-400/70 rounded-md text-[10px] font-bold border border-red-400/10">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedKeywords.slice(0, 8).map((word, i) => (
                        <span key={i} className="px-2 py-1 bg-[#00d09c]/5 text-[#00d09c]/70 rounded-md text-[10px] font-bold border border-[#00d09c]/10">
                          {word}
                        </span>
                      ))}
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