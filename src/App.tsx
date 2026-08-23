import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider, useTheme, applyThemeClass } from './context/ThemeContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { AccountSettingsProvider } from './context/AccountSettingsContext';
import { ToastProvider } from './context/ToastContext';
import LoadingScreen from './components/ui/LoadingScreen';

// Route-level code splitting — each page ships as its own chunk instead of
// bloating the initial bundle, so first load only pays for Welcome/Login.
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const FriendProfile = lazy(() => import('./pages/FriendProfile'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Settings = lazy(() => import('./pages/Settings'));
const BlockedUsers = lazy(() => import('./pages/BlockedUsers'));
const GroupsPage = lazy(() => import('./pages/GroupsPage'));
const CreateGroup = lazy(() => import('./pages/CreateGroup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyCode = lazy(() => import('./pages/VerifyCode'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const RegisterSuccess = lazy(() => import('./pages/RegisterSuccess'));
const GroupPage = lazy(() => import('./pages/GroupPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ChildSafety = lazy(() => import('./pages/ChildSafety'));

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

// Unknown URLs: logged-out users bounce to Welcome (unchanged); logged-in
// users now see a real "not found" page instead of silently landing on Home.
const RequireAuthOrRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loadingUser } = useAuth();

  if (loadingUser) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/welcome" />;
};

// Keeps the <html class="dark"> toggle in sync with route changes — pages
// shown before login (Welcome/Login/Register/etc.) always stay light, even
// if the user left the app in dark mode last session, since React Router's
// client-side navigation doesn't fire the popstate/storage events ThemeContext
// alone can observe.
const ThemeRouteSync: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    applyThemeClass(theme, location.pathname);
  }, [theme, location.pathname]);

  return null;
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
      <ThemeRouteSync />
      <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Apple/Google submissions require the exact URL hobbysphereai.com/privacy */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        {/* Apple/Google submissions require the exact URL hobbysphereai.com/child-safety */}
        <Route path="/child-safety" element={<ChildSafety />} />
        <Route path="/welcome" element={<AuthRoute element={<Welcome />} />} />
        <Route path="/login" element={<AuthRoute element={<Login />} />} />
        <Route path="/register" element={<AuthRoute element={<Register />} />} />
        <Route path="/RegisterSuccess" element={<ProtectedRoute element={<RegisterSuccess />} />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/VerifyCode" element={<VerifyCode />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/profilesetup" element={<AuthRoute element={<ProfileSetup />} />} />
        <Route path="/" element={<ProtectedRoute element={<Home />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/profile/:username" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        <Route path="/chat" element={<ProtectedRoute element={<ChatPage />} />} />
        <Route path="/create" element={<ProtectedRoute element={<CreatePost />} />} />
        <Route path="/ProfileEdit" element={<ProtectedRoute element={<ProfileEdit />} />} />
        <Route path="/FriendProfile/:id" element={<ProtectedRoute element={<FriendProfile />} />} />
        <Route path="/FriendsPage" element={<ProtectedRoute element={<FriendsPage />} />} />
        <Route path="/post/:id" element={<ProtectedRoute element={<PostDetail />} />} />
        <Route path="/GroupsPage" element={<ProtectedRoute element={<GroupsPage />} />} />
        <Route path="/Group/:groupId" element={<ProtectedRoute element={<GroupPage />} />} />
        <Route path="/CreateGroup" element={<ProtectedRoute element={<CreateGroup />} />} />
        {/* <Route path="/ForgotPassword" element={<ProtectedRoute element={<ForgotPassword />} />} /> */}
        <Route path="/Settings" element={<ProtectedRoute element={<Settings />} />} />
        <Route path="/Settings/BlockedUsers" element={<ProtectedRoute element={<BlockedUsers />} />} />
        <Route
          path="*"
          element={
            <RequireAuthOrRedirect>
              <NotFound />
            </RequireAuthOrRedirect>
          }
        />
      </Routes>
      </Suspense>
    </PageTransitionWrapper>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AccountSettingsProvider>
            <PreferencesProvider>
              <DataProvider>
                <ModalProvider>
                  <Router>
                    <AppRoutes />
                  </Router>
                </ModalProvider>
              </DataProvider>
            </PreferencesProvider>
          </AccountSettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;