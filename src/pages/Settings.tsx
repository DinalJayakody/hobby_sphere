import React, { useState } from "react";
import { Bell, Lock, User, Shield, LogOut, Palette, HelpCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200">
      {/* ✅ HobbySphere Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Settings</h1>

        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Account</h2>

            {/* Profile */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-xl px-2 transition">
              <div className="flex items-center">
                <User className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-gray-700">Edit Profile</span>
              </div>
              <button className="text-sky-600 hover:underline text-sm">Manage</button>
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between py-3 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-xl px-2 transition">
              <div className="flex items-center">
                <Lock className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-gray-700">Private Account</span>
              </div>
              {/* Toggle */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={privateAccount}
                  onChange={() => setPrivateAccount(!privateAccount)}
                />
                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    privateAccount ? "bg-sky-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      privateAccount ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Notifications</h2>

            <div className="flex items-center justify-between py-3 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-xl px-2 transition">
              <div className="flex items-center">
                <Bell className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-gray-700">Push Notifications</span>
              </div>
              {/* Toggle */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                />
                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    notifications ? "bg-sky-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      notifications ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Appearance</h2>

            <div className="flex items-center justify-between py-3 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-xl px-2 transition">
              <div className="flex items-center">
                <Palette className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-gray-700">Dark Mode</span>
              </div>
              {/* Toggle */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    darkMode ? "bg-sky-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Security</h2>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-xl px-2 transition">
              <div className="flex items-center">
                <Shield className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-gray-700">Password & Security</span>
              </div>
              <button className="text-sky-600 hover:underline text-sm">Manage</button>
            </div>

            <div className="flex items-center justify-between py-3 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-50 rounded-xl px-2 transition">
              <div className="flex items-center">
                <HelpCircle className="text-sky-500 w-5 h-5 mr-3" />
                <span className="text-gray-700">Help & Support</span>
              </div>
              <button className="text-sky-600 hover:underline text-sm">Visit</button>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-2xl shadow-lg border border-sky-100 p-5 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition">
            <button className="flex items-center text-red-500 font-semibold hover:text-red-600 transition w-full justify-center">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
