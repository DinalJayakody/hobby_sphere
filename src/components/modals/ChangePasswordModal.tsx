import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useToast } from "../../context/ToastContext";
import * as settingsApi from "../../api/settings";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_LENGTH = 6;
const MAX_LENGTH = 40;

// The real "change my password while logged in" flow — direct current
// password verification via POST /api/settings/change-password, not the
// email-OTP forgot-password detour Settings used to send people through.
const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset to a clean slate every time the modal is (re)opened, rather than
  // showing whatever was left over from a previous open/cancel.
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, submitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < MIN_LENGTH || newPassword.length > MAX_LENGTH) {
      setError(`New password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSubmitting(true);
    try {
      await settingsApi.changePassword({ currentPassword, newPassword });
      toast("Password changed successfully.", "success");
      onClose();
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Couldn't change your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-raised rounded-2xl shadow-soft-lg w-full max-w-sm overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Change Password"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-sky-500" />
                <h3 className="text-lg font-semibold text-ink">Change Password</h3>
              </div>
              <button
                onClick={() => !submitting && onClose()}
                aria-label="Close"
                className="text-ink-faint hover:text-ink hover:bg-surface-muted rounded-full p-1.5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5">
              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrent}
                onToggleVisible={() => setShowCurrent((v) => !v)}
                autoComplete="current-password"
                autoFocus
              />
              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNew}
                onToggleVisible={() => setShowNew((v) => !v)}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirm}
                onToggleVisible={() => setShowConfirm((v) => !v)}
                autoComplete="new-password"
              />

              {error && (
                <p className="text-sm text-coral-500 -mt-2 mb-3" role="alert">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  disabled={submitting}
                  onClick={() => onClose()}
                >
                  Cancel
                </Button>
                <Button type="submit" fullWidth loading={submitting}>
                  {submitting ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  autoComplete: string;
  autoFocus?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  autoComplete,
  autoFocus,
}) => (
  <div className="relative">
    <Input
      type={visible ? "text" : "password"}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      fullWidth
      className="pr-10"
    />
    <button
      type="button"
      onClick={onToggleVisible}
      tabIndex={-1}
      className="absolute right-3 top-[34px] text-ink-faint hover:text-sky-500 transition"
      aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
    >
      {visible ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
    </button>
  </div>
);

export default ChangePasswordModal;
