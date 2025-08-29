import React, { useState } from "react";
import { User, Mail, Phone, Globe, Save, Upload } from "lucide-react";
import Navbar from "../components/layout/Navbar";

const ProfileEdit: React.FC = () => {
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+94 71 234 5678",
    website: "https://mywebsite.com",
    bio: "Passionate about coding, design, and coffee ☕",
    avatar: "/default-avatar.png",
  });

  const [previewImage, setPreviewImage] = useState(profileData.avatar);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      setPreviewImage(fileUrl);
      setProfileData((prev) => ({
        ...prev,
        avatar: fileUrl,
      }));
    }
  };

  const handleSave = () => {
    console.log("Profile saved:", profileData);
    alert("✅ Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-sky-200">
      {/* ✅ HobbySphere Navbar */}
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

          {/* Website */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Website</label>
            <div className="flex items-center border-2 border-sky-200 rounded-lg p-2 bg-sky-50 shadow-sm">
              <Globe className="text-sky-500 w-5 h-5 mr-2" />
              <input
                type="text"
                name="website"
                value={profileData.website}
                onChange={handleInputChange}
                className="w-full bg-transparent outline-none"
                placeholder="Enter your website"
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
