import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AtSign, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      console.log('Login successful');
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
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-gradient-to-br from-navy-50 to-sky-400">
        <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="bg-sky-100/30 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-navy-600 to-sky-500 bg-clip-text text-transparent mb-3">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <AtSign className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
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
                <Lock className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox text-navy-600 rounded" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-navy-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <Button 
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="py-3 text-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-4 bg-sky-100/70 text-gray-700">
                    Or continue with
                  </span>
                </div>
              </div>

              <button className="w-full flex items-center justify-center space-x-3 border-2 border-gray-200 rounded-xl px-4 py-2 text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-6 h-6"
                />
                <span className="text-md">Sign in with Google</span>
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-navy-600 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;