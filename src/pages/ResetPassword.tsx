import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import axiosInstance from "../types/axiosInstance";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tempToken = location.state?.tempToken;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/reset-password", {
        tempToken,
        newPassword: password,
      });
      if (res.status === 200) {
        navigate("/login", { state: { resetSuccess: true } });
      } else {
        setError(res.data?.message || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <Lock className="w-12 h-12 text-sky-500 mb-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Create New Password
          </h2>
          <p className="text-gray-500 text-sm text-center mt-2">
            Choose a strong password you can remember.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
          />
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm Password"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
