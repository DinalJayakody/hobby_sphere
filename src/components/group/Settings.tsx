import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteGroup } from "../../api/users";
import { useToast } from "../../context/ToastContext";

const GroupSettings: React.FC<{ group: any }> = ({ group }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const groupName = group?.groupName ?? group?.name ?? "this group";

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
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Group Settings</h3>
        <p className="text-sm text-ink-muted">Manage this group's lifecycle.</p>
      </div>

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
  );
};

export default GroupSettings;
