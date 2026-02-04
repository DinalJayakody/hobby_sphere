import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, RotateCcw } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes

const VerifyCode: React.FC = () => {
  const navigate = useNavigate();
  const { verifyResetCode, forgotPassword, forgotEmail, loading } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(OTP_EXPIRY_SECONDS);
  const [resending, setResending] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  /* 🔒 Route guard */
  useEffect(() => {
    if (!forgotEmail) {
      navigate("/forgot-password");
    }
  }, [forgotEmail, navigate]);

  /* ⏱ Countdown timer */
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* 🧮 Format timer mm:ss */
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* 🔢 Handle single OTP input */
  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ⌨️ Handle backspace */
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* 📋 Handle paste OTP */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);

    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted.split("").concat(
      Array(OTP_LENGTH - pasted.length).fill("")
    );
    setOtp(newOtp);

    inputsRef.current[pasted.length - 1]?.focus();
  };

  /* ✅ Verify OTP */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    try {
      await verifyResetCode(code);
      navigate("/ResetPassword");
    } catch (err: any) {
      navigate("/ResetPassword");
      setError(err.response?.data?.message || "Invalid or expired code");
    }
  };

  /* 🔁 Resend OTP */
  const handleResend = async () => {
    if (!forgotEmail) return;

    try {
      setResending(true);
      await forgotPassword(forgotEmail);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(OTP_EXPIRY_SECONDS);
      setError("");
      inputsRef.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="w-12 h-12 text-sky-500 mb-3" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Verify your email
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            Enter the 6-digit code sent to
            <br />
            <b className="text-gray-700">{forgotEmail}</b>
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div
            className="flex justify-between gap-2"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-12 h-14 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verifying..." : "Verify Code"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">
              Code expires in{" "}
              <span className="font-medium text-gray-700">
                {formatTime(timer)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-red-500">
              Code expired. Please resend.
            </p>
          )}

          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-sky-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            {resending ? "Resending..." : "Resend code"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyCode;
