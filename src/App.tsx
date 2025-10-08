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
import LoadingScreen from './components/ui/LoadingScreen';
import ProfileEdit from './pages/ProfileEdit';
import FriendProfile from './pages/FriendProfile';
import FriendsPage from './pages/FriendsPage';
import Pages from './pages/Pages';
import Settings from './pages/Settings';
import GroupsPage from './pages/GroupsPage';
import { CreateGroup } from './pages/CreateGroup';
import ForgotPassword from './pages/ForgotPassword';

const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, loadingUser, user } = useAuth();

    if (loadingUser) {
    return <LoadingScreen />; // Wait until auth is resolved
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" />;
  }

  
//    if (loadingUser) {
//     return <LoadingScreen />; //  Spinner component
//   }

  return isAuthenticated ? <>{element}</> : <Navigate to="/welcome" />;
};

const AuthRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, loadingUser } = useAuth();

    if (loadingUser) {
    return <LoadingScreen />; // Prevents redirect flicker
  }

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
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/profilesetup" element={<AuthRoute element={<ProfileSetup />} />} />
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/profile/:username" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
        <Route path="/create" element={<ProtectedRoute element={<CreatePost />} />} />
        <Route path="/ProfileEdit" element={<ProtectedRoute element={<ProfileEdit />} />} />
        <Route path="/FriendProfile/:id" element={<ProtectedRoute element={<FriendProfile />} />} />
        <Route path="/FriendsPage" element={<ProtectedRoute element={<FriendsPage />} />} />
        <Route path="/Pages" element={<ProtectedRoute element={<Pages />} />} />
        <Route path="/GroupsPage" element={<ProtectedRoute element={<GroupsPage />} />} />
        <Route path="/CreateGroup" element={<ProtectedRoute element={<CreateGroup />} />} />
        <Route path="/ForgotPassword" element={<ProtectedRoute element={<ForgotPassword />} />} />
        <Route path="/Settings" element={<ProtectedRoute element={<Settings />} />} />
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