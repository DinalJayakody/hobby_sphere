import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import axiosInstance from "../types/axiosInstance";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const VerifyCode: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/api/auth/verify-code", { email, code });
      if (res.status === 200) {
        // ✅ Navigate to reset password page with temp token
        navigate("/ResetPassword", { state: { tempToken: res.data.tempToken } });
      } else {
        // navigate("/ResetPassword");
        setError(res.data?.message || "Invalid code. Try again.");
      }
    } catch (err: any) {
        // navigate("/ResetPassword");
      console.error("Code verification failed:", err);
      setError(err.response?.data?.message || "Invalid code. Please try again.");
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
          <ShieldCheck className="w-12 h-12 text-sky-500 mb-3" />
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Verify Your Email
          </h2>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Enter the 6-digit code sent to <b>{email}</b>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            placeholder="Enter 6-digit code"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyCode;
