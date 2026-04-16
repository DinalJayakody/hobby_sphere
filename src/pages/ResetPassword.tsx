import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { StatusModal } from "../components/ui/StatusModal";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  // State for the Status Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");


  /* 🔐 Password rules */
  const rules = useMemo(() => {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
  }, [password]);

  const passedRules = Object.values(rules).filter(Boolean).length;

  const strength = useMemo(() => {
    if (passedRules <= 2) return { label: "Weak", color: "text-red-500" };
    if (passedRules <= 4) return { label: "Medium", color: "text-yellow-500" };
    return { label: "Strong", color: "text-green-600" };
  }, [passedRules]);

  const isValidPassword = passedRules === 5;

  /* 🔁 Submit */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidPassword) {
      setModalStatus("error");
      setModalMessage("Password does not meet all requirements");
      setModalOpen(true);
      return;
    }

    if (password !== confirm) {
      setModalStatus("error");
      setModalMessage("Passwords do not match");
      setModalOpen(true);
      return;
    }

    try {
      await resetPassword(password);

      setModalStatus("success");
      setModalMessage("Password reset successfully!");
      setModalOpen(true);

      // redirect after modal auto-close
      // wait for 3.5s (matching StatusModal default autoCloseMs)
      setTimeout(() => {
        navigate("/login", { state: { resetSuccess: true } });
      }, 3500);

    } catch (err: any) {
      setModalStatus("error");
      setModalMessage(err.response?.data?.message || "Failed to reset password");
      setModalOpen(true);
    }
  };


  const Rule = ({ ok, text }: { ok: boolean; text: string }) => (
    <li className={`flex items-center gap-2 text-sm ${ok ? "text-green-600" : "text-gray-400"}`}>
      <span>{ok ? "✓" : "✕"}</span>
      {text}
    </li>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <Lock className="w-12 h-12 text-sky-500 mb-3" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Create New Password
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            Choose a strong password to secure your account
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {password && (
            <div className="space-y-2">
              <p className={`text-sm font-medium ${strength.color}`}>
                {strength.label}
              </p>
              <ul className="space-y-1">
                <Rule ok={rules.length} text="At least 6 characters" />
                <Rule ok={rules.uppercase} text="At least 1 uppercase letter" />
                <Rule ok={rules.lowercase} text="At least 1 lowercase letter" />
                <Rule ok={rules.number} text="At least 1 number" />
                <Rule ok={rules.special} text="At least 1 special character (!@#$%^&*)" />
              </ul>
            </div>
          )}

          {/* Confirm */}
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading || !isValidPassword}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </motion.div>
      <StatusModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        status={modalStatus}
        message={modalMessage}
      />
    </div>

  );



};

export default ResetPassword;
