import React, { useState, useEffect } from "react";
import { User, Mail, Save, Lock, Palette, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/modals/LocationPicker";
import axiosInstance from "../types/axiosInstance";
import HobbySelectEditProfileModal from "../components/modals/HobbySelectEditProfile";
import { useModal } from "../context/ModalContext";
import { resolveImageSrc } from "../utils/image";

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: "",
    userName: "",
    email: "",
    bio: "",
    mainHobby: "",
    location: "",
    lat: "",
    lon: "",
  });

  const [previewImage, setPreviewImage] = useState("/default-avatar.svg");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // initial username loaded from server when the form mounts
  const [originalUsername, setOriginalUsername] = useState("");
  

  // inline username check states
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>(""); // message to show below field


  const { showSuccess, showError } = useModal();

  // Populate form with logged-in user data
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        userName: user.username || "",
        email: user.email || "",
        // phone: user.phone || "",
        bio: user.bio || "",
        mainHobby: user.mainHobby || "",
        location: user.location || "",
        lat: "",
        lon: "",
      });

      setOriginalUsername(user.username || "");

      setPreviewImage(resolveImageSrc(user?.profilePicture, "/default-avatar.svg"));
    }
  }, [user]);

  // profileData.username is the controlled input value for username field
  useEffect(() => {
    
    const username = (profileData.userName || "").trim();

    // Reset / short-circuit conditions:
    if (!username) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      setUsernameChecking(false);
      return;
    }

    // If username hasn't changed from original, treat as available (no API call)
    if (username === originalUsername) {
      setUsernameStatus("available");
      setUsernameMessage("");
      setUsernameChecking(false);
      return;
    }

    // Basic client-side validation (optional): only allow certain chars
    const valid = /^[a-zA-Z0-9_.]{3,30}$/.test(username);
    if (!valid) {
      setUsernameStatus("error");
      setUsernameMessage("Use 3–30 letters, numbers, underscores or dots.");
      setUsernameChecking(false);
      return;
    }

    // Debounce: wait 500ms after last change
    setUsernameStatus("checking");
    setUsernameMessage("Checking availability…");
    setUsernameChecking(true);
 
    
    const id = setTimeout(async () => {
      try {
        
        // call your API - adapt path/param to your axiosInstance
        const res = await axiosInstance.get("/api/users/checkUserNameExist", {
          params: { userName: username },
        });

        
        const exists = res.data === true || res.data === "true";

        if (exists) {
          setUsernameStatus("taken");
          setUsernameMessage("Username is already taken.");
        } else {
          setUsernameStatus("available");
          setUsernameMessage("Username is available!");
        }
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameStatus("error");
        setUsernameMessage("Unable to check username. Try again.");
      } finally {
        setUsernameChecking(false);
      }
    }, 500);

    // cleanup on new keystroke or unmount
    return () => clearTimeout(id);
  }, [profileData.userName, originalUsername]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {

    if (usernameStatus === "taken") {

      showError("Username taken", "Please choose another username.");

      return;
    }

    // If usernameStatus is error (validation or network error) you may block or allow continue:
    if (usernameStatus === "error") {
      showError("Error", "Please check the username.");
      return;
    }

    try {

      // If username changed (and you want to call the username-specific endpoint on submit)
      // if (profileData.userName && profileData.userName !== originalUsername) {
      //   // call username API (same as earlier) - optional because we already checked availability
      //   await axiosInstance.get("/api/users/checkUserNameExist", { params: { userName: profileData.userName } });
      //   setOriginalUsername(profileData.userName || "");
      // }

      // Update the rest of profile
      const payload: Record<string, unknown> = {
        fullName: profileData.fullName,
        userName: profileData.userName,
        bio: profileData.bio,
        location: profileData.location,
        mainHobby: profileData.mainHobby,
      };
      if (profileData.lat && profileData.lon) {
        payload.lat = Number(profileData.lat);
        payload.lon = Number(profileData.lon);
      }
      await axiosInstance.put("/api/users/profile", payload);
      showSuccess("Profile Updated!", "Your profile has been successfully updated.");

    } catch (error) {
      console.error("❌ Error updating profile:", error);
      showError("Update failed", "Failed to update profile. Please try again.");

    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200 dark:from-navy-900 dark:to-surface">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Avatar Upload */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative">
            <img
              src={previewImage}
              alt="Avatar"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-surface shadow-lg bg-surface-muted"
            />
            <div
              title="Photo updates are coming soon — this isn't wired up on the backend yet"
              className="absolute bottom-0 right-0 bg-surface-muted text-ink-faint p-2 rounded-full shadow-md cursor-not-allowed border border-border"
            >
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-ink">
            {profileData.fullName}
          </h2>
          <p className="text-xs text-ink-faint mt-1">Photo updates are coming soon</p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface p-4 sm:p-6 rounded-2xl shadow-soft-lg space-y-5 border border-sky-100 dark:border-border"
        >
          {/* Full Name */}
          <div>
            <label className="block text-ink-muted text-sm mb-1">Full Name</label>
            <div className="flex items-center border-2 border-sky-200 dark:border-border rounded-lg p-2 bg-sky-50 dark:bg-surface-muted shadow-sm">
              <User className="text-sky-500 w-5 h-5 mr-2" />
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                className="w-full bg-transparent text-ink placeholder:text-ink-faint outline-none"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* User Name */}
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-medium text-ink-muted">
              Username
            </label>
            <div className="flex items-center border-2 border-sky-200 dark:border-border rounded-lg p-2 bg-sky-50 dark:bg-surface-muted shadow-sm">
              <UserCircle className="text-sky-500 w-5 h-5 mr-2" />
              <div className="mt-1 relative flex-1">
                <input
                  id="username"
                  name="userName"
                  type="text"
                  value={profileData.userName || ""}
                  onChange={handleInputChange}
                  className="w-full bg-transparent text-ink placeholder:text-ink-faint outline-none"
                  aria-describedby="username-status"
                  aria-invalid={usernameStatus === "error" || usernameStatus === "taken"}
                />
              </div>
              {/* Inline spinner while checking */}
              {usernameStatus === "checking" || usernameChecking ? (
                <div className="absolute right-2 top-2">
                  {/* simple spinner (CSS) */}
                  <svg className="animate-spin h-5 w-5 text-sky-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              ) : null}
            </div>

            {/* status message; aria-live so screen readers announce changes */}
            <p
              id="username-status"
              className={`mt-2 text-[13px] ${usernameStatus === "available" ? "text-emerald-600 dark:text-emerald-400" : usernameStatus === "taken" || usernameStatus === "error" ? "text-coral-600 dark:text-coral-400" : "text-ink-faint"}`}
              aria-live="polite"
            >
              {usernameMessage}
            </p>
          </div>


          {/* Email (read-only — not editable via this endpoint) */}
          <div>
            <label className="block text-ink-muted text-sm mb-1">Email</label>
            <div className="flex items-center border-2 border-border rounded-lg p-2 bg-surface-muted shadow-sm">
              <Mail className="text-ink-faint w-5 h-5 mr-2" />
              <input
                type="email"
                name="email"
                value={profileData.email}
                disabled
                className="w-full bg-transparent outline-none text-ink-faint cursor-not-allowed"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-ink-muted text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full border-2 border-sky-200 dark:border-border rounded-lg p-3 shadow-sm outline-none resize-none bg-sky-50 dark:bg-surface-muted text-ink placeholder:text-ink-faint"
              placeholder="Tell something about yourself..."
            />
          </div>

          {/* Main Hobby */}

          <div className="w-full">
            <label className="block text-ink-muted text-sm mb-1">Main Hobby</label>

            <div
              className="flex items-center justify-between border border-sky-300 dark:border-border rounded-lg px-3 py-2 bg-surface shadow-sm cursor-pointer hover:shadow-md transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <div className="flex items-center space-x-2">
                <Palette className="text-sky-500 w-5 h-5" />
                <span className="text-sm text-ink">
                  {profileData.mainHobby || "Select your hobby"}
                </span>
              </div>
            </div>

            <HobbySelectEditProfileModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              profileData={profileData}
              setProfileData={setProfileData}
            />
          </div>

          {/* <HobbySelectEditProfile {...({ profileData, setProfileData } as any)} /> */}


          {/* Location Picker*/}

          <div className="mt-4">
            <LocationPicker
              profileData={profileData}
              setProfileData={setProfileData}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex items-center bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEdit;
