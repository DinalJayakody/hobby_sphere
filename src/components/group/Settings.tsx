// src/components/group/Settings.tsx
import React, { useState } from "react";
import { useData } from "../../context/DataContext";

const Settings: React.FC<{ group: any }> = ({ group }) => {
  const { updateGroup } = useData() as any;
  const [name, setName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [privacy, setPrivacy] = useState(group.privacy || "private");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const onSave = async () => {
    const form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.append("privacy", privacy);
    if (coverFile) form.append("image", coverFile);
    try {
      await updateGroup(group.id, form);
      alert("Updated");
      // option: refetch group
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded-xl border border-sky-100 space-y-4">
        <div>
          <label className="text-sm text-gray-600">Group Name</label>
          <input className="w-full mt-1 border rounded px-3 py-2 bg-sky-50" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea className="w-full mt-1 border rounded px-3 py-2 bg-sky-50" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Privacy</label>
          <div className="mt-2 flex gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" checked={privacy === "public"} onChange={() => setPrivacy("public")} /> Public
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={privacy === "private"} onChange={() => setPrivacy("private")} /> Private
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="mt-2" />
        </div>

        <div className="flex justify-end">
          <button onClick={onSave} className="bg-sky-600 text-white px-4 py-2 rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
