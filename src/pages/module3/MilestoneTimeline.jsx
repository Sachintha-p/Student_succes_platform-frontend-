import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useParams } from 'react-router-dom';

const MilestoneTimeline = () => {
  const { projectId } = useParams();
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchTimeline();
    }
  }, [projectId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/module3/milestones/project/${projectId}/timeline`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTimeline(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch timeline');
      }
    } catch (err) {
      setError('Error fetching timeline: ' + err.message);
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

  const getMonthYear = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getOverdueStatus = (milestone) => {
    if (milestone.status === 'COMPLETED') return null;
    const daysLeft = getDaysRemaining(milestone.dueDate);
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 7) return 'upcoming';
    return null;
  };

  // Group milestones by month
  const groupedMilestones = React.useMemo(() => {
    if (!timeline?.milestones) return {};
    
    const groups = {};
    timeline.milestones.forEach((milestone) => {
      const monthYear = getMonthYear(milestone.startDate);
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(milestone);
    });
    
    return groups;
  }, [timeline]);

  const sortedMonths = React.useMemo(() => {
    return Object.keys(groupedMilestones).sort(
      (a, b) => new Date(a) - new Date(b)
    );
  }, [groupedMilestones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090e17] via-[#121826] to-[#090e17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090e17] via-[#121826] to-[#090e17] flex items-center justify-center p-6">
        <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-6 rounded-lg max-w-md flex items-center gap-3">
          <AlertCircle size={24} className="flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090e17] via-[#121826] to-[#090e17]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-32 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-600/15 rounded-lg border border-[#00d09c]/30">
                <Calendar className="text-indigo-600" size={28} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Project Timeline</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  {timeline?.projectName}
                </p>
              </div>
            </div>

            {/* Project Date Range */}
            {timeline && (
              <div className="flex items-center gap-4 text-sm font-bold text-slate-600 bg-slate-100 p-4 rounded-lg">
                <div>{formatDate(timeline.projectStartDate)}</div>
                <ArrowRight size={18} className="text-indigo-600" />
                <div>{formatDate(timeline.projectEndDate)}</div>
                <div className="ml-auto text-indigo-600">
                  {timeline.milestones?.length || 0} Milestones
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {sortedMonths.length === 0 ? (
            <div className="bg-white/40 rounded-2xl border border-dashed border-slate-200 p-20 text-center">
              <Calendar className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-slate-500 font-bold text-lg">No milestones in timeline</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sortedMonths.map((month, monthIndex) => (
                <div key={month} className="relative">
                  {/* Month Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex-shrink-0">
                      <div className="bg-indigo-600 text-gray-900 px-4 py-2 rounded-lg font-black">
                        {month}
                      </div>
                    </div>
                    <div className="flex-grow h-0.5 bg-gradient-to-r from-[#00d09c]/50 to-transparent"></div>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative pl-8">
                    {/* Vertical Line */}
                    <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00d09c]/50 to-[#00d09c]/10"></div>

                    {/* Milestones */}
                    <div className="space-y-6">
                      {groupedMilestones[month].map((milestone, index) => {
                        const overdueStatus = getOverdueStatus(milestone);
                        const daysLeft = getDaysRemaining(milestone.dueDate);

                        return (
                          <div
                            key={milestone.id}
                            className="relative group"
                            onMouseEnter={() => setSelectedMilestone(milestone.id)}
                            onMouseLeave={() => setSelectedMilestone(null)}
                          >
                            {/* Timeline Dot */}
                            <div className="absolute -left-6 top-0 w-5 h-5 rounded-full border-4 border-[#121826] bg-indigo-600 group-hover:scale-125 transition-transform flex items-center justify-center">
                              {milestone.status === 'COMPLETED' && (
                                <CheckCircle size={16} className="text-[#121826]" />
                              )}
                            </div>

                            {/* Card */}
                            <div
                              className={`bg-white rounded-xl border transition-all cursor-pointer ${
                                selectedMilestone === milestone.id
                                  ? 'border-[#00d09c]/80 shadow-[0_8px_25px_rgba(0,208,156,0.2)]'
                                  : 'border-slate-200 hover:border-indigo-500/40'
                              }`}
                            >
                              <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                      {milestone.title}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(
                                          milestone.status
                                        )}`}
                                      >
                                        {milestone.status.replace(/_/g, ' ')}
                                      </span>

                                      {overdueStatus === 'overdue' && (
                                        <span className="text-xs font-bold bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full border border-red-500/30">
                                          ⚠ Overdue
                                        </span>
                                      )}

                                      {overdueStatus === 'upcoming' && (
                                        <span className="text-xs font-bold bg-yellow-500/15 text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-500/30">
                                          ⏰ Due Soon
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {milestone.description && (
                                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                                    {milestone.description}
                                  </p>
                                )}

                                {/* Progress Bar */}
                                <div className="mb-4">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500">Progress</span>
                                    <span className="text-xs font-bold text-indigo-600">
                                      {milestone.progressPercentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="bg-indigo-600 h-full transition-all"
                                      style={{ width: `${milestone.progressPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Timeline Dates */}
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-slate-200">
                                    <div className="text-gray-500 font-bold mb-1">Start</div>
                                    <div className="text-slate-900 font-bold">
                                      {formatDate(milestone.startDate)}
                                    </div>
                                  </div>

                                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-slate-200">
                                    <div className="text-gray-500 font-bold mb-1">Due</div>
                                    <div className="text-slate-900 font-bold">
                                      {formatDate(milestone.dueDate)}
                                    </div>
                                  </div>

                                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-slate-200">
                                    <div className="text-gray-500 font-bold mb-1">
                                      {daysLeft < 0 ? 'Overdue' : 'Days Left'}
                                    </div>
                                    <div
                                      className={`font-bold ${
                                        daysLeft < 0
                                          ? 'text-red-400'
                                          : daysLeft <= 7
                                            ? 'text-yellow-400'
                                            : 'text-green-400'
                                      }`}
                                    >
                                      {daysLeft < 0
                                        ? Math.abs(daysLeft)
                                        : daysLeft}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneTimeline;