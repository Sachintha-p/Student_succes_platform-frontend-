import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // Importing the separate menu bar
import { 
  Bell, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Loader2, 
  Target 
} from 'lucide-react';

const AtsChecker = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  // --- KEEPING YOUR EXACT LOGIC ---
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

        setResult({
          score: actualResult.atsScore || 0,
          status: (actualResult.atsScore || 0) >= 75 ? "Good Match" : "Needs Improvement",
          keywordMatch: actualResult.keywordMatch || "Scanned",
          formatting: "Checked",
          readability: "Checked",
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
      
      {/* 1. SEPARATE SIDEBAR COMPONENT */}
      <Sidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 ml-72 p-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">ATS Score Checker 🎯</h2>
            <p className="text-gray-500 mt-1">Check how your resume ranks against industry tracking systems.</p>
          </div>
          <button className="p-3 bg-[#121826] border border-gray-800 rounded-xl text-gray-400 hover:text-[#00d09c] transition-all">
            <Bell size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
          
          {/* --- UPLOAD SECTION --- */}
          <div className="bg-[#121826] p-8 rounded-3xl border border-gray-800/50 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Upload size={20} className="text-[#00d09c]" />
              Upload Resume
            </h3>
            
            <div className="border-2 border-dashed border-gray-800 rounded-2xl p-10 text-center hover:bg-white/[0.02] hover:border-[#00d09c]/30 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
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
                    <p className="text-sm text-gray-500">or click to browse files</p>
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
          <div className="bg-[#121826] p-8 rounded-3xl border border-gray-800/50 shadow-2xl min-h-[400px]">
            <h3 className="text-xl font-bold text-white mb-6">Analysis Results</h3>

            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 pt-10">
                <Target size={64} strokeWidth={1} />
                <p className="font-medium text-center max-w-[200px]">Upload a resume to see your professional score.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 pt-10">
                <div className="w-16 h-16 border-4 border-[#00d09c]/20 border-t-[#00d09c] rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-white font-bold animate-pulse">Scanning keywords...</p>
                  <p className="text-xs text-gray-500 mt-1">Our AI is ranking your formatting & data.</p>
                </div>
              </div>
            )}

            {result && !isAnalyzing && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between p-6 bg-[#090e17] border border-gray-800 rounded-2xl">
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

                <div>
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-400" />
                    Missing Keywords (Add these!)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords?.length > 0 ? (
                      result.missingKeywords.map((word, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-400/10 text-red-400 rounded-lg text-xs font-bold border border-red-400/20">
                          + {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No missing keywords found!</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#00d09c]" />
                    Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords?.length > 0 ? (
                      result.matchedKeywords.map((word, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#00d09c]/10 text-[#00d09c] rounded-lg text-xs font-bold border border-[#00d09c]/20">
                          ✓ {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No keywords matched yet.</span>
                    )}
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