import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, AtSign, Mail, Lock } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const success = await registerUser(
      formData.name,
      formData.username,
      formData.email,
      formData.password
    );
    
    if (success) {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Grid - Animated Background (2/3) */}
      <div className="hidden lg:flex lg:w-2/3 relative">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-navy-600/90 to-sky-500/90"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white p-12">
            <h1 className="text-6xl font-bold mb-8 animate-fade-in">Join Hobby Sphere</h1>
            <p className="text-2xl text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>Start sharing your passions with the world</p>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
                <p className="text-base opacity-90">Showcase your interests and expertise to the community</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-semibold mb-3">Connect & Share</h3>
                <p className="text-base opacity-90">Find and follow other enthusiasts who share your interests</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-semibold mb-3">Share Your Journey</h3>
                <p className="text-base opacity-90">Post updates and progress about your hobby adventures</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-semibold mb-3">Learn & Grow</h3>
                <p className="text-base opacity-90">Discover tips and techniques from experienced members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Grid - Register Form (1/3) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-gradient-to-br from-navy-50 to-sky-400">
        <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="bg-sky-100/30 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-navy-600 to-sky-500 bg-clip-text text-transparent mb-3">Create Account</h2>
              <p className="text-gray-600">Join our community today</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              <div className="relative">
                <AtSign className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              <div className="relative">
                <Mail className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute top-3 left-3 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="pl-10"
                  fullWidth
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="form-checkbox text-navy-600 rounded" 
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-navy-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-navy-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
              
              <Button 
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className="py-3 text-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
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
                <span className="text-md">Sign up with Google</span>
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-navy-600 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;