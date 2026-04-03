import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import DashboardAccessButton from '../../components/DashboardAccessButton';
import { Briefcase, Plus, ChevronRight, Loader2, Calendar, Users, AlertCircle, BarChart2 } from 'lucide-react';
import { DatePicker } from './DateTimePicker';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teamId: '1'
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:8080/api/module3/projects/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data.data) ? data.data : []);
      } else {
        setError('Failed to load projects');
      }
    } catch (err) {
      setError('Error loading projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    } else if (formData.name.trim().length > 150) {
      newErrors.name = 'Project name must not exceed 150 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        teamId: parseInt(formData.teamId)
      };

      const response = await fetch('http://localhost:8080/api/module3/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          teamId: '1'
        });
        fetchProjects();
      } else {
        setFormErrors({ submit: 'Failed to create project' });
      }
    } catch (err) {
      setFormErrors({ submit: 'Error creating project' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="bg-[#090e17] text-gray-300 font-sans min-h-screen">
      <DashboardAccessButton />
      
      <div className="flex">
        <Sidebar />

      <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Projects & Milestones
              </h1>
              <p className="text-gray-400 text-lg font-medium">
                Manage and track your project progress with our task management system
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/module3-milestones')}
                className="bg-[#121826] hover:bg-[#1a2230] text-[#00d09c] border border-gray-800 px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
              >
                <BarChart2 size={20} /> Visual Timeline
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(0,208,156,0.3)] active:scale-95 whitespace-nowrap"
              >
                <Plus size={20} /> New Project
              </button>
            </div>
          </div>
        </div>

        <div className="p-10">

        {error && (
          <div className="mb-10 bg-red-500/15 border border-red-500/40 text-red-400 p-5 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#00d09c]" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#121826]/40 rounded-2xl border border-dashed border-gray-800 p-20 text-center">
            <Briefcase className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400 font-bold mb-5 text-lg">No projects yet</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-lg font-black transition-all inline-flex items-center gap-2 shadow-[0_6px_20px_rgba(0,208,156,0.3)] active:scale-95"
            >
              <Plus size={18} /> Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const daysLeft = getDaysRemaining(project.endDate);
              const isOverdue = daysLeft < 0;
              
              return (
                <div
                  key={project.id}
                  className="bg-[#121826] rounded-2xl border border-gray-800 hover:border-[#00d09c]/50 p-6 cursor-pointer transition-all group shadow-lg overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 bg-[#00d09c]/15 rounded-lg group-hover:bg-[#00d09c]/25 transition-all">
                        <Briefcase className="text-[#00d09c]" size={22} />
                      </div>
                      <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider border ${
                        isOverdue
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : daysLeft <= 7
                          ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                          : 'bg-[#00d09c]/15 text-[#00d09c] border-[#00d09c]/30'
                      }`}>
                        {isOverdue ? '⚠ Overdue' : daysLeft <= 0 ? 'Due Today' : `${daysLeft}d left`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#00d09c] transition-colors line-clamp-2">
                      {project.name}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>

                    <div className="space-y-2.5 mb-5 pt-4 border-t border-gray-800/50">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Calendar size={16} className="text-[#00d09c] flex-shrink-0" />
                        <span className="font-medium">{formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Users size={16} className="text-[#00d09c] flex-shrink-0" />
                        <span className="font-medium">Team {project.teamId}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/module3-projects/${project.id}`)}
                      className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(0,208,156,0.2)]"
                    >
                      View Kanban <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121826] rounded-[2rem] border border-gray-800 max-w-md w-full p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-6">Create New Project</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    className={`w-full bg-[#090e17] border rounded-xl py-2.5 px-4 text-white placeholder:text-gray-700 focus:outline-none transition-all ${
                      formErrors.name 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-800 focus:border-[#00d09c]'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter project description"
                    rows="3"
                    className={`w-full bg-[#090e17] border rounded-xl py-2.5 px-4 text-white placeholder:text-gray-700 focus:outline-none transition-all resize-none ${
                      formErrors.description 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-800 focus:border-[#00d09c]'
                    }`}
                  />
                  {formErrors.description && <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    value={formData.startDate}
                    onChange={(value) => handleDateChange('startDate', value)}
                    label="Start Date"
                    required={true}
                    error={formErrors.startDate}
                    minDate={new Date().toISOString().split('T')[0]}
                  />

                  <DatePicker
                    value={formData.endDate}
                    onChange={(value) => handleDateChange('endDate', value)}
                    label="End Date"
                    required={true}
                    error={formErrors.endDate}
                    minDate={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>

                {formErrors.submit && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                    {formErrors.submit}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-800/50 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
    </div>
  );
};

export default ProjectList;
