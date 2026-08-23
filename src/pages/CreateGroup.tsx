// src/components/CreateGroup/index.tsx
import React, { useState } from "react";
// import ImagePicker from "./ImagePicker";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import ImagePicker from "../components/layout/ImagePicker";
import Navbar from "../components/layout/Navbar";
import { useModal } from "../context/ModalContext";

type FormState = {
  name: string;
  description: string;
  privacy: "PUBLIC" | "PRIVATE";
};

const CreateGroup: React.FC = () => { 
  const navigate = useNavigate();
  const { createGroup } = useData();
  const { showError } = useModal();
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
      showError("Check your details", err);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        privacy: form.privacy,
      };

      const result = await createGroup(payload, file);
      const groupId = result?.groupId ?? result?.id;
      if (groupId) {
        navigate(`/Group/${groupId}`);
      } else {
        navigate("/GroupsPage");
      }
    } catch (err: any) {
      console.error("Create group error:", err);
      const message = err?.response?.data?.message || "Something went wrong on our end creating the group. Please try again shortly.";
      showError("Couldn't create group", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-navy-900 dark:to-surface">
      <Navbar />
      <div className="max-w-xl mx-auto px-3 sm:px-4 pt-16 pb-24 md:pt-20 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-surface rounded-2xl shadow-soft-lg p-4 sm:p-5 border border-sky-100 dark:border-border"
        >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            className="bg-sky-50 dark:bg-sky-500/10 p-2 rounded-md"
          >
            <PlusCircle className="w-6 h-6 text-sky-600" />
          </motion.div>
          <h2 className="text-lg font-semibold text-sky-700 dark:text-sky-400">Create Group</h2>
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
            <label className="block text-ink-muted text-sm mb-1">Group Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter group name"
              className="w-full px-3 py-2 rounded-lg border border-sky-100 dark:border-border bg-sky-50 dark:bg-surface-muted text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-ink-muted text-sm mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell people what this group is about"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-sky-100 dark:border-border bg-sky-50 dark:bg-surface-muted text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500/40 text-sm"
            />
          </div>

          {/* Privacy */}
          <div>
            <p className="text-sm font-medium text-ink-muted mb-2">Privacy</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 p-2 rounded-lg border border-sky-100 dark:border-border bg-surface hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={form.privacy === "PUBLIC"}
                  onChange={() => setForm({ ...form, privacy: "PUBLIC" })}
                />
                <div className="ml-2">
                  <div className="text-sm font-medium text-ink">Public</div>
                  <div className="text-xs text-ink-faint">
                    Anybody can see the group, its members and their posts.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2 rounded-lg border border-sky-100 dark:border-border bg-surface hover:bg-sky-50 dark:hover:bg-sky-500/10 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={form.privacy === "PRIVATE"}
                  onChange={() => setForm({ ...form, privacy: "PRIVATE" })}
                />
                <div className="ml-2">
                  <div className="text-sm font-medium text-ink">Private</div>
                  <div className="text-xs text-ink-faint">
                    Only members can see who's in the group and what they post.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Group"}
            </motion.button>
          </div>
        </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateGroup;
