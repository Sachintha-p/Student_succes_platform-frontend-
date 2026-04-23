import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
  Briefcase,
  Flag,
} from 'lucide-react';
import Sidebar from "../../components/Sidebar";

const GlobalMilestoneTimeline = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

  useEffect(() => {
    fetchGlobalTimeline();
  }, []);

  const fetchGlobalTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/module3/milestones/all-projects/timeline`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setData(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch global timeline');
      }
    } catch (err) {
      setError('Error fetching global timeline: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-500/15 text-slate-500 border-gray-500/30';
      case 'IN_PROGRESS':
        return 'bg-indigo-600/15 text-indigo-600 border-[#00d09c]/30';
      case 'COMPLETED':
        return 'bg-green-500/15 text-green-400 border-green-500/30';
      case 'ON_HOLD':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/15 text-slate-500 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="flex flex-1 pt-24">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading global timeline...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Module3Header />
        <div className="flex flex-1 pt-24">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-6 rounded-lg max-w-md flex items-center gap-3">
              <AlertCircle size={24} className="flex-shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentProject = data?.projectTimelines[selectedProjectIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 ml-72">
          {/* Header Section */}
          <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-slate-200/50 px-10 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                  Project Gantt Charts
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                  Visual timeline for all your active projects
                </p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 flex gap-8">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Projects</div>
                  <div className="text-xl font-black text-indigo-600">{data?.totalProjects}</div>
                </div>
                <div className="text-center border-l border-slate-200 pl-8">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Milestones</div>
                  <div className="text-xl font-black text-slate-900">{data?.totalMilestones}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10">
            {data?.projectTimelines.length === 0 ? (
              <div className="bg-white/40 rounded-2xl border border-dashed border-slate-200 p-20 text-center">
                <Briefcase className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-lg">No projects found to display</p>
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-8">
                {/* Project Selector (Side) */}
                <div className="col-span-12 lg:col-span-3 space-y-3">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 px-2">Select Project</h3>
                  {data?.projectTimelines.map((project, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedProjectIndex(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedProjectIndex === index
                          ? 'bg-indigo-600/10 border-[#00d09c] text-slate-900 shadow-[0_0_20px_rgba(0,208,156,0.1)]'
                          : 'bg-white/50 border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Briefcase size={18} className={selectedProjectIndex === index ? 'text-indigo-600' : 'text-gray-600'} />
                      <span className="font-bold truncate">{project.projectName}</span>
                    </button>
                  ))}
                </div>

                {/* Gantt View Area */}
                <div className="col-span-12 lg:col-span-9">
                  {currentProject && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
                      {/* Project Meta */}
                      <div className="p-8 border-b border-slate-200 bg-slate-50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">{currentProject.projectName}</h2>
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                              <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-600" /> {formatDate(currentProject.projectStartDate)}</span>
                              <ArrowRight size={14} />
                              <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-600" /> {formatDate(currentProject.projectEndDate)}</span>
                            </div>
                          </div>
                          <div className="bg-gray-900/50 px-4 py-2 rounded-lg border border-slate-200 text-indigo-600 font-black text-sm">
                            {currentProject.milestones.length} Milestones
                          </div>
                        </div>
                      </div>

                      {/* Visual Gantt Chart */}
                      <div className="p-8">
                        {currentProject.milestones.length === 0 ? (
                          <div className="py-20 text-center">
                            <Flag className="mx-auto text-gray-700 mb-4" size={48} />
                            <p className="text-gray-500 font-bold">No milestones created for this project</p>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            {currentProject.milestones.sort((a,b) => new Date(a.startDate) - new Date(b.startDate)).map((milestone, idx) => {
                              // Calculate relative positioning for simple Gantt visualization
                              const projectStart = new Date(currentProject.projectStartDate).getTime();
                              const projectEnd = new Date(currentProject.projectEndDate).getTime();
                              const totalDuration = projectEnd - projectStart;
                              
                              const milestoneStart = new Date(milestone.startDate).getTime();
                              const milestoneEnd = new Date(milestone.dueDate).getTime();
                              
                              const leftPercent = ((milestoneStart - projectStart) / totalDuration) * 100;
                              const widthPercent = ((milestoneEnd - milestoneStart) / totalDuration) * 100;
                              
                              return (
                                <div key={milestone.id} className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                      <span className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-500">{idx + 1}</span>
                                      {milestone.title}
                                    </h4>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${getStatusColor(milestone.status)}`}>
                                      {milestone.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  
                                  {/* Bar container */}
                                  <div className="h-10 bg-gray-900/50 rounded-lg relative overflow-hidden group border border-slate-200/50">
                                    {/* The Milestone Bar */}
                                    <div 
                                      className="absolute top-1 bottom-1 rounded shadow-lg transition-all group-hover:brightness-110 flex items-center px-3"
                                      style={{ 
                                        left: `${Math.max(0, leftPercent)}%`, 
                                        width: `${Math.max(5, widthPercent)}%`,
                                        background: milestone.status === 'COMPLETED' ? '#22c55e' : '#00d09c',
                                        opacity: milestone.status === 'ON_HOLD' ? 0.5 : 1
                                      }}
                                    >
                                      {/* Progress overlay */}
                                      <div 
                                        className="absolute inset-0 bg-white/20" 
                                        style={{ width: `${milestone.progressPercentage}%` }}
                                      ></div>
                                      
                                      <span className="relative z-10 text-[10px] font-black text-gray-900 truncate">
                                        {milestone.progressPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between mt-1 px-1">
                                    <span className="text-[10px] text-gray-600 font-medium">{formatDate(milestone.startDate)}</span>
                                    <span className="text-[10px] text-gray-600 font-medium">{formatDate(milestone.dueDate)}</span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Timeline Scale (Basic) */}
                            <div className="pt-8 mt-8 border-t border-slate-200/50 flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest">
                              <span>Start: {formatDate(currentProject.projectStartDate)}</span>
                              <span>Project Timeline</span>
                              <span>End: {formatDate(currentProject.projectEndDate)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GlobalMilestoneTimeline;