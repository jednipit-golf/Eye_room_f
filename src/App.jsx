import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyLeaves from './pages/MyLeaves';
import NewLeave from './pages/NewLeave';
import ManageLeaves from './pages/ManageLeaves';
import Members from './pages/Members';
import MemberLeaves from './pages/MemberLeaves';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }
  
  return user ? children : <Navigate to="/" />;
};

// Main App
function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-leaves" element={<ProtectedRoute><MyLeaves /></ProtectedRoute>} />
          <Route path="/new-leave" element={<ProtectedRoute><NewLeave /></ProtectedRoute>} />
          <Route path="/manage-leaves" element={<ProtectedRoute><ManageLeaves /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/members/:memberId" element={<ProtectedRoute><MemberLeaves /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
