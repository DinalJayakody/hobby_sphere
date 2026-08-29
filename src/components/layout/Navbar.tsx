import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Heroicons — already an installed dependency (built by the Tailwind team,
// so its stroke weight/sizing pairs naturally with this app's Tailwind
// design system) but previously unused anywhere in the codebase. Outline
// icons are the default/inactive state; their solid counterparts render for
// the active tab — the same "filled on select" pattern used by most premium
// mobile-first apps, and one lucide's single-weight icons couldn't offer.
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  HomeIcon as HomeOutline,
  BellIcon as BellOutline,
  ChatBubbleOvalLeftEllipsisIcon as ChatOutline,
  UserCircleIcon as UserCircleOutline,
  Bars3Icon as Bars3Outline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  BellIcon as BellSolid,
  ChatBubbleOvalLeftEllipsisIcon as ChatSolid,
  UserCircleIcon as UserCircleSolid,
  Bars3Icon as Bars3Solid,
  UsersIcon as UsersSolid,
  BookmarkIcon as BookmarkSolid,
  PlusCircleIcon as PlusCircleSolid,
  UserGroupIcon as UserGroupSolid,
  Cog6ToothIcon as Cog6ToothSolid,
  UserPlusIcon as UserPlusSolid,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useNotifications } from "../../context/NotificationsContext";
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
  const { clearData } = useData();
  const { unreadNotificationsCount, clearNotificationsState } = useNotifications();
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
    { path: "/", Icon: HomeOutline, IconActive: HomeSolid, label: "Home" },
    {
      path: "/notifications",
      Icon: BellOutline,
      IconActive: BellSolid,
      label: "Notifications",
      badge: unreadNotificationsCount,
    },
    { path: "/chat", Icon: ChatOutline, IconActive: ChatSolid, label: "Messages" },
    { path: "/profile", Icon: UserCircleOutline, IconActive: UserCircleSolid, label: "Profile" },
  ];

  const menuItems = [
    { path: "/FriendsPage", icon: UsersSolid, label: "Friends" },
    { path: "/Suggestions", icon: UserPlusSolid, label: "Suggestions" },
    { path: "/profile?tab=saved", icon: BookmarkSolid, label: "Saved" },
    { path: "/create", icon: PlusCircleSolid, label: "Create Post" },
    { path: "/GroupsPage", icon: UserGroupSolid, label: "Groups" },
    { path: "/Settings", icon: Cog6ToothSolid, label: "Settings" },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    logout();
    clearData();
    clearNotificationsState();
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
      <div className="sticky top-0 z-20 hidden md:block px-4 pt-3">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-navy-50 to-sky-300 dark:from-navy-900 dark:to-navy-800 border border-white/30 dark:border-white/10 shadow-soft-lg rounded-3xl px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 focus:outline-none"
              aria-label="Go to Home"
            >
              <motion.img
                src={logo_home}
                alt="Logo"
                whileHover={{ rotate: -6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="h-9 w-auto"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-navy-700 to-sky-500 dark:from-sky-200 dark:to-sky-400 bg-clip-text text-transparent">
                Hobby Sphere
              </h1>
            </button>
            <div className="flex items-center space-x-4">

              {/* 🔍 Desktop Search */}
              <div className="relative w-72" ref={wrapperRef}>
                <div className="relative flex items-center bg-surface/90 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-sky-400 transition-all">
                  <MagnifyingGlassIcon className="absolute left-3 text-ink-faint w-5 h-5" />
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
                          <SparklesIcon className={`w-3 h-3 ${hobbyFilter ? "text-yellow-200 animate-spin-slow" : "text-sky-500"}`} />
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

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = active ? item.IconActive : item.Icon;
              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2.5 rounded-2xl focus:outline-none"
                  aria-label={item.label}
                >
                  {active && (
                    <motion.div
                      layoutId="desktop-nav-active"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-sm shadow-sm rounded-2xl"
                    />
                  )}
                  <Icon
                    className={`relative w-6 h-6 transition-colors ${active ? "text-navy-700 dark:text-sky-200" : "text-ink-muted hover:text-navy-700 dark:hover:text-sky-300"
                      }`}
                  />
                  <AnimatePresence>
                    {(item.badge ?? 0) > 0 && (
                      <motion.span
                        key={item.badge}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-coral-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface"
                      >
                        {item.badge! > 9 ? "9+" : item.badge}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={toggleMenu}
              className="cursor-pointer ml-2 rounded-full ring-2 ring-transparent hover:ring-sky-400/60 transition-all"
              aria-label="Open menu"
            >
              <Avatar src={imageSrc} alt={user.username} size="sm" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom navbar - mobile */}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-3 left-3 right-3 z-50 md:hidden rounded-[28px] bg-gradient-to-br from-navy-50 to-sky-300 dark:from-navy-900 dark:to-navy-800 border border-white/30 dark:border-white/10 shadow-soft-lg">
            <div className="grid grid-cols-5 px-1.5 py-2">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = active ? item.IconActive : item.Icon;
                return (
                  <motion.button
                    key={item.path}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => navigate(item.path)}
                    className="relative flex flex-col items-center justify-center py-1.5 rounded-2xl focus:outline-none"
                    aria-label={item.label}
                  >
                    {active && (
                      <motion.div
                        layoutId="mobile-nav-active"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-1 bg-white/40 dark:bg-white/10 backdrop-blur-sm shadow-sm rounded-2xl"
                      />
                    )}
                    <motion.div
                      className="relative"
                      animate={active ? { y: -2 } : { y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors ${active ? "text-navy-700 dark:text-sky-200" : "text-ink-muted"}`}
                      />
                      <AnimatePresence>
                        {(item.badge ?? 0) > 0 && (
                          <motion.span
                            key={item.badge}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-coral-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center shadow-sm ring-2 ring-surface"
                          >
                            {item.badge! > 9 ? "9+" : item.badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <span
                      className={`relative text-[10px] mt-1 font-medium transition-colors ${active ? "text-navy-700 dark:text-sky-200" : "text-ink-muted"
                        }`}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={toggleMenu}
                className="relative flex flex-col items-center justify-center py-1.5 rounded-2xl focus:outline-none"
                aria-label="Menu"
              >
                {menuOpen && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-1 bg-white/40 dark:bg-white/10 backdrop-blur-sm shadow-sm rounded-2xl"
                  />
                )}
                {menuOpen ? (
                  <Bars3Solid className="relative w-5 h-5 text-navy-700 dark:text-sky-200 transition-colors" />
                ) : (
                  <Bars3Outline className="relative w-5 h-5 text-ink-muted transition-colors" />
                )}
                <span
                  className={`relative text-[10px] mt-1 font-medium transition-colors ${menuOpen ? "text-navy-700 dark:text-sky-200" : "text-ink-muted"
                    }`}
                >
                  Menu
                </span>
              </motion.button>
            </div>
          </div>,
          document.body
        )}

      {typeof document !== "undefined" && menuOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={toggleMenu}>
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
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Logout
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Mobile search header */}
      <div className="fixed top-2 left-2 right-2 z-20 md:hidden rounded-2xl bg-gradient-to-br from-navy-50 to-sky-300 dark:from-navy-900 dark:to-navy-800 border border-white/30 dark:border-white/10 shadow-soft-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center flex-grow min-w-0 focus:outline-none"
            aria-label="Go to Home"
          >
            <motion.img
              src={logo_home}
              alt="Logo"
              whileTap={{ rotate: -8, scale: 0.95 }}
              className="h-9 w-auto shrink-0"
            />
            <h1 className="text-lg font-bold bg-gradient-to-r from-navy-700 to-sky-500 dark:from-sky-200 dark:to-sky-400 bg-clip-text text-transparent px-3 truncate">
              Hobby Sphere
            </h1>
          </button>
          <div className="flex items-center gap-1">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleSearch}
              aria-label="Search"
              className={`p-2 rounded-full transition-colors ${searchOpen ? "bg-white/50 dark:bg-white/15 text-navy-700 dark:text-sky-200" : "text-navy-700/70 dark:text-sky-200/80 hover:bg-white/30 dark:hover:bg-white/10"
                }`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate("/create")}
              aria-label="Create post"
              className="p-2 rounded-full text-navy-700/70 dark:text-sky-200/80 hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
            >
              <PlusCircleSolid className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        {searchOpen && (
          <div className="px-4 py-2 bg-surface-muted/60">
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
              <XMarkIcon
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
