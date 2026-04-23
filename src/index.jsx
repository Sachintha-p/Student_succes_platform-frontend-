// Dashboard Pages
export { default as Module3Dashboard } from './pages/module3/Module3Dashboard';
export { default as Module3DashboardLogin } from './pages/module3/Module3DashboardLogin';

// Events Pages
export { default as EventList } from './pages/module3/EventList';
export { default as CreateEvent } from './pages/module3/CreateEvent';
export { default as MyEvents } from './pages/module3/MyEvents';

// Meetings Pages
export { default as MeetingList } from './pages/module3/MeetingList';
export { default as CreateMeeting } from './pages/module3/CreateMeeting';
export { default as MeetingDetails } from './pages/module3/MeetingDetails';

// Projects Pages
export { default as ProjectList } from './pages/module3/ProjectList';
export { default as KanbanBoard } from './pages/module3/KanbanBoard';

// Milestones Pages
export { default as MilestoneList } from './pages/module3/MilestoneList';
export { default as MilestoneTimeline } from './pages/module3/MilestoneTimeline';
export { default as GlobalMilestoneTimeline } from './pages/module3/GlobalMilestoneTimeline';

/** * NOTE: If you have a 'components' folder inside module3, keep this. 
 * If the DatePicker is also in the root of module3, change this to './DateTimePicker'
 */
export { DatePicker, TimePicker } from "./components/DateTimePicker";