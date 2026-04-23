import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/module4/Landing';
import Login from './pages/module2/Login';
import AdminJobListings from './pages/module2/AdminJobListings';
import AtsChecker from './pages/module2/AtsChecker';
import StudentDashboard from './pages/module1/StudentDashboard'; 
import StudentJobListings from './pages/module2/StudentJobListings';
import MyGroups from './pages/module1/MyGroups';
import Invitations from './pages/module1/Invitations';
import JoinRequests from './pages/module1/JoinRequests';
import SmartMatch from './pages/module1/SmartMatch';
import AdminjobApplications from './pages/module2/AdminJobApplications';

// Module 4
import AiChatPage from './pages/module4/AiChatPage';
import KnowledgeHubPage from './pages/module4/KnowledgeHubPage';
import AdminKnowledgeHub from './pages/module4/AdminKnowledgeHub';
import AdminAiAssistant from './pages/module4/AdminAiAssistant';

// Module 3 Imports - Now using the fixed index.jsx
import {
  EventList, CreateEvent, MyEvents, MeetingList, CreateMeeting,
  MeetingDetails, ProjectList, KanbanBoard, MilestoneList,
  MilestoneTimeline, GlobalMilestoneTimeline, Module3Dashboard,
  Module3DashboardLogin
} from '.';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Module 2 */}
        <Route path="/admin-job-dashboard" element={<AdminJobListings />} />
        <Route path="/admin-job-applications" element={<AdminjobApplications />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-job-listings" element={<StudentJobListings />} />
        <Route path="/ats-checker" element={<AtsChecker />} />

        {/* Module 1 */}
        <Route path="/my-groups" element={<MyGroups />} />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/join-requests" element={<JoinRequests />} />
        <Route path="/smart-match" element={<SmartMatch />} />

        {/* Module 4 */}
        <Route path="/ai-assistant" element={<AiChatPage />} />
        <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
        <Route path="/admin-knowledge-hub" element={<AdminKnowledgeHub />} />
        <Route path="/admin-ai-assistant" element={<AdminAiAssistant />} />

        {/* Module 3 */}
        <Route path="/module3" element={<EventList />} />
        <Route path="/module3/create-event" element={<CreateEvent />} />
        <Route path="/module3/my-events" element={<MyEvents />} />
        <Route path="/module3-meetings" element={<MeetingList />} />
        <Route path="/module3-meetings/create" element={<CreateMeeting />} />
        <Route path="/module3-meetings/:meetingId" element={<MeetingDetails />} />
        <Route path="/module3-projects" element={<ProjectList />} />
        <Route path="/module3-projects/:projectId" element={<KanbanBoard />} />
        <Route path="/module3-milestones" element={<GlobalMilestoneTimeline />} />
        <Route path="/module3-milestones/:projectId" element={<MilestoneList />} />
        <Route path="/module3-milestones-timeline/:projectId" element={<MilestoneTimeline />} />
        <Route path="/module3-dashboard-login" element={<Module3DashboardLogin />} />
        <Route path="/module3-dashboard" element={<Module3Dashboard />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;