// src/pages/CreateGroupPage.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Globe, Lock, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();

  // 🔹 State for group form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"Public" | "Private">("Public");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  // 🔹 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Example API call with FormData
    // const formData = new FormData();
    // formData.append("name", name);
    // formData.append("description", description);
    // formData.append("privacy", privacy);
    // if (coverImage) formData.append("coverImage", coverImage);
    //
    // await fetch("/api/groups", {
    //   method: "POST",
    //   body: formData,
    // });

    setTimeout(() => {
      setLoading(false);
      navigate("/groups"); // redirect back after create
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md p-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/groups")}
          className="p-2 hover:bg-sky-50 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-sky-700" />
        </button>
        <h1 className="text-xl font-bold text-sky-700">Create Group</h1>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-400"
              placeholder="Enter group name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-400"
              placeholder="What's this group about?"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Privacy
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="Public"
                  checked={privacy === "Public"}
                  onChange={() => setPrivacy("Public")}
                  className="accent-sky-600"
                />
                <Globe className="w-4 h-4 text-sky-600" />
                <span>Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="Private"
                  checked={privacy === "Private"}
                  onChange={() => setPrivacy("Private")}
                  className="accent-sky-600"
                />
                <Lock className="w-4 h-4 text-sky-600" />
                <span>Private</span>
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Cover Image
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="coverImageUpload"
              />
              <label
                htmlFor="coverImageUpload"
                className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-sky-50"
              >
                <Upload className="w-5 h-5 text-sky-600" />
                {coverImage ? coverImage.name : "Upload Image"}
              </label>
            </div>
            {coverImage && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg shadow"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white font-medium py-3 rounded-lg shadow hover:bg-sky-700 transition"
          >
            {loading ? "Creating..." : "Create Group"}
          </motion.button>
        </form>
      </div>
    </div>
  );
};
