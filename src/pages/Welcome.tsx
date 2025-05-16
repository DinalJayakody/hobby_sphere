import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { LogIn, UserPlus } from 'lucide-react';

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Grid - Animated Background (2/3) */}
      <div className="hidden lg:flex lg:w-2/3 relative">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-navy-600/90 to-sky-500/90"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white p-12">
            <h1 className="text-6xl font-bold mb-8 animate-fade-in">Welcome to Hobby Sphere</h1>
            <p className="text-2xl text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>Connect with people who share your passions</p>
            <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-xl font-semibold mb-3">Share Your Passion</h3>
                <p className="text-base opacity-90">Showcase your hobbies and connect with like-minded enthusiasts</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-semibold mb-3">Learn Together</h3>
                <p className="text-base opacity-90">Exchange knowledge and grow your skills with others</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-semibold mb-3">Join Communities</h3>
                <p className="text-base opacity-90">Find groups dedicated to your favorite activities</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-semibold mb-3">Stay Inspired</h3>
                <p className="text-base opacity-90">Discover new hobbies and get inspired by others</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Grid - Auth Forms (1/3) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-gradient-to-br from-navy-50 to-sky-400">
        <div className="w-full max-w-md animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <div className="bg-sky-100/30 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-8 transform hover:scale-[1.02] transition-transform duration-300 animate-pulse-glow">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-navy-600 to-sky-500 bg-clip-text text-transparent mb-3">
                Welcome to Hobby Sphere
              </h2>
              <p className="text-gray-600 text-lg">Join our community of passionate hobbyists</p>
            </div>

            <div className="space-y-6">
              <Link to="/login">
                <Button
                  variant="primary"
                  fullWidth
                  className="flex items-center justify-center space-x-3 py-3 text-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <LogIn className="w-6 h-6" />
                  <span>Sign In</span>
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  variant="secondary"
                  fullWidth
                  className="flex items-center justify-center space-x-3 py-3 text-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus className="w-6 h-6" />
                  <span>Create Account</span>
                </Button>
              </Link>

              <div className="relative">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;