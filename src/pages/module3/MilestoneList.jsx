import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  TrendingUp,
  Clock,
  Flag,
  Zap,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DatePicker } from '../../components/DateTimePicker';

const MilestoneList = () => {
  const { projectId } = useParams();
  const [milestones, setMilestones] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMilestoneId, setEditMilestoneId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDate');

  // Form state with validation
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    status: 'NOT_STARTED',
    progressPercentage: 0,
    assignedToId: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const userId = localStorage.getItem('userId') || '1';

  // Fetch milestones and summary
  useEffect(() => {
    if (projectId) {
      fetchMilestones();
      fetchSummary();
    }
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/module3/milestones/project/${projectId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setMilestones(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch milestones');
      }
    } catch (err) {
      setError('Error fetching milestones: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/module3/milestones/project/${projectId}/summary`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  // Validation logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Milestone title is required';
    } else if (formData.title.trim().length > 150) {
      newErrors.title = 'Milestone title cannot exceed 150 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);

      if (due < start) {
        newErrors.dueDate = 'Due date cannot be before start date';
      }
    }

    if (formData.progressPercentage < 0 || formData.progressPercentage > 100) {
      newErrors.progressPercentage = 'Progress must be between 0 and 100';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseInt(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle date change from DatePicker
  const handleDateChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear specific field error when user selects a date
    if (formErrors[fieldName]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Handle create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const url = editMilestoneId
        ? `http://localhost:8080/api/module3/milestones/${editMilestoneId}`
        : 'http://localhost:8080/api/module3/milestones';

      const method = editMilestoneId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        userId: parseInt(userId),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(
          editMilestoneId
            ? 'Milestone updated successfully!'
            : 'Milestone created successfully!'
        );
        resetForm();
        setIsModalOpen(false);
        fetchMilestones();
        fetchSummary();
      } else {
        setError(data.message || 'Failed to save milestone');
      }
    } catch (err) {
      setError('Error saving milestone: ' + err.message);
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/module3/milestones/${id}?userId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Milestone deleted successfully!');
        fetchMilestones();
        fetchSummary();
      } else {
        setError(data.message || 'Failed to delete milestone');
      }
    } catch (err) {
      setError('Error deleting milestone: ' + err.message);
      console.error(err);
    }
  };

  // Handle edit
  const handleEdit = (milestone) => {
    setEditMilestoneId(milestone.id);
    setFormData({
      projectId: milestone.projectId,
      title: milestone.title,
      description: milestone.description || '',
      startDate: milestone.startDate,
      dueDate: milestone.dueDate,
      status: milestone.status,
      progressPercentage: milestone.progressPercentage || 0,
      assignedToId: milestone.assignedToId || null,
    });
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setEditMilestoneId(null);
    setFormData({
      projectId: projectId || '',
      title: '',
      description: '',
      startDate: '',
      dueDate: '',
      status: 'NOT_STARTED',
      progressPercentage: 0,
      assignedToId: null,
    });
    setFormErrors({});
  };

  // Filter and sort milestones
  const filteredMilestones = milestones
    .filter((m) => filterStatus === 'ALL' || m.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'progress') {
        return b.progressPercentage - a.progressPercentage;
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const getOverdueStatus = (milestone) => {
    if (milestone.status === 'COMPLETED') return null;
    const daysLeft = getDaysRemaining(milestone.dueDate);
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 7) return 'upcoming';
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090e17] via-[#121826] to-[#090e17]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-32 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white/40 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Project Milestones</h1>
                <p className="text-slate-500 font-medium">Track and manage your project milestones</p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(0,208,156,0.3)] active:scale-95"
              >
                <Plus size={20} /> New Milestone
              </button>
            </div>

            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500 text-sm font-bold mb-2">Total Milestones</div>
                  <div className="text-2xl font-black text-slate-900">{summary.totalMilestones}</div>
                </div>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500 text-sm font-bold mb-2">Completed</div>
                  <div className="text-2xl font-black text-green-400">{summary.completedMilestones}</div>
                </div>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500 text-sm font-bold mb-2">Overdue</div>
                  <div className="text-2xl font-black text-red-400">{summary.overdueMilestones}</div>
                </div>
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500 text-sm font-bold mb-2">Overall Progress</div>
                  <div className="text-2xl font-black text-indigo-600">
                    {Math.round(summary.overallProgressPercentage)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 bg-red-500/15 border border-red-500/40 text-red-400 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mx-6 mt-6 bg-green-500/15 border border-green-500/40 text-green-400 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="flex-shrink-0" />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                    filterStatus === status
                      ? 'bg-indigo-600 text-gray-900'
                      : 'bg-gray-800/40 text-slate-500 hover:bg-gray-800/60'
                  }`}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg border border-slate-300 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="progress">Sort by Progress</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Milestones List */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading milestones...</p>
            </div>
          ) : filteredMilestones.length === 0 ? (
            <div className="bg-white/40 rounded-2xl border border-dashed border-slate-200 p-20 text-center">
              <Flag className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-slate-500 font-bold mb-5 text-lg">No milestones found</p>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-lg font-black transition-all inline-flex items-center gap-2 shadow-[0_6px_20px_rgba(0,208,156,0.3)] active:scale-95"
              >
                <Plus size={18} /> Create your first milestone
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMilestones.map((milestone) => {
                const overdueStatus = getOverdueStatus(milestone);
                const daysLeft = getDaysRemaining(milestone.dueDate);

                return (
                  <div
                    key={milestone.id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-indigo-500/40 transition-all hover:shadow-[0_8px_25px_rgba(0,208,156,0.15)] overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {milestone.title}
                            </h3>
                            <span
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(
                                milestone.status
                              )}`}
                            >
                              {milestone.status.replace(/_/g, ' ')}
                            </span>

                            {overdueStatus === 'overdue' && (
                              <span className="text-xs font-bold bg-red-500/15 text-red-400 px-3 py-1.5 rounded-full border border-red-500/30">
                                Ã¢Å¡Â  Overdue
                              </span>
                            )}

                            {overdueStatus === 'upcoming' && (
                              <span className="text-xs font-bold bg-yellow-500/15 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-500/30">
                                Ã¢ÂÂ° Due Soon
                              </span>
                            )}
                          </div>

                          {milestone.description && (
                            <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                              {milestone.description}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(milestone)}
                            className="p-2 hover:bg-indigo-600/20 text-indigo-600 rounded-lg transition-all"
                            title="Edit milestone"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(milestone.id)}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                            title="Delete milestone"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500">Progress</span>
                          <span className="text-xs font-bold text-indigo-600">{milestone.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden border border-slate-200/50">
                          <div
                            className="bg-gradient-to-r from-[#00d09c] to-[#00e6ae] h-full transition-all duration-500"
                            style={{ width: `${milestone.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Timeline Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={16} className="text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-gray-500">Start Date</div>
                            <div className="font-bold text-slate-900">{formatDate(milestone.startDate)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={16} className="text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-gray-500">Due Date</div>
                            <div className="font-bold text-slate-900">{formatDate(milestone.dueDate)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <Zap size={16} className="text-indigo-600" />
                          <div>
                            <div className="text-xs font-bold text-gray-500">Days Remaining</div>
                            <div
                              className={`font-bold ${
                                daysLeft < 0
                                  ? 'text-red-400'
                                  : daysLeft <= 7
                                    ? 'text-yellow-400'
                                    : 'text-green-400'
                              }`}
                            >
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">
                {editMilestoneId ? 'Edit Milestone' : 'Create New Milestone'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-800/50 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider">
                  <span>Milestone Title</span>
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter milestone title"
                  className={`w-full bg-gray-900/50 border-2 text-slate-900 px-4 py-3 rounded-lg focus:outline-none transition-colors ${
                    formErrors.title ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-red-400 text-sm mt-2 font-bold">{formErrors.title}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  {formData.title.length}/150 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter milestone description (optional)"
                  rows="4"
                  className={`w-full bg-gray-900/50 border-2 text-slate-900 px-4 py-3 rounded-lg focus:outline-none transition-colors resize-none ${
                    formErrors.description ? 'border-red-500' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-red-400 text-sm mt-2 font-bold">{formErrors.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DatePicker
                  value={formData.startDate}
                  onChange={(value) => handleDateChange('startDate', value)}
                  label="Start Date"
                  required={true}
                  error={formErrors.startDate}
                  minDate={new Date().toISOString().split('T')[0]}
                />

                <DatePicker
                  value={formData.dueDate}
                  onChange={(value) => handleDateChange('dueDate', value)}
                  label="Due Date"
                  required={true}
                  error={formErrors.dueDate}
                  minDate={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Status and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-gray-900/50 border-2 border-slate-200 text-slate-900 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-900 font-bold text-sm mb-3 uppercase tracking-wider">
                    Progress (%)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      name="progressPercentage"
                      min="0"
                      max="100"
                      value={formData.progressPercentage}
                      onChange={handleChange}
                      className="flex-1 h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-[#00d09c]"
                    />
                    <span className="text-slate-900 font-bold text-lg min-w-[50px] text-right">
                      {formData.progressPercentage}%
                    </span>
                  </div>
                  {formErrors.progressPercentage && (
                    <p className="text-red-400 text-sm mt-2 font-bold">{formErrors.progressPercentage}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-[#00e6ae] text-gray-900 px-6 py-3 rounded-lg font-bold transition-all active:scale-95"
                >
                  {editMilestoneId ? 'Update Milestone' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneList;