import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Wallet, ArrowLeft } from "lucide-react";
import { signupStyles } from "../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const fetchProfile = async (token) => {
  const res = await axios.get(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const Signup = ({ onSignup, persistAuth }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, { name, email, password });

      const data = res.data || {};
      const token = data.token ?? null;
      let profile = data.user ?? null;
      if (!profile) {
        const copy = { ...data };
        delete copy.token;
        delete copy.user;
        if (Object.keys(copy).length) profile = copy;
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (fetchErr) {
          console.warn("Could not fetch profile after signup token:", fetchErr);
          profile = null;
        }
      }

      if (!profile) profile = { name, email };

      if (typeof persistAuth === "function") {
        persistAuth(profile, token, rememberMe);
      }

      if (typeof onSignup === "function") {
        try {
          onSignup(profile, rememberMe, token);
        } catch (callErr) {
          console.warn("onSignup threw:", callErr);
          navigate("/");
        }
      } else {
        navigate("/");
      }
      setPassword("");
    } catch (err) {
      console.error("Signup error:", err?.response || err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.message || "An unexpected error occurred" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>
        <div className={signupStyles.header}>
          <Link to="/login" className={signupStyles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div className={signupStyles.avatar}>
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className={signupStyles.headerTitle}>Create Account</h1>
          <p className={signupStyles.headerSubtitle}>Start tracking your finances</p>
        </div>

        <div className={signupStyles.formContainer}>
          {errors.api && <p className={signupStyles.apiError}>{errors.api}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className={signupStyles.label}>Full Name</label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${signupStyles.input} ${errors.name ? "border-red-300" : "border-gray-200"}`}
                  placeholder="Your full name"
                />
              </div>
              {errors.name && <p className={signupStyles.fieldError}>{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className={signupStyles.label}>Email</label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${signupStyles.input} ${errors.email ? "border-red-300" : "border-gray-200"}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className={signupStyles.fieldError}>{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className={signupStyles.label}>Password</label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${signupStyles.passwordInput} ${errors.password ? "border-red-300" : "border-gray-200"}`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className={signupStyles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className={signupStyles.fieldError}>{errors.password}</p>}
            </div>

            <div className={signupStyles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={signupStyles.checkbox}
                id="remember-me-signup"
              />
              <label htmlFor="remember-me-signup" className={signupStyles.checkboxLabel}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${signupStyles.button} ${isLoading ? signupStyles.buttonDisabled : ""}`}
            >
              {isLoading ? (
                <>
                  <svg className={signupStyles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className={signupStyles.signInContainer}>
            <span className={signupStyles.signInText}>Already have an account? </span>
            <Link to="/login" className={signupStyles.signInLink}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
