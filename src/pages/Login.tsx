import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import logo from '../assets/logo_home.png';
import Button from '../components/ui/Button';
import { AtSign, Eye, EyeOff, Lock } from 'lucide-react';
import FloatingBlobs from '../components/ui/FloatingBlobs';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Grid - Animated Background (2/3) */}
      <div className="hidden lg:flex lg:w-2/3 relative">
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-600/90 to-sky-500/90"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184419/pexels-photo-3184419.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white p-12">
            <h1 className="text-6xl font-bold mb-8 animate-fade-in">Welcome Back!</h1>
            <p className="text-2xl text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>Continue your journey with Hobby Sphere</p>

            <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-xl font-semibold mb-3">Share Updates</h3>
                <p className="text-base opacity-90">Keep your community informed about your latest hobby projects</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-semibold mb-3">Connect</h3>
                <p className="text-base opacity-90">Chat with fellow enthusiasts and make new connections</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-semibold mb-3">Explore</h3>
                <p className="text-base opacity-90">Discover new techniques and inspiration from others</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-semibold mb-3">Grow</h3>
                <p className="text-base opacity-90">Level up your skills with community feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Grid - Login Form (1/3) */}
      <div className="relative w-full lg:w-1/3 flex items-center justify-center px-4 py-10 sm:p-8 bg-gradient-to-br from-navy-50 to-sky-400 dark:from-navy-900 dark:to-navy-700 overflow-hidden">
        <FloatingBlobs />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-sky-100/30 dark:bg-surface/40 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 transform hover:scale-[1.01] transition-transform duration-300 animate-pulse-glow">
            <div className="flex flex-col items-center justify-center text-center mb-8 animate-fade-in">
              <img
                src={logo}
                alt="Hobby Sphere Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 mb-4 animate-bounce-slow"
              />
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-navy-600 to-sky-500 bg-clip-text text-transparent mb-3">Welcome to Hobby Sphere</h2>
              <p className="text-ink-muted">Sign in to continue</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-coral-50 dark:bg-coral-500/10 border border-coral-200 dark:border-coral-500/30 text-coral-600 dark:text-coral-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <AtSign className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  fullWidth
                />
              </div>

              <div className="relative">
                <Lock className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 text-sm"
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-ink-faint hover:text-sky-500 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox text-navy-600 rounded" />
                  <span className="ml-2 text-sm text-ink-muted">Remember me</span>
                </label>

                <Link to="/ForgotPassword" className="text-sm text-navy-600 dark:text-sky-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
                className="py-3 text-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-sky-200/60 dark:border-border"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-4 bg-sky-100/70 dark:bg-surface text-ink-muted">
                    Or continue with
                  </span>
                </div>
              </div>

              <SocialAuthButtons />
            </form>

            <div className="mt-6 text-center">
              <p className="text-ink-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-navy-600 dark:text-sky-400 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
