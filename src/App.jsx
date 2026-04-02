import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/module2/Login';
import AdminJobListings from './pages/module2/AdminJobListings'; 
import AtsChecker from './pages/module2/AtsChecker'; 
import StudentDashboard from './pages/module2/StudentDashboard';
import StudentJobListings from './pages/module2/StudentJobListings';
import { EventList, CreateEvent, MyEvents, MeetingList, CreateMeeting, MeetingDetails, ProjectList, KanbanBoard, MilestoneList, MilestoneTimeline, GlobalMilestoneTimeline, Module3Dashboard, Module3DashboardLogin } from './pages/module3';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminJobListings />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-job-listings" element={<StudentJobListings />} />
        <Route path="/ats-checker" element={<AtsChecker />} />
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