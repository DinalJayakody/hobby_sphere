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
  UsersRound,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import logo_home from "../../assets/logo_home.png";
import Avatar from "../ui/Avatar";
import axiosInstance from "../../types/axiosInstance";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const SEARCH_DEBOUNCE_MS = 300;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount, clearData } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 🔍 Search state — single source of truth, single debounced fetch effect.
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hobbyFilter, setHobbyFilter] = useState(false);
  const [nearbyFilter, setNearbyFilter] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
    { path: "/FriendsPage", icon: Users, label: "Friends" },
    { path: "/profile?tab=saved", icon: Bookmark, label: "Saved" },
    { path: "/create", icon: PlusSquare, label: "Create Post" },
    { path: "/GroupsPage", icon: UsersRound, label: "Groups" },
    { path: "/Settings", icon: SettingsIcon, label: "Settings" },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    logout();
    clearData();
    navigate("/login");
  };

  // 🔍 Fetch results for a given page (page 0 replaces, page > 0 appends).
  const fetchResults = async (query: string, hobby: boolean, nearby: boolean, pageNum: number) => {
    if (!query.trim() && !hobby && !nearby) {
      setResults([]);
      setHasMore(true);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/api/users/search?query=${encodeURIComponent(query)}&hobby=${hobby}&nearby=${nearby}&page=${pageNum}&size=5`
      );
      const newResults = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setResults((prev) => (pageNum === 0 ? newResults : [...prev, ...newResults]));
      setHasMore(newResults.length > 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Single debounced trigger for query/filter changes — replaces the
  // previous 2-3 overlapping effects that each independently re-fetched the
  // same query on every keystroke.
  useEffect(() => {
    setShowDropdown(!!searchQuery.trim() || hobbyFilter || nearbyFilter);
    const timer = setTimeout(() => {
      setPage(0);
      fetchResults(searchQuery, hobbyFilter, nearbyFilter, 0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, hobbyFilter, nearbyFilter]);

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

  // Infinite scroll inside dropdown
  const handleScroll = (e?: React.UIEvent<HTMLDivElement>) => {
    const target = e?.currentTarget;
    if (!target || loading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = target as HTMLElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(searchQuery, hobbyFilter, nearbyFilter, nextPage);
    }
  };

  if (!user) return null;
  const imageSrc = `data:image/png;base64,${user.profilePicture}`;

  return (
    <>
      {/* Top navbar - desktop */}
      <div className="sticky top-0 left-0 right-0 bg-gradient-to-br from-navy-50 to-sky-300 dark:from-navy-900 dark:to-navy-800 shadow-soft z-20 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logo_home} alt="Logo" className="h-10 w-auto" />
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-navy-700 dark:text-sky-200">Hobby Sphere</h1>

              {/* 🔍 Desktop Search */}
              <div className="relative w-72" ref={wrapperRef}>
                <div className="relative flex items-center bg-surface/90 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-sky-400 transition-all">
                  <Search className="absolute left-3 text-ink-faint w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowDropdown(!!searchQuery.trim() || hobbyFilter || nearbyFilter)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 w-full bg-transparent rounded-full text-sm text-ink placeholder-ink-faint focus:outline-none"
                  />
                </div>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                      onScroll={(e) => handleScroll(e)}
                      className="absolute left-0 mt-3 w-full max-h-72 overflow-y-auto bg-surface-raised border border-border rounded-2xl shadow-soft-lg z-50 p-3"
                    >
                      <div className="absolute top-[6px] left-2 flex gap-[2px] z-10">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setHobbyFilter((prev) => !prev)}
                          className={`flex items-center gap-1 px-2 py-[2px] text-[10px] rounded-full border transition-all duration-150 shadow-sm ${hobbyFilter
                            ? "bg-sky-500 text-white border-sky-500 shadow-md"
                            : "bg-surface text-ink-muted border-border-strong hover:bg-sky-50 dark:hover:bg-sky-500/10"
                            }`}
                        >
                          <Sparkles className={`w-3 h-3 ${hobbyFilter ? "text-yellow-200 animate-spin-slow" : "text-sky-500"}`} />
                          Hobby
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNearbyFilter((prev) => !prev)}
                          className={`flex items-center gap-1 px-2 py-[2px] text-[10px] rounded-full border transition-all duration-150 shadow-sm ${nearbyFilter
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                            : "bg-surface text-ink-muted border-border-strong hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            }`}
                        >
                          📍 Nearby
                        </motion.button>
                      </div>

                      {loading && page === 0 ? (
                        <div className="p-3 pt-6 text-center text-sm text-ink-muted animate-pulse">Searching...</div>
                      ) : results.length > 0 ? (
                        <div className="pt-5">
                          {results.map((friend: any, idx: number) => {
                            const image = friend.profilePicture ? `data:image/png;base64,${friend.profilePicture}` : "/default-avatar.svg";
                            return (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                  navigate(`/FriendProfile/${friend.id}`);
                                  setSearchQuery("");
                                  setShowDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer flex items-center gap-3 rounded-lg"
                              >
                                <img src={image} alt={friend.username} className="w-9 h-9 rounded-full object-cover bg-surface-muted" />
                                <div>
                                  <div className="font-semibold text-ink">{friend.fullName || "No Name"}</div>
                                  <div className="text-sm text-ink-muted">@{friend.username}</div>
                                  <div className="text-xs text-ink-faint">🎯 {friend.mainHobby || "No hobby"} · 📍 {friend.location || "Unknown"}</div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 pt-6 text-center text-sm text-ink-faint">No users found 😕</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <div
                key={item.path}
                className={`relative cursor-pointer ${isActive(item.path)
                  ? "text-navy-700 dark:text-sky-300"
                  : "text-ink-muted hover:text-navy-700 dark:hover:text-sky-300"
                  }`}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-6 h-6" />
                {(item.badge ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-coral-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface">
                    {item.badge! > 9 ? "9+" : item.badge}
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
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-navy-50 to-sky-300 dark:from-navy-900 dark:to-navy-800 border-t border-border z-50 md:hidden">
            <div className="grid grid-cols-5 px-2 py-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg focus:outline-none ${isActive(item.path) ? "text-navy-700 dark:text-sky-300" : "text-ink-muted"
                    }`}
                >
                  <div className="relative">
                    <item.icon className="w-6 h-6" />
                    {(item.badge ?? 0) > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-coral-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface">
                        {item.badge! > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg focus:outline-none ${menuOpen ? "text-navy-700 dark:text-sky-300" : "text-ink-muted"
                  }`}
              >
                <Menu className="w-6 h-6" />
                <span className="text-xs mt-1">Menu</span>
              </motion.button>
            </div>
          </div>,
          document.body
        )}

      {typeof document !== "undefined" && menuOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={toggleMenu}>
            <div
              className="absolute bottom-16 right-4 md:top-14 md:bottom-auto md:right-4 bg-surface-raised rounded-2xl shadow-soft-lg w-64 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 border-b border-border pb-4 mb-2">
                <Avatar src={imageSrc} alt={user.username} size="md" className="flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink truncate">{user.fullName}</h3>
                  <p className="text-sm text-ink-muted truncate">@{user.username}</p>
                </div>
              </div>
              <div className="pt-3">
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(70px,1fr))] gap-3">
                  {menuItems.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                      }}
                      className="flex flex-col items-center justify-center bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl p-3 cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <item.icon className="w-6 h-6 text-sky-600 dark:text-sky-400 mb-1" />
                      <span className="text-xs font-medium text-ink-muted text-center">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-5 flex items-center justify-center py-2 text-coral-500 font-medium cursor-pointer hover:text-coral-600 transition"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Mobile search header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-navy-50 to-sky-300 dark:from-navy-900 dark:to-navy-800 z-20 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <img src={logo_home} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-xl font-bold text-navy-700 dark:text-sky-200 px-4 flex-grow">Hobby Sphere</h1>
          <div className="flex items-center space-x-4">
            <div onClick={toggleSearch} className="cursor-pointer">
              <Search className="w-6 h-6 text-ink-muted" />
            </div>
            <div onClick={() => navigate("/create")} className="cursor-pointer">
              <PlusSquare className="w-6 h-6 text-ink-muted" />
            </div>
          </div>
        </div>
        {searchOpen && (
          <div className="px-4 py-2 bg-sky-50 dark:bg-navy-800">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setHobbyFilter((prev) => !prev)}
                className={`px-3 py-1 text-xs rounded-full border ${hobbyFilter
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-surface text-ink-muted border-border-strong"
                  }`}
              >
                ✨ Hobby
              </button>

              <button
                onClick={() => setNearbyFilter((prev) => !prev)}
                className={`px-3 py-1 text-xs rounded-full border ${nearbyFilter
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-surface text-ink-muted border-border-strong"
                  }`}
              >
                📍 Nearby
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="bg-surface text-ink px-4 py-2 rounded-lg w-full focus:outline-none border border-border-strong"
                autoFocus
              />
              <X
                className="absolute right-3 top-2.5 text-ink-faint w-5 h-5 cursor-pointer"
                onClick={toggleSearch}
              />

              {showDropdown && (loading || results.length > 0) && (
                <div
                  ref={dropdownRef}
                  onScroll={handleScroll}
                  className="absolute left-0 mt-3 w-full max-h-60 overflow-y-auto bg-surface-raised border border-border rounded-lg shadow-soft-lg z-50"
                >
                  {loading && page === 0 ? (
                    <div className="p-3 text-center text-sm text-ink-muted">Searching...</div>
                  ) : (
                    <>
                      {results.map((resultUser: any, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer"
                          onClick={() => {
                            navigate(`/FriendProfile/${resultUser.id}`);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                resultUser.profilePicture
                                  ? `data:image/png;base64,${resultUser.profilePicture}`
                                  : "/default-avatar.svg"
                              }
                              alt={resultUser.username}
                              className="w-8 h-8 rounded-full object-cover bg-surface-muted"
                            />
                            <div className="flex flex-col">
                              <div className="font-semibold text-ink">{resultUser.fullName || "No Name"}</div>
                              <div className="text-sm text-ink-muted">{resultUser.username}</div>
                              <div className="text-sm text-ink-muted">
                                🎯 {resultUser.mainHobby || "No hobby"} · 📍 {resultUser.location || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {loading && page > 0 && (
                        <div className="p-3 text-center text-sm text-ink-muted">Loading more...</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
