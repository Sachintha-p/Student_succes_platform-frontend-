# Integration Examples - Milestone Tracker

## Linking Milestones to KanbanBoard

### Example 1: Add Milestone Navigation in ProjectList

```jsx
// In ProjectList.jsx, update the project card

{projects.map((project) => (
  <div key={project.id} className="bg-[#121826] rounded-xl border border-gray-800 p-6">
    <h3 className="text-xl font-bold text-white mb-4">{project.name}</h3>
    
    <div className="flex gap-3">
      {/* Existing Kanban Button */}
      <button
        onClick={() => navigate(`/module3-projects/${project.id}`)}
        className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-4 py-2 rounded-lg font-bold transition-all"
      >
        Kanban Board
      </button>
      
      {/* NEW: Milestones Button */}
      <button
        onClick={() => navigate(`/module3-milestones/${project.id}`)}
        className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 px-4 py-2 rounded-lg font-bold transition-all"
      >
        📋 Milestones
      </button>
      
      {/* NEW: Timeline Button */}
      <button
        onClick={() => navigate(`/module3-milestones-timeline/${project.id}`)}
        className="flex-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-600/30 px-4 py-2 rounded-lg font-bold transition-all"
      >
        📊 Timeline
      </button>
    </div>
  </div>
))}
```

## Example 2: Dashboard Navigation Component

Create a reusable navigation component to switch between views:

```jsx
// ProjectNavigation.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { Kanban, Flag, BarChart3 } from 'lucide-react';

const ProjectNavigation = ({ activeTab }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const tabs = [
    { 
      id: 'kanban', 
      label: 'Kanban Board', 
      icon: Kanban,
      path: `/module3-projects/${projectId}` 
    },
    { 
      id: 'milestones', 
      label: 'Milestones', 
      icon: Flag,
      path: `/module3-milestones/${projectId}` 
    },
    { 
      id: 'timeline', 
      label: 'Timeline', 
      icon: BarChart3,
      path: `/module3-milestones-timeline/${projectId}` 
    },
  ];

  return (
    <div className="border-b border-gray-800 bg-[#121826]/40 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`px-6 py-4 font-bold flex items-center gap-2 border-b-2 transition-all ${
                  isActive
                    ? 'border-[#00d09c] text-[#00d09c]'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectNavigation;
```

## Example 3: Task-to-Milestone Connection

Link tasks in Kanban to milestones:

```jsx
// In KanbanBoard.jsx - when creating a task

const TaskForm = ({ milestone }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    milestoneId: milestone?.id || null, // Link to milestone
    dueDate: milestone?.dueDate || '', // Inherit milestone deadline
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={formData.title}
        onChange={handleChange}
        className="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-[#00d09c] outline-none transition-colors"
      />

      {/* Show associated milestone */}
      {milestone && (
        <div className="bg-[#00d09c]/10 border border-[#00d09c]/30 rounded-lg p-3">
          <p className="text-sm text-[#00d09c] font-bold">
            📌 Associated Milestone: {milestone.title}
          </p>
          <p className="text-xs text-gray-400">
            Due: {formatDate(milestone.dueDate)}
          </p>
        </div>
      )}

      <select
        name="priority"
        value={formData.priority}
        onChange={handleChange}
        className="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-[#00d09c] outline-none transition-colors"
      >
        <option value="LOW">Low Priority</option>
        <option value="MEDIUM">Medium Priority</option>
        <option value="HIGH">High Priority</option>
        <option value="URGENT">Urgent</option>
      </select>

      <textarea
        name="description"
        placeholder="Task description"
        value={formData.description}
        onChange={handleChange}
        className="w-full bg-gray-900/50 border border-gray-800 text-white px-4 py-3 rounded-lg focus:border-[#00d09c] outline-none transition-colors resize-none"
        rows="3"
      />

      <button
        type="submit"
        className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-3 rounded-lg font-bold transition-all"
      >
        Create Task
      </button>
    </form>
  );
};
```

## Example 4: Progress Sync - Milestone and Tasks

Automatically update milestone progress based on task completion:

```jsx
// Utils: progressUtils.js

export const calculateMilestoneProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(
    (task) => task.status === 'DONE'
  ).length;
  
  return Math.round((completedTasks / tasks.length) * 100);
};

// In KanbanBoard.jsx - after updating task status

const handleTaskStatusChange = async (taskId, newStatus) => {
  try {
    // Update task in backend
    await updateTask(taskId, { status: newStatus });
    
    // Get updated milestone
    const milestone = await getMilestone(milestoneId);
    const tasks = await getTasksByMilestone(milestoneId);
    
    // Calculate new progress
    const newProgress = calculateMilestoneProgress(tasks);
    
    // Update milestone progress if changed
    if (newProgress !== milestone.progressPercentage) {
      await updateMilestoneProgress(milestoneId, newProgress);
      setMilestone({ ...milestone, progressPercentage: newProgress });
    }
    
    // Show notification
    showSuccess(`Task updated! Milestone progress: ${newProgress}%`);
  } catch (error) {
    showError('Failed to update task');
  }
};
```

## Example 5: Milestone Status Badge in Tasks

Display milestone association in task cards:

```jsx
// In KanbanBoard.jsx - Task card component

