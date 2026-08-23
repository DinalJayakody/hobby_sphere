import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import logo from '../assets/logo_home.png';
import Button from '../components/ui/Button';
import { User, AtSign, Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { TermsOfServiceModal } from '../components/modals/TermsOfServiceModal';
import FloatingBlobs from '../components/ui/FloatingBlobs';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { loading, savePartialRegistration } = useAuth();

  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState('');
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setStrength(checkStrength(value));
    }

    if (name === "username") {
      checkUsernameAvailability(value);
    }
  };

  const checkStrength = (pwd: string) => {
    const strongRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    const mediumRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (strongRegex.test(pwd)) return 'Strong';
    if (mediumRegex.test(pwd)) return 'Medium';
    return 'Weak';
  };

  const getColor = () => {
    switch (strength) {
      case 'Strong': return 'bg-emerald-500';
      case 'Medium': return 'bg-amber-400';
      default: return 'bg-coral-500';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (usernameStatus === 'taken') newErrors.username = 'Username is already taken';
    if (usernameStatus === 'invalid') newErrors.username = usernameMessage;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password) {
      const failedHints = passwordHints.filter((h) => !h.test(formData.password));
      if (failedHints.length > 0) {
        newErrors.password = `Password must satisfy all hints given`;
      }
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // NOTE: /api/users/checkUserNameExist requires a valid JWT (confirmed via
  // a direct 401 test) — it can never be called successfully from this
  // screen, since Register runs before the user has any token. ProfileEdit
  // can use the live version of this check because that screen is only
  // reachable once already logged in. Here we're limited to client-side
  // format validation; true uniqueness is still enforced by the backend at
  // final submit (see the duplicate-username/email handling in AuthContext).
  const checkUsernameAvailability = (username: string) => {
    const trimmed = username.trim();

    if (!trimmed) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    const valid = /^[a-zA-Z0-9_.]{3,30}$/.test(trimmed);
    if (!valid) {
      setUsernameStatus("invalid");
      setUsernameMessage("Use 3–30 letters, numbers, underscores, or dots.");
    } else {
      setUsernameStatus("idle");
      setUsernameMessage("");
    }
  };

  const passwordHints = [
    { label: "At least 6 characters", test: (pwd: string) => pwd.length >= 6 },
    { label: "At least 1 uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "At least 1 lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "At least 1 number", test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: "At least 1 special character (!@#$%^&*)", test: (pwd: string) => /[!@#$%^&*]/.test(pwd) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    savePartialRegistration({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    navigate('/profilesetup');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Grid - Animated Background (2/3) */}
      <div className="hidden lg:flex lg:w-2/3 relative">
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-600/90 to-sky-500/90"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center justify-center h-full text-white p-12">
            <h1 className="text-6xl font-bold mb-8 animate-fade-in">Join Hobby Sphere</h1>
            <p className="text-2xl text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>Start sharing your passions with the world</p>

            <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
                <p className="text-base opacity-90">Showcase your interests and expertise to the community</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-xl font-semibold mb-3">Connect & Share</h3>
                <p className="text-base opacity-90">Find and follow other enthusiasts who share your interests</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-semibold mb-3">Share Your Journey</h3>
                <p className="text-base opacity-90">Post updates and progress about your hobby adventures</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 hover:bg-white/20 animate-fade-in animate-float" style={{ animationDelay: '0.6s' }}>
                <h3 className="text-xl font-semibold mb-3">Learn & Grow</h3>
                <p className="text-base opacity-90">Discover tips and techniques from experienced members</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Grid - Register Form (1/3) */}
      <div className="relative w-full lg:w-1/3 flex items-center justify-center px-4 py-10 sm:p-8 bg-gradient-to-br from-navy-50 to-sky-400 dark:from-navy-900 dark:to-navy-700 overflow-hidden">
        <FloatingBlobs />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-sky-100/30 dark:bg-surface/40 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 transform hover:scale-[1.01] transition-transform duration-300 animate-pulse-glow">
            <div className="flex flex-col items-center justify-center text-center mb-8 animate-fade-in">
              <img
                src={logo}
                alt="Hobby Sphere Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 mb-4 animate-bounce-slow"
              />
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-navy-600 to-sky-500 bg-clip-text text-transparent mb-3">Join Hobby Sphere</h2>
              <p className="text-ink-muted">Join our community today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  className="pl-10"
                  fullWidth
                />
              </div>

              <div className="relative">
                <AtSign className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  className="pl-10"
                  fullWidth
                />
                {usernameStatus !== "idle" && (
                  <p
                    className={`text-xs mt-1 ${usernameStatus === "available"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : usernameStatus === "taken" || usernameStatus === "invalid"
                          ? "text-coral-600 dark:text-coral-400"
                          : "text-ink-muted"
                      }`}
                  >
                    {usernameMessage}
                  </p>
                )}
              </div>

              <div className="relative">
                <Mail className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  className="pl-10"
                  fullWidth
                />
              </div>

              <div className="relative">
                <Lock className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocused(true)}
                  error={errors.password}
                  className="pl-10 pr-10"
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3 text-ink-faint hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {focused && strength && (
                  <div className="flex items-center mt-2 space-x-2">
                    <div className={`w-4 h-4 rounded-full ${getColor()}`} />
                    <span className="text-sm font-medium text-ink-muted">{strength}</span>
                  </div>
                )}

                {focused && (
                  <div className="mt-3 text-sm space-y-1">
                    {passwordHints.map((hint, index) => {
                      const passed = hint.test(formData.password);
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-coral-500"}`}>
                            {passed ? "✓" : "✕"}
                          </span>
                          <span className={passed ? "text-emerald-700 dark:text-emerald-400" : "text-ink-muted"}>
                            {hint.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute top-3 left-3 text-ink-faint w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="pl-10 pr-10"
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3 text-ink-faint hover:text-ink"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="form-checkbox text-navy-600 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-ink-muted">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-navy-600 dark:text-sky-400 hover:underline"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-600 dark:text-sky-400 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
                {errors.terms && <p className="text-xs mt-1 text-coral-500">{errors.terms}</p>}

                <TermsOfServiceModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
                className="py-3 text-md rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {loading ? 'Creating Account...' : 'Continue'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-sky-200/60 dark:border-border"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-4 bg-sky-100/70 dark:bg-surface text-ink-muted">
                    Or continue with
                  </span>
                </div>
              </div>

              <SocialAuthButtons />
            </form>

            <div className="mt-6 text-center">
              <p className="text-ink-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-navy-600 dark:text-sky-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
