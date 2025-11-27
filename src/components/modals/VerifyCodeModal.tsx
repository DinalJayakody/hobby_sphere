import React, { useState } from "react";
import axiosInstance from "../../types/axiosInstance"; // adjust path
import { X } from "lucide-react";

/**
 * VerifyCodeModal props:
 * - email: the email used to request reset
 * - onVerified(resetToken): called when backend returns a reset token
 * - onClose(): close modal
 * - resendCooldown: number | null (seconds remaining)
 * - onResend(): function to call to resend code
 */
interface Props {
  email: string;
  onVerified: (resetToken: string) => void;
  onClose: () => void;
  resendCooldown?: number | null;
  onResend?: () => Promise<void>;
}

const VerifyCodeModal: React.FC<Props> = ({ email, onVerified, onClose, resendCooldown, onResend }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    if (!code.trim()) {
      setError("Please enter the code you received.");
      return;
    }
    setLoading(true);
    try {
      // POST to backend to verify code and get a reset token
      // API: POST /api/auth/verify-reset-code { email, code }
      // Response: { resetToken: "short-lived-token" }
      const res = await axiosInstance.post("/api/auth/verify-reset-code", { email, code });

      if (res.status === 200 && res.data?.resetToken) {
        const token = res.data.resetToken;
        // IMPORTANT: token should be one-time, short-lived
        onVerified(token);
      } else {
        setError(res.data?.message || "Invalid code. Please try again.");
      }
    } catch (err: any) {
      console.error("Verify code error:", err);
      if (err.response) {
        setError(err.response.data?.message || "Invalid code or expired.");
      } else {
        setError("Network error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal panel */}
      <div className="relative bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[420px] p-6 shadow-xl z-60">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Enter code</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-sky-50">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it here to proceed.
        </p>

        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

        <div className="mb-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={8}
            placeholder="Enter code"
            className="w-full px-4 py-3 border rounded-lg text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="flex-1 bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            onClick={onResend}
            disabled={Boolean(resendCooldown)}
            className="px-4 py-2 rounded-lg border text-sky-600 hover:bg-sky-50 transition"
          >
            {resendCooldown ? `Resend (${resendCooldown}s)` : "Resend"}
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Didn't receive the email? Check spam or try resending. This code expires in 10 minutes.
        </p>
      </div>
    </div>
  );
};

export default VerifyCodeModal;
