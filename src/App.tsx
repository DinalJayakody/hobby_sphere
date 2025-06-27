import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import CreatePost from './pages/CreatePost';
import ProfileSetup from './pages/ProfileSetup';

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{element}</> : <Navigate to="/welcome" />;
};

const AuthRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{element}</> : <Navigate to="/" />;
};

const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const page = document.getElementById('page-content');
    if (page) {
      page.className = 'page-enter';
    }
    return () => {
      if (page) {
        page.className = 'page-exit';
      }
    };
  }, [location]);

  return <div id="page-content">{children}</div>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = user ? 'Hobby Sphere - Home' : 'Hobby Sphere';
  }, [user]);

  return (
    <PageTransitionWrapper>
      <Routes>
        <Route path="/welcome" element={<AuthRoute element={<Welcome />} />} />
        <Route path="/login" element={<AuthRoute element={<Login />} />} />
        <Route path="/register" element={<AuthRoute element={<Register />} />} />
        <Route path="/profilesetup" element={<AuthRoute element={<ProfileSetup />} />} />
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/profile/:username" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
        <Route path="/create" element={<ProtectedRoute element={<CreatePost />} />} />
        <Route path="*" element={<Navigate to="/welcome" />} />
      </Routes>
    </PageTransitionWrapper>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppRoutes />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;