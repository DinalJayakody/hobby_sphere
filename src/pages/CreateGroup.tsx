// src/components/CreateGroup/index.tsx
import React, { useState } from "react";
// import ImagePicker from "./ImagePicker";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { Shield, Globe, Lock, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import ImagePicker from "../components/layout/ImagePicker";

type FormState = {
  name: string;
  description: string;
  privacy: "PUBLIC" | "PRIVATE";
};

const CreateGroup: React.FC = () => { 
  const navigate = useNavigate();
  const { createGroup } = useData();
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    privacy: "PUBLIC",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Client-side validation
  const validate = (): string | null => {
    if (!form.name.trim()) return "Group name is required";
    if (form.name.trim().length < 3) return "Group name is too short";
    return null;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    try {
      setLoading(true);
      // call DataContext createGroup method (multipart handled there)
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        privacy: form.privacy,
      };

      const result = await createGroup(payload, file);
      // success UX — navigate to new group page or show toast
      // assuming backend returns created group id in result.id
      const groupId = result?.id;
      if (groupId) {
        navigate(`/Group/${groupId}`);
      } else {
        // fallback: go to groups list
        navigate("/GroupsPage");
      }
    } catch (err: any) {
      // better: display a friendly toast or inline error
      console.error("Create group error:", err);
      const message = err?.response?.data?.message || "Failed to create group.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-5 border border-sky-100">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="bg-sky-50 p-2 rounded-md"
          >
            <PlusCircle className="w-6 h-6 text-sky-600" />
          </motion.div>
          <h2 className="text-lg font-semibold text-sky-700">Create Group</h2>
        </div>

        {/* Image picker */}
        <ImagePicker
          defaultSrc={undefined}
          onFileChange={(f) => setFile(f)}
          className="mb-4"
        />

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Group Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter group name"
              className="w-full px-3 py-2 rounded-lg border border-sky-100 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell people what this group is about"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-sky-100 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
            />
          </div>

          {/* Privacy */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Privacy</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-2 rounded-lg border border-sky-100 bg-white hover:bg-sky-50 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={form.privacy === "PUBLIC"}
                  onChange={() => setForm({ ...form, privacy: "PUBLIC" })}
                />
                <div className="ml-2">
                  <div className="text-sm font-medium">Public</div>
                  <div className="text-xs text-gray-500">
                    Anybody can see the group, its members and their posts.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2 rounded-lg border border-sky-100 bg-white hover:bg-sky-50 cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={form.privacy === "PRIVATE"}
                  onChange={() => setForm({ ...form, privacy: "PRIVATE" })}
                />
                <div className="ml-2">
                  <div className="text-sm font-medium">Private</div>
                  <div className="text-xs text-gray-500">
                    Only members can see who's in the group and what they post.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
