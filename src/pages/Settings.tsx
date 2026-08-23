import React, { useState } from "react";
import { Bell, User, Shield, LogOut, Palette, FileText, Eye, MapPin, Globe, UserX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useAccountSettings } from "../context/AccountSettingsContext";
import { usePreferences } from "../context/PreferencesContext";
import { ProfileVisibility, PostPrivacyPreference } from "../api/settings";
import { useToast } from "../context/ToastContext";

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08 },
  }),
};

interface ToggleRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: () => void;
  hint?: string;
  border?: boolean;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ icon: Icon, label, checked, onChange, hint, border, disabled }) => (
  <div className={`flex items-center justify-between py-3 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-2 transition ${border ? "border-b border-border" : ""}`}>
    <div className="flex items-center">
      <Icon className="text-sky-500 w-5 h-5 mr-3 shrink-0" />
      <div>
        <span className="text-ink">{label}</span>
        {hint && <p className="text-xs text-ink-faint mt-0.5">{hint}</p>}
      </div>
    </div>
    <label className={`inline-flex items-center shrink-0 ml-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${checked ? "bg-sky-500" : "bg-gray-300 dark:bg-surface-muted"}`}>
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </div>
    </label>
  </div>
);

interface SelectRowProps<T extends string> {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  hint?: string;
  border?: boolean;
  disabled?: boolean;
}

function SelectRow<T extends string>({ icon: Icon, label, value, options, onChange, hint, border, disabled }: SelectRowProps<T>) {
  return (
    <div className={`flex items-center justify-between py-3 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-2 transition ${border ? "border-b border-border" : ""}`}>
      <div className="flex items-center min-w-0">
        <Icon className="text-sky-500 w-5 h-5 mr-3 shrink-0" />
        <div className="min-w-0">
          <span className="text-ink">{label}</span>
          {hint && <p className="text-xs text-ink-faint mt-0.5">{hint}</p>}
        </div>
      </div>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="ml-3 shrink-0 text-sm bg-surface-muted text-ink border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

const PROFILE_VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "FOLLOWERS_ONLY", label: "Followers Only" },
  { value: "PRIVATE", label: "Private" },
];

const POST_PRIVACY_OPTIONS: { value: PostPrivacyPreference; label: string }[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "FRIENDS_ONLY", label: "Friends Only" },
  { value: "PRIVATE", label: "Private" },
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { clearData } = useData();
  const { toast } = useToast();
  const { settings, updateSettings } = useAccountSettings();
  const { pushNotificationsEnabled, setPushNotificationsEnabled } = usePreferences();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    clearData();
    navigate("/login");
  };

  const apply = async (key: string, payload: Parameters<typeof updateSettings>[0]) => {
    setSavingKey(key);
    const ok = await updateSettings(payload);
    setSavingKey(null);
    if (!ok) toast("Couldn't save that setting. Please try again.", "error");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 dark:from-navy-900 dark:to-surface">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-ink mb-6"
        >
          ⚙️ Settings
        </motion.h1>

        <div className="space-y-6">
          {/* Account Section */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5 hover:shadow-soft-lg transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-ink-muted mb-3">Account</h2>

            <button
              onClick={() => navigate("/ProfileEdit")}
              className="flex items-center justify-between py-3 border-b border-border hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-2 transition w-full text-left"
            >
              <div className="flex items-center">
                <User className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-ink">Edit Profile</span>
              </div>
              <span className="text-sky-600 dark:text-sky-400 text-sm">Manage</span>
            </button>

            <SelectRow
              icon={Eye}
              label="Profile Visibility"
              hint="Who can see your profile and posts."
              value={settings?.profileVisibility ?? "PUBLIC"}
              options={PROFILE_VISIBILITY_OPTIONS}
              onChange={(value) => apply("profileVisibility", { profileVisibility: value })}
              disabled={savingKey === "profileVisibility" || !settings}
              border
            />

            <ToggleRow
              icon={MapPin}
              label="Show Location on Profile"
              checked={settings?.locationVisible ?? true}
              onChange={() => apply("locationVisible", { locationVisible: !(settings?.locationVisible ?? true) })}
              disabled={savingKey === "locationVisible" || !settings}
              border
            />

            <button
              onClick={() => navigate("/Settings/BlockedUsers")}
              className="flex items-center justify-between py-3 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-2 transition w-full text-left"
            >
              <div className="flex items-center">
                <UserX className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-ink">Blocked Accounts</span>
              </div>
              <span className="text-sky-600 dark:text-sky-400 text-sm">Manage</span>
            </button>
          </motion.div>

          {/* Posting Section */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5 hover:shadow-soft-lg transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-ink-muted mb-3">Posting</h2>

            <SelectRow
              icon={Globe}
              label="Default Post Privacy"
              hint="Applied to new posts unless you change it at creation time."
              value={settings?.defaultPostPrivacy ?? "PUBLIC"}
              options={POST_PRIVACY_OPTIONS}
              onChange={(value) => apply("defaultPostPrivacy", { defaultPostPrivacy: value })}
              disabled={savingKey === "defaultPostPrivacy" || !settings}
            />
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5 hover:shadow-soft-lg transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-ink-muted mb-3">Notifications</h2>

            <ToggleRow
              icon={Bell}
              label="Push Notifications"
              hint="Turns off notification polling on this device."
              checked={pushNotificationsEnabled}
              onChange={() => setPushNotificationsEnabled(!pushNotificationsEnabled)}
            />
          </motion.div>

          {/* Appearance Section */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5 hover:shadow-soft-lg transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-ink-muted mb-3">Appearance</h2>

            <ToggleRow
              icon={Palette}
              label="Dark Mode"
              hint="Syncs to your account — stays on next time you log in, on any device."
              checked={settings?.darkThemeEnabled ?? false}
              onChange={() => apply("darkThemeEnabled", { darkThemeEnabled: !(settings?.darkThemeEnabled ?? false) })}
              disabled={savingKey === "darkThemeEnabled" || !settings}
            />
          </motion.div>

          {/* Security Section */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5 hover:shadow-soft-lg transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-ink-muted mb-3">Security</h2>

            <button
              onClick={() => navigate("/ForgotPassword", { state: { email: user?.email } })}
              className="flex items-center justify-between py-3 border-b border-border hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-2 transition w-full text-left"
            >
              <div className="flex items-center">
                <Shield className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-ink">Password &amp; Security</span>
              </div>
              <span className="text-sky-600 dark:text-sky-400 text-sm">Change</span>
            </button>

            <Link
              to="/privacy"
              className="flex items-center justify-between py-3 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl px-2 transition"
            >
              <div className="flex items-center">
                <FileText className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-ink">Privacy Policy</span>
              </div>
              <span className="text-sky-600 dark:text-sky-400 text-sm">View</span>
            </Link>
          </motion.div>

          {/* Logout */}
          <motion.div
            custom={5}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="bg-surface rounded-2xl shadow-soft border border-border p-4 sm:p-5 hover:bg-coral-50 dark:hover:bg-coral-500/10 transition"
          >
            <button onClick={handleLogout} className="flex items-center text-coral-500 font-semibold hover:text-coral-600 transition w-full justify-center">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
