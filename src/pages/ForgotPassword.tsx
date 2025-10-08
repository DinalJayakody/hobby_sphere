import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from '../components/layout/Navbar';
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import logo_home from "../assets/logo_home.png";

/**
 * This page mimics Instagram’s “Forgot Password” UI but keeps your app’s style.
 * Users enter their email, you call the backend API to send a password reset link.
 * After success, it shows a confirmation message.
 */

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ✅ Example backend endpoint: POST /api/auth/forgot-password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Unable to send reset link. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Top Navbar (Hobby Sphere Style) */}
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-sky-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700"
        >
          {/* Logo / Title */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo_home} alt="Hobby Sphere" className="w-16 h-16 mb-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Trouble logging in?
            </h2>
            <p className="text-gray-500 text-center text-sm mt-2">
              Enter your email and we’ll send you a link to reset your password.
            </p>
          </div>

          {/* ✅ If success → show confirmation */}
          {success ? (
            <div className="text-center">
              <Mail className="w-12 h-12 text-sky-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Check your inbox
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                We’ve sent a password reset link to <b>{email}</b>.
              </p>

              <Button
                onClick={() => navigate("/login")}
                className="mt-6 w-full bg-sky-500 hover:bg-sky-600 text-white"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center mt-2">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          {/* Footer Links */}
          <div className="flex justify-between mt-8 text-sm text-gray-500">
            <Link to="/login" className="flex items-center hover:text-sky-600">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
            </Link>
            <Link to="/register" className="hover:text-sky-600">
              Create new account
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPassword;
