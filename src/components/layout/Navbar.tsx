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
  Sparkles,
  ChevronDown,
  Filter,
} from "lucide-react";
// import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import logo_home from "../../assets/logo_home.png";
import Avatar from "../ui/Avatar";
import axiosInstance from "../../types/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { clearData } = useData();

  // 🔍 Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

  const [hobbyFilter, setHobbyFilter] = useState(false);
  const [nearbyFilter, setNearbyFilter] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
  const [hobbySelected, setHobbySelected] = useState(false);
  const [nearbySelected, setNearbySelected] = useState(false);

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
    { path: "/GroupsPage", icon: PlusSquare, label: "Groups" },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    logout();
    clearData();
    navigate("/login");
  };

  // 🔍 Fetch results
    const fetchResults = async (query: string,  hobby: boolean, nearby: boolean, pageNum: number) => {
    // ✅ API call only if something is to search or filter
    if (!query.trim() && !hobby && !nearby) return;

    setLoading(true);

    try {
      // 🧩 Example payload sent to backend
   setLoading(true);
      const res = await axiosInstance.get(
        // `http://localhost:8080/api/users/search?query=${encodeURIComponent(
        `/api/users/search?query=${encodeURIComponent(query)}
        &hobby=${hobby}
        &nearby=${nearby}
        &page=${pageNum}&size=5`
      );


      setResults(res.data);

      const newResults = res.data.data || [];
            if (pageNum === 0) {
        setResults(newResults);
      } else {
        setResults((prev) => [...prev, ...newResults]);
      }
      setHasMore(newResults.length > 0);

      // 🧪 Mock data for UI testing
      setTimeout(() => {
        setResults([
          { id: 1, username: "alex", hobby: "football", location: "Colombo" },
          { id: 2, username: "mila", hobby: "painting", location: "Kandy" },
          { id: 2, username: "mila", hobby: "painting", location: "Kandy" },
          { id: 2, username: "mila", hobby: "painting", location: "Kandy" },
        ]);
      }, 400);


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
      fetchResults(searchQuery, hobbySelected, nearbySelected, 0);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

   // 🧠 Close dropdown on outside click
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


  // ✅ Handle search + params
  useEffect(() => {
    if (searchQuery.trim() !== "") {
      handleSearch({
        query: searchQuery,
        hobby: hobbySelected,
        nearby: nearbySelected,
      });
      setShowDropdown(true); // only show if typing
    } else {
      setShowDropdown(false); // hide if empty
    }
  }, [searchQuery, hobbySelected, nearbySelected]);

  // 🎯 API search logic (runs when searchQuery or toggles change)
  const handleSearch = ({
    query,
    hobby,
    nearby,
  }: {
    query: string;
    hobby: boolean;
    nearby: boolean;
  }) => {
    // You can update this logic to call a filtered API endpoint if available
    // For now, just call fetchResults as before
    fetchResults(query, hobby, nearby, 0);
  };


  // Infinite scroll inside dropdown
// Accept the scroll event and compute from event.currentTarget
const handleScroll = (e?: React.UIEvent<HTMLDivElement>) => {
  const target = e?.currentTarget;
  if (!target || loading || !hasMore) return;
  const { scrollTop, scrollHeight, clientHeight } = target as HTMLElement;
  if (scrollTop + clientHeight >= scrollHeight - 20) {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(searchQuery, hobbySelected, nearbySelected, nextPage);
  }
};


    // ✅ Trigger search as user types (debounced or word-by-word)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchResults(value, hobbyFilter, nearbyFilter, 0);
  };


  if (!user) return null;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;

  // const imagefriend = `data:image/png;base64,${res.profilePicture}`;

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
      {/* ---------- SEARCH AREA (fixed outside-click + conditional rendering) ---------- */}
<div className="relative w-72" ref={wrapperRef}>
  {/* Search bar */}
  <div className="relative flex items-center bg-sky-50/80 dark:bg-gray-800 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-sky-400 transition-all">
    <Search className="absolute left-3 text-gray-500 w-5 h-5" />

    {/* attach the inputRef so outside-click detection works */}
    <input
      ref={inputRef}
      type="text"
      value={searchQuery}
      onFocus={() => setShowDropdown(true)} // open when focused
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search users..."
      className="pl-10 pr-4 py-2 w-full bg-transparent rounded-full text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
    />
  </div>

  {/* render dropdown only when showDropdown is true */}
  <AnimatePresence>
    {showDropdown && ( 
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        // pass the scroll event to handler (use event.currentTarget inside handler)
        onScroll={(e) => handleScroll(e)}
        className="absolute left-0 mt-3 w-full max-h-72 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 p-3"
      >
        {/* compact toggle chips (top-left) */}
        <div className="absolute top-[6px] left-2 flex gap-[2px] z-10">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setHobbyFilter((prev) => !prev);
              // re-run search (page 0)
              fetchResults(searchQuery, !hobbyFilter, nearbyFilter, 0);
            }}
            className={`flex items-center gap-1 px-2 py-[2px] text-[10px] rounded-full border transition-all duration-150 shadow-sm ${
              hobbyFilter
                ? "bg-sky-500 text-white border-sky-500 shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-sky-50"
            }`}
          >
            <Sparkles className={`w-3 h-3 ${hobbyFilter ? "text-yellow-200 animate-spin-slow" : "text-sky-500"}`} />
            Hobby
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setNearbyFilter((prev) => !prev);
              fetchResults(searchQuery, hobbyFilter, !nearbyFilter, 0);
            }}
            className={`flex items-center gap-1 px-2 py-[2px] text-[10px] rounded-full border transition-all duration-150 shadow-sm ${
              nearbyFilter
                ? "bg-green-500 text-white border-green-500 shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-green-50"
            }`}
          >
            📍 Nearby
          </motion.button>
        </div>

        {/* Search results / empty / loading */}
        {loading && page === 0 ? (
          <div className="p-3 text-center text-sm text-gray-500 animate-pulse">Searching...</div>
        ) : results.length > 0 ? (
          results.map((friend: any, idx: number) => {
            const image = friend.profilePicture ? `data:image/png;base64,${friend.profilePicture}` : "/default-avatar.png";
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  navigate(`/FriendProfile/${friend.id}`);
                  setSearchQuery("");
                  setShowDropdown(false); // close on selection
                }}
                className="px-4 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3 rounded-lg"
              >
                <img src={image} alt={friend.username} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{friend.fullName || "No Name"}</div>
                  <div className="text-sm text-gray-500">@{friend.username}</div>
                  <div className="text-xs text-gray-400">🎯 {friend.hobby || "No hobby"} · 📍 {friend.location || "Unknown"}</div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="p-4 text-center text-sm text-gray-400">No users found 😕</div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
</div>
{/* ---------- END SEARCH AREA ---------- */}

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

          {menuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={toggleMenu}
            >
              <div
                className="absolute bottom-16 right-0 left-0 bg-white rounded-t-2xl shadow-xl p-4 md:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 🔹 Profile Section */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile`);
                      setMenuOpen(false);
                    }}
                  >
                    <Avatar src={imageSrc} alt={user.username} size="md" />
                    <div>
                      <h3 className="font-semibold text-gray-900 hover:text-sky-600">
                        {user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  {/* ⚙️ Settings navigation */}
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setMenuOpen(false);
                    }}
                    className="px-3 py-1 text-sm bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg"
                  >
                    Settings
                  </button>
                </div>

                {/* 🔹 Tile Menu Items */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { path: "/GroupsPage", icon: Users, label: "Groups" },
                    { path: "/", icon: Home, label: "Feed" },
                    { path: "/events", icon: Bell, label: "Events" },
                    { path: "/saved", icon: Bookmark, label: "Saved" },
                    { path: "/friends", icon: Users, label: "Friends" },
                    // 👉 Add more items here as needed (Photos, Pages, Marketplace, etc.)
                  ].map((item) => (
                    <div
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center bg-sky-50 hover:bg-sky-100 rounded-xl p-3 cursor-pointer transition"
                    >
                      <item.icon className="w-7 h-7 text-sky-600 mb-2" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 🔹 Logout Section */}
                <div
                  className="mt-6 flex items-center justify-center py-2 text-red-500 font-medium cursor-pointer hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </div>
              </div>
            </div>
          )}

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