const TaskCard = ({ task, milestone }) => {
  return (
    <div className="bg-[#090e17] rounded-xl p-4 border border-gray-800 hover:border-[#00d09c]/40 transition-all">
      <h4 className="font-bold text-white mb-2">{task.title}</h4>

      {/* Milestone Badge */}
      {milestone && (
        <div
          onClick={() => navigate(`/module3-milestones/${milestone.projectId}`)}
          className="mb-3 bg-[#00d09c]/15 border border-[#00d09c]/30 rounded-lg p-2 cursor-pointer hover:bg-[#00d09c]/25 transition-colors"
        >
          <p className="text-xs font-bold text-[#00d09c]">
            📌 {milestone.title}
          </p>
          <p className="text-xs text-gray-400">
            Progress: {milestone.progressPercentage}%
          </p>
        </div>
      )}

      {task.description && (
        <p className="text-gray-400 text-xs mb-2">{task.description}</p>
      )}

      {/* Priority and Due Date */}
      <div className="flex gap-2 flex-wrap">
        <span className={`text-xs font-bold px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>

        {task.dueDate && (
          <span className="text-xs font-bold text-gray-400">
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
};
```

## Example 6: Module 3 Dashboard - Unified View

Create a dashboard showing all three views:

```jsx
// Module3DashboardHome.jsx - New component

import {
  ProjectList,
  KanbanBoard,
  MilestoneList,
  MilestoneTimeline,
} from './pages/module3';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';

const Module3Dashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090e17] via-[#121826] to-[#090e17]">
      {/* Tab Navigation */}
      <div className="border-b border-gray-800 bg-[#121826]/40 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'projects', label: 'Projects' },
              { id: 'tasks', label: 'Tasks (Kanban)' },
              { id: 'milestones', label: 'Milestones' },
              { id: 'timeline', label: 'Timeline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[#00d09c] text-[#00d09c]'
                    : 'border-transparent text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'projects' && <ProjectList />}
        {activeTab === 'tasks' && <KanbanBoard />}
        {activeTab === 'milestones' && <MilestoneList />}
        {activeTab === 'timeline' && <MilestoneTimeline />}
      </div>
    </div>
  );
};

export default Module3Dashboard;
```

## Example 7: API Usage - Complete Workflow

```jsx
// Complete workflow example

const MilestoneWorkflow = () => {
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);

  // 1. Load project
  const loadProject = async (projectId) => {
    const response = await fetch(`/api/module3/projects/${projectId}`);
    const data = await response.json();
    setProject(data.data);
  };

  // 2. Load milestones
  const loadMilestones = async (projectId) => {
    const response = await fetch(`/api/module3/milestones/project/${projectId}`);
    const data = await response.json();
    setMilestones(data.data);
  };

  // 3. Create milestone
  const createMilestone = async (milestoneData) => {
    const response = await fetch('/api/module3/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestoneData),
    });
    const data = await response.json();
    setMilestones([...milestones, data.data]);
  };

  // 4. Create task under milestone
  const createTask = async (taskData) => {
    const response = await fetch('/api/module3/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    setTasks([...tasks, data.data]);
  };

  // 5. Update milestone progress
  const updateMilestoneProgress = async (milestoneId, progress) => {
    const response = await fetch(
      `/api/module3/milestones/${milestoneId}/progress`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressPercentage: progress }),
      }
    );
    const data = await response.json();
    const updated = milestones.map((m) =>
      m.id === milestoneId ? data.data : m
    );
    setMilestones(updated);
  };

  return (
    <div className="p-8">
      <h1>Project Milestone Workflow</h1>
      {/* Render UI */}
    </div>
  );
};
```

## Color Reference for Integration

When adding new buttons/badges for milestone features:

```jsx
// For milestone action buttons
className="bg-[#00d09c]/20 hover:bg-[#00d09c]/40 text-[#00d09c] border border-[#00d09c]/30"

// For milestone status badges
className="bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/30"

// Alternative: Using status-specific colors
const getStatusColorClass = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'bg-[#00d09c]/15 text-[#00d09c] border border-[#00d09c]/30';
    case 'COMPLETED':
      return 'bg-green-500/15 text-green-400 border border-green-500/30';
    case 'ON_HOLD':
      return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30';
    default:
      return 'bg-gray-500/15 text-gray-400 border border-gray-500/30';
  }
};
```

## Testing Integration

```javascript
// Test checklist for integrated features

✅ Create milestone from ProjectList
✅ Navigate to MilestoneList from project
✅ View timeline from project
✅ Link task to milestone
✅ Milestone progress updates when task completed
✅ Task shows milestone badge
✅ Colors match brand (teal #00d09c)
✅ All validations work across components
✅ Error handling working properly
✅ Mobile responsive view works
✅ Tab navigation smooth
✅ Data persists after navigation
✅ Real-time updates visible
✅ Confirmation dialogs appear
```
