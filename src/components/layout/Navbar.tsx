import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import logo_home from "../../assets/logo_home.png";
import Avatar from "../ui/Avatar";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    {
      path: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadNotificationsCount,
    },
    { path: "/chat", icon: MessageSquare, label: "Messages" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const menuItems = [
    { path: "/friends", icon: Users, label: "Friends" },
    { path: "/saved", icon: Bookmark, label: "Saved Posts" },
    { path: "/create", icon: PlusSquare, label: "Create Post" },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🔍 Fetch results
  const fetchResults = async (query: string, pageNum: number) => {
    if (!query) {
      setResults([]);
      setHasMore(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8080/api/users/search?query=${encodeURIComponent(
          query
        )}&page=${pageNum}&size=5`
      );

      const newResults = res.data.data || [];

      if (pageNum === 0) {
        setResults(newResults);
      } else {
        setResults((prev) => [...prev, ...newResults]);
      }

      setHasMore(newResults.length > 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset & fetch when query changes
  useEffect(() => {
    if (searchQuery) {
      setPage(0);
      fetchResults(searchQuery, 0);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  // Infinite scroll inside dropdown
  const handleScroll = () => {
    if (!dropdownRef.current || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(searchQuery, nextPage);
    }
  };

  if (!user) return null;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;

  return (
    <>
      {/* Top navbar - desktop */}
      <div className="sticky top-0 left-0 right-0 bg-gradient-to-br from-navy-50 to-sky-300 shadow-sm z-20 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logo_home} alt="Logo" className="h-10 w-auto" />
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-navy-600">Hobby Sphere</h1>

              {/* 🔍 Desktop Search */}
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="bg-sky-50 px-4 py-1.5 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
                <Search className="absolute right-3 top-2 text-gray-500 w-5 h-5" />

                {/* Dropdown */}
                {searchQuery && (loading || results.length > 0) && (
                  <div
                    ref={dropdownRef}
                    onScroll={handleScroll}
                    className="absolute left-0 mt-3 w-full max-h-60 overflow-y-auto bg-white border rounded-lg shadow-xl z-50"
                  >
                    {loading && page === 0 ? (
                      <div className="p-3 text-center text-sm">Searching...</div>
                    ) : (
                      <>
                        {results.map((user: any, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-2 hover:bg-sky-100 cursor-pointer"
                            onClick={() => {
                              navigate(`/FriendProfile/${user.id}`);
                              // navigate(`/FriendProfile/`);
                              setSearchQuery("");
                            }}
                          >
                            {/* Profile picture */}
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  imageSrc ||
                                  // user.profilePicture ||
                                  user.avatarUrl ||
                                  "/default-avatar.png"
                                }
                                alt={user.username}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />

                              <div className="flex flex-col">
                                <div className="font-semibold text-gray-900">{user.fullName || "No Name"}</div>

                                <div className="text-sm text-gray-500">{user.username}</div>
                                <div className="text-sm text-gray-500">
                                  🎯 {user.hobby || "No hobby"} · 📍 {user.location || "Unknown"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {loading && page > 0 && (
                          <div className="p-3 text-center text-sm">
                            Loading more...
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <div
                key={item.path}
                className={`relative cursor-pointer ${isActive(item.path)
                  ? "text-navy-600"
                  : "text-gray-600 hover:text-navy-600"
                  }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
            ))}
            <div className="cursor-pointer" onClick={toggleMenu}>
              <Avatar src={imageSrc} alt={user.username} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navbar - mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-navy-50 to-sky-300 border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-5 px-2 py-2">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg cursor-pointer ${isActive(item.path) ? "text-navy-600" : "text-gray-600"
                }`}
              onClick={() => navigate(item.path)}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          ))}
          <div
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg cursor-pointer ${menuOpen ? "text-navy-600" : "text-gray-600"
              }`}
            onClick={toggleMenu}
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs mt-1">Menu</span>
          </div>
        </div>
      </div>

      {/* Mobile search header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-navy-50 to-sky-300 z-20 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <img src={logo_home} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-bold text-navy-600 px-4 flex-grow">
            Hobby Sphere
          </h1>
          <div className="flex items-center space-x-4">
            <div onClick={toggleSearch} className="cursor-pointer">
              <Search className="w-6 h-6 text-gray-600" />
            </div>
            <div
              onClick={() => navigate("/create")}
              className="cursor-pointer"
            >
              <PlusSquare className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="px-4 py-2 bg-sky-50">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, posts, tags..."
                className="bg-white px-4 py-2 rounded-lg w-full focus:outline-none border border-gray-200"
                autoFocus
              />
              <X
                className="absolute right-3 top-2.5 text-gray-500 w-5 h-5 cursor-pointer"
                onClick={toggleSearch}
              />

              {/* 🔽 Mobile Search Dropdown */}
              {searchQuery && (loading || results.length > 0) && (
                <div
                  ref={dropdownRef}
                  onScroll={handleScroll}
                  className="absolute left-0 mt-3 w-full max-h-60 overflow-y-auto bg-white border rounded-lg shadow-xl z-50"
                >
                  {loading && page === 0 ? (
                    <div className="p-3 text-center text-sm">Searching...</div>
                  ) : (
                    <>
                      {results.map((user: any, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-sky-100 cursor-pointer"
                          onClick={() => {
                            navigate(`/FriendProfile/${user.id}`);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                        >

                          {/* Profile picture */}
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                imageSrc ||
                                user.avatarUrl ||
                                "/default-avatar.png"
                              }
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />

                            <div className="flex flex-col">
                              <div className="font-semibold text-gray-900">{user.fullName || "No Name"}</div>

                              <div className="text-sm text-gray-500">{user.username}</div>
                              <div className="text-sm text-gray-500">
                                🎯 {user.hobby || "No hobby"} · 📍 {user.location || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {loading && page > 0 && (
                        <div className="p-3 text-center text-sm">
                          Loading more...
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
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
              <Avatar src={imageSrc} alt={user.username} size="md" />
              <div>
                <h3 className="font-semibold">{user.fullName}</h3>
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
