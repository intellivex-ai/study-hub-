import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Planner from './pages/Planner';
import ProgressChart from './components/ProgressChart';
import ParentDashboard from './pages/ParentDashboard';
import ImpactView from './pages/ImpactView';
import './App.css';

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="planner" element={<Planner />} />
          <Route path="progress" element={<ProgressChart />} />
          <Route path="mentor" element={<ParentDashboard />} />
          <Route path="impact" element={<ImpactView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
