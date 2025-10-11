import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import logo_home from "../assets/logo_home.png";
import axiosInstance from "../types/axiosInstance";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/forgot-password", { email });

      if (response.status === 200) {
        // ✅ Go to Verify Code page and pass email
        navigate("/VerifyCode", { state: { email } });
      } else {
        setError(response.data?.message || "Something went wrong. Try again.");
      }
    } catch (err: any) {
        //  navigate("/VerifyCode", { state: { email } });
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-sky-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col items-center mb-6">
            <img src={logo_home} alt="Hobby Sphere" className="w-16 h-16 mb-3" />
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Trouble logging in?
            </h2>
            <p className="text-gray-500 text-center text-sm mt-2">
              Enter your email and we’ll send you a code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>

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
