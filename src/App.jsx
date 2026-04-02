import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/module2/Login';
import AdminJobListings from './pages/module2/AdminJobListings'; 
import AtsChecker from './pages/module2/AtsChecker'; 
import StudentDashboard from './pages/module2/StudentDashboard';
import StudentJobListings from './pages/module2/StudentJobListings';
import AiChatPage from './pages/module4/AiChatPage';
import KnowledgeHubPage from './pages/module4/KnowledgeHubPage';
import AdminKnowledgeHub from './pages/module4/AdminKnowledgeHub';
import AdminAiAssistant from './pages/module4/AdminAiAssistant';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminJobListings />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-job-listings" element={<StudentJobListings />} />
        <Route path="/ats-checker" element={<AtsChecker />} />
        <Route path="/ai-assistant" element={<AiChatPage />} />
        <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
        <Route path="/admin-knowledge-hub" element={<AdminKnowledgeHub />} />
        <Route path="/admin-ai-assistant" element={<AdminAiAssistant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;