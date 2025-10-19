import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Globe, Save, Upload } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/modals/LocationPicker";
import axiosInstance from "../types/axiosInstance";

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    // profilePicture: "",
    lat: "",
    lon: "",
  });

  const [previewImage, setPreviewImage] = useState("/default-avatar.png");

  // Populate form with logged-in user data
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        userName: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        lat: user.lat,
        lon: user.lan,
        // profilePicture: user.profilePicture || "/default-avatar.png",
      });

      const imageSrcedit = user?.profilePicture ? `data:image/png;base64,${user.profilePicture}` : "";

      setPreviewImage(imageSrcedit || "/default-avatar.png");
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setPreviewImage(fileUrl);
      setProfileData((prev) => ({ ...prev, avatar: fileUrl }));
    }
  };

const handleSave = async () => {
  try {
    console.log("Profile saved:", profileData);

    // 🧭 Convert lat/lon to strings (only if they exist)
    // const payload = {
    //   ...profileData,
    //   lat: profileData.lat !== undefined && profileData.lat !== null
    //     ? String(profileData.lat)
    //     : "",
    //   lon: profileData.lon !== undefined && profileData.lon !== null
    //     ? String(profileData.lon)
    //     : "",
    // };

    // console.log("Payload to backend:", payload);

    const response = await axiosInstance.put("/api/users/profile", profileData);

    alert("✅ Profile updated successfully!");
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    alert("Failed to update profile. Please try again.");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={previewImage}
              alt="Avatar"
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow-md cursor-pointer transition"
            >
              <Upload className="w-4 h-4" />
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-gray-800">
            {profileData.fullName}
          </h2>
        </div>

        {/* Form Fields */}
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-5 border border-sky-100">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Full Name</label>
            <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
              <User className="text-sky-500 w-5 h-5 mr-2" />
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* User Name */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">User Name</label>
            <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
              <User className="text-sky-500 w-5 h-5 mr-2" />
              <input
                type="text"
                name="userName"
                value={profileData.userName}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Email</label>
            <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
              <Mail className="text-sky-500 w-5 h-5 mr-2" />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Phone</label>
            <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
              <Phone className="text-sky-500 w-5 h-5 mr-2" />
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full border-2 border-sky-200 rounded-lg p-3 shadow-sm outline-none resize-none bg-sky-50"
              placeholder="Tell something about yourself..."
            />
          </div>

          {/* Location Picker*/}

          <div className="mt-4">
            <LocationPicker
              profileData={profileData}
              setProfileData={setProfileData}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
