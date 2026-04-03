import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar';
import DashboardAccessButton from '../../../../components/DashboardAccessButton';
import { ChevronLeft, Plus, Loader2, AlertCircle, Trash2, Edit2, Flag, Calendar } from 'lucide-react';
import { DatePicker } from '../../components/DateTimePicker';

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [project, setProject] = useState(null);
  const [kanbanData, setKanbanData] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editTaskId, setEditTaskId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  });

  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project details
      const projectRes = await fetch(`http://localhost:8080/api/module3/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData.data);
      }

      // Fetch kanban board
      const kanbanRes = await fetch(`http://localhost:8080/api/module3/tasks/kanban/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (kanbanRes.ok) {
        const kanbanData = await kanbanRes.json();
        setKanbanData({
          todo: kanbanData.data?.todo || [],
          inProgress: kanbanData.data?.inProgress || [],
          done: kanbanData.data?.done || []
        });
      } else {
        setError('Failed to load tasks');
      }
    } catch (err) {
      setError('Error loading project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Task title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Task title must not exceed 200 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (dueDate < new Date()) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
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

  const handleDateChange = (value) => {
    setFormData(prev => ({
      ...prev,
      dueDate: value
    }));
    if (formErrors.dueDate) {
      setFormErrors(prev => ({
        ...prev,
        dueDate: ''
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
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        projectId: parseInt(projectId),
        status: 'TODO'
      };

      const method = editTaskId ? 'PUT' : 'POST';
      const url = editTaskId 
        ? `http://localhost:8080/api/module3/tasks/${editTaskId}`
        : 'http://localhost:8080/api/module3/tasks';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditTaskId(null);
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: ''
        });
        fetchProjectAndTasks();
      } else {
        setFormErrors({ submit: 'Failed to save task' });
      }
    } catch (err) {
      setFormErrors({ submit: 'Error saving task' });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/module3/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchProjectAndTasks();
      } else {
        setError('Failed to delete task');
      }
    } catch (err) {
      setError('Error deleting task');
      console.error(err);
    }
  };

  const handleDragStart = (e, task, sourceStatus) => {
    setDraggedTask({ task, sourceStatus });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    const { task, sourceStatus } = draggedTask;

    if (sourceStatus === targetStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/module3/tasks/${task.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: targetStatus.toUpperCase() })
      });

      if (response.ok) {
        fetchProjectAndTasks();
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    } finally {
      setDraggedTask(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const isTaskOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const KanbanColumn = ({ title, status, tasks }) => (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, status)}
      className="bg-[#121826] rounded-2xl border border-gray-800 p-6 flex flex-col min-h-[650px] flex-1 transition-all hover:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
          <span className="bg-[#00d09c]/15 text-[#00d09c] px-3 py-1.5 rounded-full text-[11px] font-black border border-[#00d09c]/30">
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {tasks.length === 0 ? (
          <div className="h-32 flex items-center justify-center bg-[#090e17] rounded-lg border border-dashed border-gray-800">
            <p className="text-gray-600 text-sm font-bold">No tasks yet</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task, status)}
              className="bg-[#090e17] rounded-xl p-4 border border-gray-800 hover:border-[#00d09c]/40 hover:shadow-[0_8px_25px_rgba(0,208,156,0.15)] cursor-move transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm line-clamp-2 group-hover:text-[#00d09c] transition-colors">
                    {task.title}
                  </h4>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={() => {
                      setFormData({
                        title: task.title,
                        description: task.description || '',
                        priority: task.priority,
                        dueDate: task.dueDate || ''
                      });
                      setEditTaskId(task.id);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-[#00d09c]/20 text-[#00d09c] rounded-lg transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.isOverdue && (
                    <span className="text-[10px] font-bold bg-red-500/15 text-red-400 px-2.5 py-1.5 rounded-full border border-red-500/30">
                      ⚠ Overdue
                    </span>
                  )}
                  {task.isUpcoming && (
                    <span className="text-[10px] font-bold bg-blue-500/15 text-blue-400 px-2.5 py-1.5 rounded-full border border-blue-500/30">
                      📅 Upcoming
                    </span>
                  )}
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                    <Calendar size={14} className="text-gray-600" />
                    {formatDate(task.dueDate)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#090e17] text-gray-300 font-sans min-h-screen">
      <DashboardAccessButton />
      
      <div className="flex">
        <Sidebar />

      <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/module3-projects')}
                className="p-2.5 bg-[#121826] border border-gray-800 rounded-lg text-gray-400 hover:text-[#00d09c] hover:border-[#00d09c] transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                  {project?.name || 'Loading...'}
                </h1>
                <p className="text-gray-400 text-lg font-medium">Manage project tasks and progress</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-8 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-[0_8px_20px_rgba(0,208,156,0.3)] active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> Add Task
            </button>
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
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Loading tasks...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <KanbanColumn title="To Do" status="todo" tasks={kanbanData.todo} />
              <KanbanColumn title="In Progress" status="inProgress" tasks={kanbanData.inProgress} />
              <KanbanColumn title="Done" status="done" tasks={kanbanData.done} />
            </div>
          </>
        )}

        {/* Create/Edit Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121826] rounded-[2rem] border border-gray-800 max-w-md w-full p-8 shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-6">
                {editTaskId ? 'Edit Task' : 'Create New Task'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Task Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter task title"
                    className={`w-full bg-[#090e17] border rounded-xl py-2.5 px-4 text-white placeholder:text-gray-700 focus:outline-none transition-all ${
                      formErrors.title 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-800 focus:border-[#00d09c]'
                    }`}
                  />
                  {formErrors.title && <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter task description"
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
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">Priority *</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full bg-[#090e17] border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[#00d09c] transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <DatePicker
                      value={formData.dueDate}
                      onChange={handleDateChange}
                      label="Due Date"
                      error={formErrors.dueDate}
                      minDate={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {formErrors.submit && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                    {formErrors.submit}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditTaskId(null);
                      setFormData({
                        title: '',
                        description: '',
                        priority: 'MEDIUM',
                        dueDate: ''
                      });
                    }}
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
                        Saving...
                      </>
                    ) : (
                      editTaskId ? 'Update Task' : 'Create Task'
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

export default KanbanBoard;
