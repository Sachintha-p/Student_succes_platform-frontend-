import React, { useState } from 'react';
import { 
  X, CheckCircle2, Award, 
  ChevronRight, ChevronLeft, Download, RefreshCcw 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const QuizModal = ({ quiz, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const currentQuestion = quiz.questions[currentIdx];
  const isLast = currentIdx === quiz.questions.length - 1;

  const handleSelect = (idx) => {
    if (showResults) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    return answers.reduce((acc, ans, idx) => {
      return ans === quiz.questions[idx].correctAnswerIndex ? acc + 1 : acc;
    }, 0);
  };

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      const score = calculateScore();
      
      doc.setFontSize(20);
      doc.text('Quiz Results Report', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Final Score: ${score} / ${quiz.questions.length}`, 20, 35);
      doc.text('--------------------------------------------------', 20, 42);

      let yPos = 50;
      quiz.questions.forEach((q, i) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}. ${q.question.substring(0, 80)}...`, 20, yPos);
        yPos += 7;
        
        doc.setFont("helvetica", "normal");
        doc.text(`Correct Answer: ${q.options[q.correctAnswerIndex]}`, 25, yPos);
        yPos += 7;
        
        const userAns = answers[i] !== null ? q.options[answers[i]] : 'Not Answered';
        doc.text(`Your Answer: ${userAns}`, 25, yPos);
        yPos += 15;
      });

      // Robust download mechanism
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Quiz_Report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Could not generate PDF. Please try again.");
    }
  };

  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
        
        {/* Header - Fixed */}
        <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-white z-20">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <Award size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Assessment</h3>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-[0.3em] mt-1.5">
                {showResults ? 'Post-Assessment Strategic Review' : `Operational Progress: Question ${currentIdx + 1} of ${quiz.questions.length}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-[1.5rem] text-slate-400 hover:text-slate-900 transition-all">
            <X size={32} />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto px-12 py-14 bg-slate-50/40 custom-scrollbar">
          {!showResults ? (
            <div className="max-w-4xl mx-auto animate-in slide-in-from-right-12 duration-500">
              <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm mb-12 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] mb-6 block">Current Assessment Point</span>
                <h4 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                  {currentQuestion.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`group flex items-center p-7 rounded-[2.5rem] border-2 transition-all text-left ${
                      answers[currentIdx] === i 
                        ? 'bg-indigo-50 border-indigo-600 shadow-2xl shadow-indigo-100' 
                        : 'bg-white border-white hover:border-indigo-100 hover:shadow-xl'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black mr-8 transition-all ${
                      answers[currentIdx] === i ? 'bg-indigo-600 text-white rotate-6 scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-xl font-bold ${answers[currentIdx] === i ? 'text-indigo-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center pb-24">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 mb-12 animate-bounce">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">Assessment Finalized</h2>
              <p className="text-2xl text-slate-500 font-medium mb-14 max-w-2xl mx-auto">
                Knowledge synthesis complete. You achieved <span className="text-indigo-600 font-black underline decoration-4 underline-offset-8">{score}</span> out of <span className="font-black text-slate-900">{quiz.questions.length}</span> research points.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24">
                <button 
                  onClick={exportToPdf}
                  className="flex-1 max-w-[300px] flex items-center justify-center gap-4 bg-slate-900 text-white py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                  <Download size={20} /> Download Report (PDF)
                </button>
                <button 
                  onClick={() => {
                    setCurrentIdx(0);
                    setAnswers(Array(quiz.questions.length).fill(null));
                    setShowResults(false);
                  }}
                  className="flex-1 max-w-[300px] flex items-center justify-center gap-4 bg-white border-2 border-slate-200 text-slate-900 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  <RefreshCcw size={20} /> Restart Analysis
                </button>
              </div>

              <div className="space-y-10 text-left">
                <div className="flex items-center gap-6 mb-12">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Granular Data Review</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>
                
                {quiz.questions.map((q, idx) => (
                  <div key={idx} className={`p-10 rounded-[3rem] border-2 transition-all ${answers[idx] === q.correctAnswerIndex ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-50' : 'bg-white border-red-100 shadow-xl shadow-red-50'}`}>
                    <div className="flex gap-8">
                      <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 text-lg font-black ${answers[idx] === q.correctAnswerIndex ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-2xl font-extrabold text-slate-900 mb-6 leading-tight">{q.question}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                           <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                             <span className="text-[10px] font-black text-emerald-600 uppercase block mb-2 tracking-widest">Validated Solution</span>
                             <p className="text-lg font-bold text-emerald-700">{q.options[q.correctAnswerIndex]}</p>
                           </div>
                           <div className={`p-6 rounded-2xl border ${answers[idx] === q.correctAnswerIndex ? 'bg-emerald-50/30 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                             <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Student Response</span>
                             <p className={`text-lg font-bold ${answers[idx] === q.correctAnswerIndex ? 'text-emerald-700' : 'text-red-700'}`}>
                                {answers[idx] !== null ? q.options[answers[idx]] : 'Unresponsive'}
                             </p>
                           </div>
                        </div>
                        <div className="p-7 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-400/30"></div>
                          <span className="text-[10px] font-black text-indigo-500 uppercase block mb-3 tracking-widest">Strategic Insight & Logic</span>
                          <p className="text-base text-slate-600 font-medium leading-relaxed italic">"{q.explanation}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer - Fixed */}
        <div className="px-12 py-10 border-t border-slate-100 flex justify-between items-center bg-white z-20">
          {!showResults ? (
            <>
              <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(p => p - 1)}
                className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all px-6 py-3 rounded-xl hover:bg-slate-50"
              >
                <ChevronLeft size={20} /> Previous
              </button>
              
              <div className="hidden lg:flex gap-4">
                {quiz.questions.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === currentIdx ? 'bg-indigo-600 w-16' : answers[i] !== null ? 'bg-indigo-200 w-6' : 'bg-slate-100 w-6'}`} />
                ))}
              </div>

              <button 
                onClick={() => {
                  if (isLast) setShowResults(true);
                  else setCurrentIdx(p => p + 1);
                }}
                className={`flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                  isLast ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-indigo-600'
                }`}
              >
                {isLast ? 'Complete Assessment' : 'Next Step'} <ChevronRight size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl"
            >
              Close Strategic Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
