import React, { createContext, useContext, useState, ReactNode } from 'react';

const PUSH_KEY = 'hobbysphere-push-notifications';

const readBool = (key: string, fallback: boolean): boolean => {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
};

interface PreferencesContextType {
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: (value: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

/**
 * Client-only preferences with no backend equivalent at all (confirmed: no
 * preference/settings endpoint on notification-service). Account-level
 * settings that DO have a backend (dark theme, profile visibility, location
 * visibility, default post privacy) live in AccountSettingsContext instead.
 */
export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pushNotificationsEnabled, setPushState] = useState(() => readBool(PUSH_KEY, true));

  const setPushNotificationsEnabled = (value: boolean) => {
    setPushState(value);
    localStorage.setItem(PUSH_KEY, String(value));
  };

  return (
    <PreferencesContext.Provider value={{ pushNotificationsEnabled, setPushNotificationsEnabled }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within a PreferencesProvider');
  return ctx;
};
