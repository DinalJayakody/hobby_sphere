import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  Menu,
  X,
  PlusSquare,
  LogOut,
  Users,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Avatar from '../ui/Avatar';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications',
      badge: unreadNotificationsCount,
    },
    { path: '/chat', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const menuItems = [
    { path: '/friends', icon: Users, label: 'Friends' },
    { path: '/saved', icon: Bookmark, label: 'Saved Posts' },
    { path: '/create', icon: PlusSquare, label: 'Create Post' },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      {/* Top navbar - desktop */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-navy-600">Hobby Sphere</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-sky-50 px-4 py-1.5 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-navy-300"
              />
              <Search className="absolute right-3 top-2 text-gray-500 w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <div
                key={item.path}
                className={`relative cursor-pointer ${
                  isActive(item.path)
                    ? 'text-navy-600'
                    : 'text-gray-600 hover:text-navy-600'
                }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
            ))}
            <div className="cursor-pointer" onClick={toggleMenu}>
              <Avatar src={user.profilePicture} alt={user.name} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navbar - mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 md:hidden">
        <div className="grid grid-cols-5 px-2 py-2">
          {navItems.map((item, index) => (
            <div
              key={item.path}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg cursor-pointer ${
                isActive(item.path) ? 'text-navy-600' : 'text-gray-600'
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          ))}
          <div
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg cursor-pointer ${
              menuOpen ? 'text-navy-600' : 'text-gray-600'
            }`}
            onClick={toggleMenu}
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </div>
        </div>
      </div>

      {/* Mobile search header */}
      <div className="fixed top-0 left-0 right-0 bg-white z-20 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-navy-600">SocialApp</h1>
          <div className="flex items-center space-x-4">
            <div onClick={toggleSearch} className="cursor-pointer">
              <Search className="w-6 h-6 text-gray-600" />
            </div>
            <div onClick={() => navigate('/create')} className="cursor-pointer">
              <PlusSquare className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="px-4 py-2 bg-sky-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users, posts, tags..."
                className="bg-white px-4 py-2 rounded-lg w-full focus:outline-none border border-gray-200"
                autoFocus
              />
              <X
                className="absolute right-3 top-2.5 text-gray-500 w-5 h-5 cursor-pointer"
                onClick={toggleSearch}
              />
            </div>
          </div>
        )}
      </div>

      {/* Menu dropdown */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMenu}
        >
          <div
            className="absolute bottom-16 right-4 md:top-14 md:bottom-auto md:right-4 bg-white rounded-lg shadow-xl w-64 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-2">
              <Avatar src={user.profilePicture} alt={user.name} size="md" />
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              {menuItems.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center space-x-3 px-2 py-2 hover:bg-sky-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate(item.path);
                    setMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5 text-navy-600" />
                  <span>{item.label}</span>
                </div>
              ))}
              <div
                className="flex items-center space-x-3 px-2 py-2 hover:bg-sky-50 rounded-lg cursor-pointer text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
