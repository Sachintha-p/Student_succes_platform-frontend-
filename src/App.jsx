import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/module2/Login';
import AdminJobListings from './pages/module2/AdminJobListings'; 
import AtsChecker from './pages/module2/AtsChecker'; 
import StudentDashboard from './pages/module2/StudentDashboard';
import StudentJobListings from './pages/module2/StudentJobListings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminJobListings />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-job-listings" element={<StudentJobListings />} />
        <Route path="/ats-checker" element={<AtsChecker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;