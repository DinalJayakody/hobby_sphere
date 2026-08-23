import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'hobbysphere-theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Screens shown before login always render in light mode, even if the user
// picked dark mode during a previous session — the toggle only applies once
// inside the app. Matched against location.pathname (case-insensitive).
const PUBLIC_LIGHT_ONLY_PATHS = [
  '/welcome',
  '/login',
  '/register',
  '/forgotpassword',
  '/verifycode',
  '/resetpassword',
  '/registersuccess',
  '/privacy',
  '/child-safety',
];

export const isPublicLightOnlyPath = (pathname: string): boolean =>
  PUBLIC_LIGHT_ONLY_PATHS.includes(pathname.toLowerCase());

// Single source of truth for the `dark` class on <html>. Called both on
// theme changes and on route changes (via ThemeRouteSync, rendered inside
// the Router where pathname is available).
export const applyThemeClass = (theme: Theme, pathname: string): void => {
  const isPublic = isPublicLightOnlyPath(pathname);
  document.documentElement.classList.toggle('dark', theme === 'dark' && !isPublic);
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeClass(theme, window.location.pathname);
  }, [theme]);

  // Follow system preference changes, but only until the user picks explicitly.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setThemeState(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, []);

  const setTheme = (next: Theme) => setThemeState(next);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
