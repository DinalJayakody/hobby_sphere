import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import * as settingsApi from '../api/settings';
import { UserSettingsDto, UpdateSettingsRequest } from '../api/settings';

interface AccountSettingsContextType {
  settings: UserSettingsDto | null;
  loading: boolean;
  updateSettings: (payload: UpdateSettingsRequest) => Promise<boolean>;
}

const AccountSettingsContext = createContext<AccountSettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettingsDto = {
  darkThemeEnabled: false,
  profileVisibility: 'PUBLIC',
  locationVisible: true,
  defaultPostPrivacy: 'PUBLIC',
};

/**
 * Account-level settings that live on the backend (user-service's
 * SettingsController — the newer, canonical settings store; it folds in
 * dark-theme too, superseding the older /users/preferences/theme endpoint).
 * Fetched once per login and kept in sync with ThemeContext so dark mode
 * persists across devices/re-logins, not just this browser's localStorage.
 */
export const AccountSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettingsDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    settingsApi
      .getSettings()
      .then((res) => {
        if (cancelled) return;
        const fetched = res.data.data;
        setSettings(fetched);
        // Backend is the source of truth once loaded — reconcile the
        // locally-applied (localStorage-guessed) theme against it so dark
        // mode set on one device shows up after logging in on another.
        const fetchedTheme = fetched.darkThemeEnabled ? 'dark' : 'light';
        if (fetchedTheme !== theme) setTheme(fetchedTheme);
      })
      .catch((err) => {
        console.error('Failed to fetch account settings:', err);
        if (!cancelled) setSettings(DEFAULT_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateSettings = async (payload: UpdateSettingsRequest): Promise<boolean> => {
    const previous = settings;
    // Optimistic update
    setSettings((prev) => (prev ? { ...prev, ...payload } : prev));
    if (payload.darkThemeEnabled !== undefined) {
      setTheme(payload.darkThemeEnabled ? 'dark' : 'light');
    }
    try {
      const res = await settingsApi.updateSettings(payload);
      setSettings(res.data.data);
      return true;
    } catch (err) {
      console.error('Failed to update account settings:', err);
      if (previous) {
        setSettings(previous);
        setTheme(previous.darkThemeEnabled ? 'dark' : 'light');
      }
      return false;
    }
  };

  return (
    <AccountSettingsContext.Provider value={{ settings, loading, updateSettings }}>
      {children}
    </AccountSettingsContext.Provider>
  );
};

export const useAccountSettings = (): AccountSettingsContextType => {
  const ctx = useContext(AccountSettingsContext);
  if (!ctx) throw new Error('useAccountSettings must be used within an AccountSettingsProvider');
  return ctx;
};
