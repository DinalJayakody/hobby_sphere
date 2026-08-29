import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Trash2, Globe, Lock, Save } from "lucide-react";
import { deleteGroup, updateGroup } from "../../api/users";
import { useToast } from "../../context/ToastContext";

interface GroupSettingsProps {
  group: any;
  onUpdated?: (updated: any) => void;
}

const GroupSettings: React.FC<GroupSettingsProps> = ({ group, onUpdated }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const groupName = group?.groupName ?? group?.name ?? "this group";
  const currentPrivacy: "PUBLIC" | "PRIVATE" =
    (group?.privacy ?? group?.groupPrivacy) === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  const [name, setName] = useState(groupName === "this group" ? "" : groupName);
  const [description, setDescription] = useState(group?.description ?? "");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">(currentPrivacy);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDirty = name.trim() !== groupName || description !== (group?.description ?? "") || privacy !== currentPrivacy;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Group name can't be empty.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await updateGroup(group.id, { name: name.trim(), description: description.trim(), privacy });
      toast("Group settings saved.", "success");
      onUpdated?.(res.data?.data);
    } catch (err) {
      console.error("Failed to update group:", err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm(`Delete "${groupName}"? All posts, comments, and membership data will be permanently removed. This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteGroup(group.id);
      toast(`"${groupName}" has been deleted.`, "success");
      navigate("/GroupsPage");
    } catch (err) {
      console.error("Failed to delete group:", err);
      toast("Couldn't delete this group. Please try again.", "error");
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-ink mb-1">Group Settings</h3>
          <p className="text-sm text-ink-muted">Edit your group's name, description, and privacy.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-1">Group name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg bg-surface-muted text-ink border border-border text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-surface-muted text-ink border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40"
          />
          <p className="text-xs text-ink-faint mt-1 text-right">{description.length}/300</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Privacy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPrivacy("PUBLIC")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                privacy === "PUBLIC"
                  ? "border-sky-400 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  : "border-border text-ink-muted hover:bg-surface-muted"
              }`}
            >
              <Globe className="w-4 h-4" /> Public
            </button>
            <button
              type="button"
              onClick={() => setPrivacy("PRIVATE")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                privacy === "PRIVATE"
                  ? "border-sky-400 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  : "border-border text-ink-muted hover:bg-surface-muted"
              }`}
            >
              <Lock className="w-4 h-4" /> Private
            </button>
          </div>
          <p className="text-xs text-ink-faint mt-1.5">
            {privacy === "PUBLIC" ? "Anyone can join instantly." : "New members must be approved by an admin."}
          </p>
        </div>

        {error && <p className="text-sm text-coral-500" role="alert">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="border border-coral-200 dark:border-coral-500/30 bg-coral-50 dark:bg-coral-500/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-coral-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-ink">Delete this group</h4>
              <p className="text-sm text-ink-muted mt-0.5">
                Permanently removes the group along with all of its posts, comments, and membership data. This cannot be undone.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting…" : "Delete Group"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
