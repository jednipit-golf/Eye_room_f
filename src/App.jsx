import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyLeaves from './pages/MyLeaves';
import NewLeave from './pages/NewLeave';
import ManageLeaves from './pages/ManageLeaves';
import Members from './pages/Members';
import MemberLeaves from './pages/MemberLeaves';
import ManageUsers from './pages/ManageUsers';
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
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <Dashboard />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-leaves" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <MyLeaves />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/new-leave" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <NewLeave />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manage-leaves" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <ManageLeaves />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/members" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <Members />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/members/:memberId" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <MemberLeaves />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/manage-users" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container">
                <ManageUsers />
              </div>
            </>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
    </Routes>
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
