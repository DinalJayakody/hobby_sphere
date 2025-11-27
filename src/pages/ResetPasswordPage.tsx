import React, { useEffect, useState } from "react";
import axiosInstance from "../types/axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * ResetPasswordPage:
 * - reads resetToken from sessionStorage or URL query param
 * - submits new password to backend
 */
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Priority: sessionStorage token (set by verify step), otherwise query param 'token'
    const tsToken = sessionStorage.getItem("resetToken");
    if (tsToken) {
      setToken(tsToken);
      return;
    }
    const params = new URLSearchParams(location.search);
    const q = params.get("token");
    if (q) setToken(q);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token. Please request a new password reset.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // POST to backend to reset password
      // API: POST /api/auth/reset-password { token, newPassword }
      // Response: 200 OK on success
      const res = await axiosInstance.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      if (res.status === 200) {
        // cleanup token
        sessionStorage.removeItem("resetToken");
        // navigate to login or sign-in
        navigate("/login", { replace: true });
      } else {
        setError(res.data?.message || "Unable to reset. Try again.");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.response) setError(err.response.data?.message || "Reset failed.");
      else setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-sky-200 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Set a new password</h2>
        <p className="text-sm text-gray-500 mb-4">
          Create a new secure password for your account.
        </p>

        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
            minLength={8}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 transition"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
